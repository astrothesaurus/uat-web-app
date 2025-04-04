import logging
import os
from threading import Lock

import requests
from flask import abort

from data_generator import build_html_list


def get_latest_uat_tag():
    url = os.getenv("UAT_API_URL", "https://api.github.com/repos/astrothesaurus/UAT/releases/latest")
    response = requests.get(url)
    if response.status_code == 200:
        latest_release = response.json()
        return latest_release.get("tag_name")
    else:
        error_message = "Failed to fetch the UAT latest release version from github " + url
        logging.error(error_message)
        abort(response.status_code, description=error_message)


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
            root_url = root_url + "/"
        download_url = root_url + self.tag + "/" + file_name
        response = requests.get(download_url)
        if response.status_code == 200:
            return response.json()
        else:
            error_message = "Failed to download the latest UAT file from github " + download_url
            logging.error(error_message)
            abort(response.status_code, description=error_message)

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
                else:
                    self.tag = tag_data["new_tag"]

            json_data = self.get_latest_uat_file("UAT_list.json")
            hierarchy_data = self.get_latest_uat_file("UAT.json")

            html_tree_parts = ["<ul id='treemenu1' class='treeview'>"]

            for child in hierarchy_data["children"]:
                html_tree_parts.append(
                    f"\n\t<li><a id=li-{child['uri'][30:]} href={child['uri'][30:]}?view=hierarchy>{child['name']}</a>")
                html_tree_parts.append(build_html_list(child, None))
                html_tree_parts.append("</li>")

            html_tree_parts.append("\n</ul>")

            self.alpha_terms = sorted(json_data, key=lambda k: k["name"])
            self.html_tree = "".join(html_tree_parts)

            return {"status": "success", "tag": self.tag}
