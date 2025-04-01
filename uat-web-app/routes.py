"""
This module defines the routes for the Flask application.
"""

from flask import Flask, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import utils
from data_generator import retrieve_alpha_page_data, retrieve_sorting_tool_data
from uat_manager import UATManager

app = Flask(__name__, static_folder="static", static_url_path="")

# Initialize the Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per minute"]
)

# Load configuration
config = utils.load_config()

# Initialize the UATManager
uat_manager = UATManager()


@app.get("/api/uat/check_version")
@limiter.limit("5 per hour", key_func=get_remote_address)
def check_uat_version_endpoint():
    """
    API for checking if the UAT version is the latest.

    Returns:
        dict: JSON response with the UAT version.
    """
    return uat_manager.check_uat_version()


# TODO: Make this endpoint secure
@app.post("/api/uat/update")
@limiter.limit("5 per hour")
def update_uat_version_endpoint():
    """
    API for updating the UAT version.

    Returns:
        dict: JSON response with the UAT version update status.
    """
    return uat_manager.update_uat_version()


@app.route("/")
@limiter.limit("45 per minute", key_func=get_remote_address)
def index_page():
    """
    Route for the index page.

    Returns:
        str: Rendered HTML template for the index page.
    """
    return render_template("index.html", title="UAT Web App - Home")


@app.route("/uat/", defaults={"uat_id": None})
@app.route("/uat/<int:uat_id>")
@limiter.limit("45 per minute", key_func=get_remote_address)
def alpha_page(uat_id):
    """
    Route for the UAT page.

    Args:
        uat_id (int, optional): The UAT ID. Defaults to None.

    Returns:
        str: Rendered HTML template for the UAT page with data.
    """
    data = retrieve_alpha_page_data(uat_id, uat_manager.alpha_terms, uat_manager.html_tree)
    return render_template("alpha.html", title="UAT Web App - Alphabetical Browser", **data)


@app.route("/sort/")
@limiter.limit("45 per minute", key_func=get_remote_address)
def sorting_tool():
    """
    Route for the sorting tool page.

    Returns:
        str: Rendered HTML template for the sorting tool page with data.
    """
    data = retrieve_sorting_tool_data(app, uat_manager.tag)
    return render_template("sorting.html", title="UAT Web App - Sorting Tool", **data)


if __name__ == "__main__":
    app.run()
