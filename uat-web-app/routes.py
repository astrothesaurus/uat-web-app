"""
This module defines the routes for the Flask application.
"""

import logging
import os

import requests
from flask import Flask, render_template

import utils
from data_generator import retrieve_alpha_page_data, retrieve_sorting_tool_data, build_html_list

# Configure logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__, static_folder="static", static_url_path="")

# Load configuration
config = utils.load_config()


def get_latest_uat_tag():
    url = os.getenv("UAT_API_URL", "https://api.github.com/repos/astrothesaurus/UAT/releases/latest")
    response = requests.get(url)
    if response.status_code == 200:
        latest_release = response.json()
        return latest_release.get("tag_name")
    else:
        logging.error("Failed to get the latest release.")
        return None


def get_latest_uat_file(file_name, default_data):
    root_url = os.getenv("UAT_RAW_URL", "https://raw.githubusercontent.com/astrothesaurus/UAT/")
    if not root_url.endswith("/"):
        root_url = root_url + "/"
    download_url = root_url + tag + "/" + file_name
    response = requests.get(download_url)
    if response.status_code == 200:
        return response.json()
    else:
        logging.error("Failed to download the latest file " + file_name)
        return default_data

# TODO: Make this endpoint secure
@app.get("/api/uat/check_version")
def check_uat_version():
    """
    API for checking if the UAT version is the latest.

    Returns:
        dict: JSON response with the UAT version.
    """
    new_tag = get_latest_uat_tag()
    if 'tag' not in globals() or tag is None:
        update_uat_version()

    return {"old_tag": tag, "new_tag": new_tag, "is_latest": tag == new_tag}


@app.post("/api/uat/update")
def update_uat_version():
    """
    API for updating the UAT version.

    Returns:
        dict: JSON response with the UAT version update status.
    """
    global tag, alpha_terms, html_tree

    if 'tag' not in globals():
        tag = get_latest_uat_tag()
    else:
        tag_data = check_uat_version()
        if tag_data["is_latest"]:
            return {"status": "success", "tag": tag}
        else:
            tag = tag_data["new_tag"]

    # fetch json files
    json_data = get_latest_uat_file("UAT_list.json", {})
    hierarchy_data = get_latest_uat_file("UAT.json", {"children": []})

    html_tree_parts = ["<ul id='treemenu1' class='treeview'>"]

    for child in hierarchy_data["children"]:
        html_tree_parts.append(
            f"\n\t<li><a id=li-{child['uri'][30:]} href={child['uri'][30:]}?view=hierarchy>{child['name']}</a>")
        html_tree_parts.append(build_html_list(child, None))
        html_tree_parts.append("</li>")

    html_tree_parts.append("\n</ul>")

    # apply changes to uat
    alpha_terms = sorted(json_data, key=lambda k: k["name"])
    html_tree = "".join(html_tree_parts)

    return {"status": "success", "tag": tag}


update_uat_version()


@app.route("/")
def index_page():
    """
    Route for the index page.

    Returns:
        str: Rendered HTML template for the index page.
    """
    return render_template("index.html", title="UAT Web App - Home")


@app.route("/uat/", defaults={"uat_id": None})
@app.route("/uat/<int:uat_id>")
def alpha_page(uat_id):
    """
    Route for the UAT page.

    Args:
        uat_id (int, optional): The UAT ID. Defaults to None.

    Returns:
        str: Rendered HTML template for the UAT page with data.
    """
    if any(var not in globals() or globals()[var] is None for var in ['tag', 'alpha_terms', 'html_tree']):
        update_uat_version()
    data = retrieve_alpha_page_data(uat_id, alpha_terms, html_tree)
    return render_template("alpha.html", title="UAT Web App - Alphabetical Browser", **data)


@app.route("/sort/")
def sorting_tool():
    """
    Route for the sorting tool page.

    Returns:
        str: Rendered HTML template for the sorting tool page with data.
    """
    data = retrieve_sorting_tool_data(app, tag)
    return render_template("sorting.html", title="UAT Web App - Sorting Tool", **data)


if __name__ == "__main__":
    app.run()
