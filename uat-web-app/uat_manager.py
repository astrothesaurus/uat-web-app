import logging
import os
from threading import Lock

import requests
from flask import abort

from data_generator import build_html_list

def fetch_url(url, error_message):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        logging.error(error_message)
        abort(response.status_code, description=error_message)

def get_latest_uat_tag():
    url = os.getenv("UAT_API_URL", "https://api.github.com/repos/astrothesaurus/UAT/releases/latest")
    error_message = "Failed to fetch the UAT latest release version from " + url
    return fetch_url(url, error_message).get("tag_name")

def build_html_tree(hierarchy_data):
    html_tree_parts = ["<ul id='treemenu1' class='treeview'>"]
    for child in hierarchy_data["children"]:
        html_tree_parts.append(
            f"\n\t<li><a id=li-{child['uri'][30:]} href={child['uri'][30:]}?view=hierarchy>{child['name']}</a>")
        html_tree_parts.append(build_html_list(child, None))
        html_tree_parts.append("</li>")
    html_tree_parts.append("\n</ul>")
    return "".join(html_tree_parts)

class UATManager:
    def __init__(self):
        self.tag = None
        self.alpha_terms = None
        self.html_tree = None
        self.update_lock = Lock()
        self.update_uat_version()

    def get_latest_uat_file(self, file_name):
        root_url = os.getenv("UAT_RAW_URL", "https://raw.githubusercontent.com/astrothesaurus/UAT/")
        if not root_url.endswith("/"):
            root_url += "/"
        download_url = root_url + self.tag + "/" + file_name
        error_message = "Failed to download the latest UAT file from " + download_url
        return fetch_url(download_url, error_message)

    def check_uat_version(self):
        new_tag = get_latest_uat_tag()
        if self.tag is None:
            self.update_uat_version()
        return {"old_tag": self.tag, "new_tag": new_tag, "is_latest": self.tag == new_tag}

    def update_uat_version(self):
        with self.update_lock:
            if self.tag is None:
                self.tag = get_latest_uat_tag()
            else:
                tag_data = self.check_uat_version()
                if tag_data["is_latest"]:
                    return {"status": "success", "tag": self.tag}
                self.tag = tag_data["new_tag"]

            self.alpha_terms = sorted(self.get_latest_uat_file("UAT_list.json"), key=lambda k: k["name"])
            hierarchy_data = self.get_latest_uat_file("UAT.json")
            self.html_tree = build_html_tree(hierarchy_data)

            return {"status": "success", "tag": self.tag}