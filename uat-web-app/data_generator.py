"""
This module's purpose is generating data for pages for the Flask application.
"""
import os
import string
from flask import request

from config import UAT_SHORTNAME, UAT_LONGNAME, UAT_LOGO, SORT_VERSION, UAT_SAVEFILE, UAT_META, UAT_URL


def build_html_list(term_list, previous_path):
    """
    Recursively builds an HTML list from a term list.

    Args:
        term_list (dict): The term list.
        previous_path (str): The previous path.

    Returns:
        str: The HTML list.
    """
    current_path = term_list["uri"][30:]
    html_tree = ""

    if "children" in term_list:
        if previous_path is None:
            path = current_path
        else:
            path = previous_path + "-" + current_path

        html_tree += "\n\t\t<ul id=ul-" + path + " class='treeview'>\n"

        for child in term_list["children"]:
            html_tree += "\t<li><a id=li-" + path + "-" + child["uri"][30:] + " href=" + child["uri"][30:] + "?view=hierarchy&path=" + path + ">" + child["name"] + "</a>"
            html_tree += build_html_list(child, path)
            html_tree += "</li>\n"

        html_tree += "</ul>\n"

    return html_tree

def retrieve_alpha_page_data(uat_id, alpha_terms, html_tree):
    """
    Retrieves data for the alpha page.

    Args:
        uat_id (int, optional): The UAT ID. Defaults to None.
        alpha_terms (list): List of alpha terms.
        html_tree (str): The HTML tree.

    Returns:
        dict: The data for the alpha page.
    """
    results = []
    lookup_term = None
    unknown_status = "no"
    all_paths = []

    view_type = request.args.get("view")

    if view_type == "search":
        element = "noelement"
        try:
            lookup_term = request.args.get("lookup")
            lookup_variants = [lookup_term.lower(), lookup_term.title(), lookup_term.capitalize(), lookup_term.upper()]

            for term in alpha_terms:
                term_dict = {}
                try:
                    if term["status"] != "deprecated":
                        pass
                except KeyError:
                    if lookup_term in str(term["uri"][30:]):
                        term_dict["uri"] = str(term["uri"][30:]).replace(lookup_term, "<mark>" + lookup_term + "</mark>")
                        term_dict["name"] = term["name"]
                        results.append(term_dict)
                    elif lookup_term in (term["name"]).lower():
                        term_dict["uri"] = term["uri"][30:]
                        for lookup_variant in lookup_variants:
                            if lookup_variant in term["name"]:
                                term_dict["name"] = (term["name"]).replace(lookup_variant, "<mark>" + lookup_variant + "</mark>")
                        results.append(term_dict)
                    else:
                        term_dict["name"] = term["name"]
                        term_dict["uri"] = term["uri"][30:]
                        if term["altNames"]:
                            for alt_name in term["altNames"]:
                                for lookup_variant in lookup_variants:
                                    if lookup_variant in alt_name:
                                        term_dict["altNames"] = alt_name.replace(lookup_variant, "<mark>" + lookup_variant + "</mark>")
                                        results.append(term_dict)
                                        break
        except:
            pass
    else:
        if view_type == "hierarchy":
            try:
                path = request.args.get("path")
                split_path = path.split("-")
                for path_segment in split_path:
                    if not all_paths:
                        all_paths.append(path_segment)
                    else:
                        all_paths.append(all_paths[-1] + "-" + path_segment)
            except:
                pass

            if uat_id is not None:
                for term in alpha_terms:
                    if int(term["uri"][30:]) == int(uat_id):
                        element = term
            else:
                element = "noelement"
        else:
            view_type = "alpha"

        if uat_id is not None:
            element = "noelement"
            unknown_status = "yes"
            for term in alpha_terms:
                if int(term["uri"][30:]) == int(uat_id):
                    element = term
                    unknown_status = "no"
        else:
            element = "noelement"

    alphabet = list(string.ascii_lowercase)
    alphabet.append("#")

    return {
        "unknown": unknown_status,
        "lookup": lookup_term,
        "path": all_paths,
        "results": results,
        "htree": html_tree,
        "alpha": alpha_terms,
        "gtype": view_type,
        "element": element,
        "alphabet": alphabet
    }

def retrieve_sorting_tool_data(app):
    """
    Retrieves data for the sorting tool page.

    Args:
        app (Flask): The Flask application instance.

    Returns:
        dict: The data for the sorting tool page.
    """
    file_names = os.listdir(os.path.join(app.static_folder, "topconcepts"))
    file_list = []
    for file_name in file_names:
        file_dict = {"name": file_name.capitalize().replace("_", " ").replace(".json", ""), "file": file_name, "value": file_name.replace(".", "").replace("json", "")}
        file_list.append(file_dict)

    return {
        "filelist": file_list,
        "shortname": UAT_SHORTNAME,
        "longname": UAT_LONGNAME,
        "logo": UAT_LOGO,
        "version": SORT_VERSION,
        "savefile": UAT_SAVEFILE,
        "meta": UAT_META,
        "url": UAT_URL
    }