import logging
import os
from threading import Lock

import requests
from flask import abort

from data_generator import build_html_list


def fetch_url(url, error_message):
    """
    Sends a GET request to the specified URL and handles errors.
    Args:
        url (str): The URL to fetch.
        error_message (str): The error message to log and include in the response.
    Returns:
        dict: The parsed JSON data from the HTTP response if the request is successful.
    Raises:
        HTTPException: If the request fails, aborts with the corresponding HTTP status code.
    """
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        logging.error(error_message)
        abort(response.status_code, description=error_message)


def get_latest_uat_tag():
    """
    Retrieves the latest release tag of the Unified Astronomy Thesaurus (UAT) from the GitHub API.
    Returns:
        str: The latest release tag name.
    Raises:
        HTTPException: If the request fails or the response contains invalid JSON.
    """
    url = os.getenv("UAT_API_URL",
                    "https://api.github.com/repos/astrothesaurus/UAT/releases/latest")
    error_message = "Failed to fetch the UAT latest release version from " + url
    return fetch_url(url, error_message).get("tag_name")


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
            f"\n\t<li><a id=li-{child['uri'][30:]} "
            f"href={child['uri'][30:]}?view=hierarchy>{child['name']}</a>")
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
        root_url = os.getenv("UAT_RAW_URL",
                             "https://raw.githubusercontent.com/astrothesaurus/UAT")
        if not root_url.endswith("/"):
            root_url += "/"
        download_url = root_url + self.current_tag + "/" + file_name
        error_message = "Failed to download the latest UAT file from " + download_url
        return fetch_url(download_url, error_message)

    def check_uat_version(self):
        """
          Checks if the local UAT version is the latest available version.
          Returns:
              dict: A dictionary containing the old tag, new tag, and
              whether the local version is the latest.
          """
        new_tag = get_latest_uat_tag()
        if self.current_tag is None:
            self.update_uat_version()
        return {"old_tag": self.current_tag,
                "new_tag": new_tag,
                "is_latest": self.current_tag == new_tag}

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
                tag_data = self.check_uat_version()
                if tag_data["is_latest"]:
                    return {"status": "success", "current_tag": self.current_tag}
                self.current_tag = tag_data["new_tag"]

            self.alphabetical_terms = sorted(self.get_latest_uat_file("UAT_list.json"),
                                             key=lambda k: k["name"])
            hierarchy_data = self.get_latest_uat_file("UAT.json")
            self.html_hierarchy_tree = build_html_tree(hierarchy_data)

            return {"status": "success", "current_tag": self.current_tag}
