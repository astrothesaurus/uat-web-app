"""
This module defines the routes for the Flask application.
"""
import json

from src import utils
from flask import Flask, render_template
from src.data_generator import retrieve_alpha_page_data, retrieve_sorting_tool_data, build_html_list

app = Flask(__name__, static_folder='static', static_url_path='')

# Load configuration
config = utils.load_config()

vocab_path = config.get('STATIC_PATH_VOCAB', './static/UAT_list.json')
json_data = json.load(open(vocab_path))
alpha_terms = sorted(json_data, key=lambda k: k['name'])

hierarchy_path = config.get('STATIC_PATH_HIERARCHY', './static/UAT.json')
hierarchy_data = json.load(open(hierarchy_path))

html_tree = "<ul id='treemenu1' class='treeview'>"

for child in hierarchy_data["children"]:
    html_tree += "\n\t<li><a id=li-" + child["uri"][30:] + " href=" + child["uri"][30:] + "?view=hierarchy>" + child["name"] + "</a>"
    html_tree += build_html_list(child, None)
    html_tree += "</li>"

html_tree += "\n</ul>"

@app.route('/')
def index_page():
    """
    Route for the index page.

    Returns:
        str: Rendered HTML template for the index page.
    """
    return render_template("index.html", title="UAT Web App - Home")

@app.route('/uat/', defaults={'uat_id': None})
@app.route('/uat/<int:uat_id>')
def alpha_page(uat_id):
    """
    Route for the UAT page.

    Args:
        uat_id (int, optional): The UAT ID. Defaults to None.

    Returns:
        str: Rendered HTML template for the UAT page with data.
    """
    data = retrieve_alpha_page_data(uat_id, alpha_terms, html_tree)
    return render_template("alpha.html", title="UAT Web App - Alphabetical Browser", **data)

@app.route('/sort/')
def sorting_tool():
    """
    Route for the sorting tool page.

    Returns:
        str: Rendered HTML template for the sorting tool page with data.
    """
    data = retrieve_sorting_tool_data(app)
    return render_template('sorting.html', title="UAT Web App - Sorting Tool", **data)

if __name__ == '__main__':
    app.run()