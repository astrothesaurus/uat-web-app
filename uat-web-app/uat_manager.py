import logging
import os
from threading import Lock

import requests
from flask import abort

from data_generator import build_html_list
from uat_transform import process_rdf_file

logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fetch_url(url, error_message):
    """
    Sends a GET request to the specified URL and handles errors.
    Args:
        url (str): The URL to fetch.
        error_message (str): The error message to log and include in the response if the request fails.
    Returns:
        dict: The parsed JSON data from the HTTP response if the request is successful.
    Raises:
        werkzeug.exceptions.HTTPException: If the request fails, aborts with the corresponding HTTP status code.
    """
    response = requests.get(url)
    if response.status_code == 200:
        return response
    else:
        logging.error(error_message)
        abort(response.status_code, description=error_message)


def get_latest_uat_tag():
    """
    Retrieves the latest release tag of the Unified Astronomy Thesaurus (UAT) from the GitHub API.
    Returns:
        str: The latest release tag name.
    Raises:
        werkzeug.exceptions.HTTPException: If the request fails or the response contains invalid JSON.
    """
    url = os.getenv("UAT_API_URL", "https://api.github.com/repos/astrothesaurus/UAT/releases/latest")
    error_message = "Failed to fetch the UAT latest release version from " + url
    response = fetch_url(url, error_message)
    try:
        return response.json().get("tag_name")
    except ValueError as e:
        logging.error(f"JSON decoding error: {e}")
        abort(500, description="Invalid JSON response from api github server")

def build_html_tree(hierarchy_data):
    """
    Builds an HTML representation of the UAT hierarchy.
    Args:
        hierarchy_data (dict): The hierarchical data structure.
    Returns:
        str: The HTML representation of the hierarchy.
    """
    html_tree_parts = ["<ul id='treemenu1' class='treeview'>"]
    for child in hierarchy_data["children"]:
        html_tree_parts.append(
            f"\n\t<li><a id=li-{child['uri'][30:]} href={child['uri'][30:]}?view=hierarchy>{child['name']}</a>"
        )
        html_tree_parts.append(build_html_list(child, None))
        html_tree_parts.append("</li>")
    html_tree_parts.append("\n</ul>")
    return "".join(html_tree_parts)


class UATManager:
    """
    Manages the Unified Astronomy Thesaurus (UAT) data, including fetching the latest version,
    updating the local version, and providing access to hierarchical and alphabetical term data.
    """
    def __init__(self):
        self.current_tag = None
        self.alphabetical_terms = None
        self.html_hierarchy_tree = None
        self.update_lock = Lock()
        self.update_uat_version()

    def get_latest_uat_file(self, file_name):
        """
         Fetches the latest UAT file from the configured URL.
         Args:
             file_name (str): The name of the file to fetch.
         Returns:
             Response: The HTTP response containing the file data.
         """
        root_url = os.getenv("UAT_RAW_URL", "https://raw.githubusercontent.com/astrothesaurus/UAT/")
        if not root_url.endswith("/"):
            root_url += "/"
        download_url = root_url + self.current_tag + "/" + file_name
        error_message = "Failed to download the latest UAT file from " + download_url
        return fetch_url(download_url, error_message)

    def check_uat_version(self):
        """
          Checks if the local UAT version is the latest available version.
          Returns:
              dict: A dictionary containing the old tag, new tag, and whether the local version is the latest.
          """
        new_tag = get_latest_uat_tag()
        if self.current_tag is None:
            self.update_uat_version()
        return {"old_tag": self.current_tag, "new_tag": new_tag, "is_latest": self.current_tag == new_tag}

    def update_uat_version(self):
        """
        Updates the local UAT version to the latest available version.
        Returns:
            dict: A dictionary containing the status and the updated tag.
        """
        with self.update_lock:
            if self.current_tag is None:
                self.current_tag = get_latest_uat_tag()
            else:
                version_data = self.check_uat_version()
                if version_data["is_latest"]:
                    return {"status": "success", "tag": self.current_tag}
                self.current_tag = version_data["new_tag"]

            uat_file_content = self.get_latest_uat_file("UAT.rdf").text

            (
                all_terms,
                hierarchy_data,
            ) = process_rdf_file(uat_file_content)

            self.alphabetical_terms = sorted(all_terms, key=lambda term: term["name"])
            self.html_hierarchy_tree = build_html_tree(hierarchy_data)

            return {"status": "success", "tag": self.current_tag}