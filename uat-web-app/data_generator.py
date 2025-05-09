"""
This module's purpose is generating data for pages for the Flask application.
"""
import string

from flask import request

from config import UAT_SHORTNAME, UAT_LONGNAME, UAT_LOGO, UAT_SAVEFILE, UAT_META, HOMEPAGE_DIR


def build_html_list(term_list, previous_path):
    """
    Recursively builds an HTML list from a term list.

    Args:
        term_list (dict): The term list.
        previous_path (str): The previous path.

    Returns:
        str: The HTML list.
    """
    html_tree_parts = []
    current_path = term_list["uri"][30:]

    if "children" in term_list:
        if previous_path is None:
            path = current_path
        else:
            path = previous_path + "-" + current_path

        html_tree_parts.append(f"\n\t\t<ul id=ul-{path} class='treeview'>\n")

        for child in term_list["children"]:
            html_tree_parts.append(
                f"\t<li><a id=li-{path}-{child['uri'][30:]} "
                f"href={child['uri'][30:]}?view=hierarchy&path={path}>{child['name']}</a>")
            html_tree_parts.append(build_html_list(child, path))
            html_tree_parts.append("</li>\n")

        html_tree_parts.append("</ul>\n")

    html_tree = "".join(html_tree_parts)
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
    view_type = request.args.get("view", "alpha")
    lookup_term = request.args.get("lookup") if view_type == "search" else None
    results = search_terms(lookup_term, alpha_terms) if view_type == "search" else []
    all_paths = get_paths(request.args.get("path")) if view_type == "hierarchy" else []
    element, unknown_status = get_element_and_status(uat_id, alpha_terms, view_type)

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


def search_terms(lookup_term, alpha_terms):
    """
    Searches for terms in the alpha terms list.

    Args:
        lookup_term (str): The term to look up.
        alpha_terms (list): List of alpha terms.

    Returns:
        list: The search results.
    """
    results = []
    if lookup_term:
        lookup_term = lookup_term.strip()
        lookup_variants = [lookup_term.lower(), lookup_term.title(),
                           lookup_term.capitalize(), lookup_term.upper()]

        for term in alpha_terms:
            term_dict = {}
            try:
                if term["status"] != "deprecated":
                    pass
            except KeyError:
                if lookup_term in str(term["uri"][30:]):
                    term_dict["uri"] = str(term["uri"][30:]).replace(lookup_term, "<mark>" +
                                                                     lookup_term + "</mark>")
                    term_dict["name"] = term["name"]
                    results.append(term_dict)
                elif lookup_term.lower() in (term["name"]).lower():
                    term_dict["uri"] = term["uri"][30:]
                    for variant in lookup_variants:
                        if variant in term["name"]:
                            term_dict["name"] = (term["name"]).replace(variant, "<mark>" +
                                                                       variant + "</mark>")
                    results.append(term_dict)
                else:
                    term_dict["name"] = term["name"]
                    term_dict["uri"] = term["uri"][30:]
                    if not term["altNames"]:
                        continue
                    for alt_name in term["altNames"]:
                        for variant in lookup_variants:
                            if variant in alt_name:
                                term_dict["altNames"] = alt_name.replace(variant, "<mark>" +
                                                                         variant + "</mark>")
                                results.append(term_dict)
                                break
    return results


def get_paths(path):
    """
    Splits the path into segments.

    Args:
        path (str): The path to split.

    Returns:
        list: The path segments.
    """
    all_paths = []
    if path:
        split_path = path.split("-")
        for path_segment in split_path:
            if not all_paths:
                all_paths.append(path_segment)
            else:
                all_paths.append(all_paths[-1] + "-" + path_segment)
    return all_paths


def get_element_and_status(uat_id, alpha_terms, view_type):
    """
    Retrieves the element and its status.

    Args:
        uat_id (int, optional): The UAT ID. Defaults to None.
        alpha_terms (list): List of alpha terms.
        view_type (str): The view type.

    Returns:
        tuple: The element and its status.
    """
    element = "noelement"
    unknown_status = "no"

    if view_type == "hierarchy" and uat_id is not None:
        for term in alpha_terms:
            if int(term["uri"][30:]) == int(uat_id):
                element = term
                break
    elif uat_id is not None:
        unknown_status = "yes"
        for term in alpha_terms:
            if int(term["uri"][30:]) == int(uat_id):
                element = term
                unknown_status = "no"
                break

    return element, unknown_status


def retrieve_sorting_tool_data(app, tag, file_list):
    """
    Retrieves data for the sorting tool page.

    Args:
        app (Flask): The Flask application instance.
        tag (str): The tag for the UAT version.

    Returns:
        dict: The data for the sorting tool page.
        tag: The tag for the UAT version.
        file_list: Sorting data
    """
    return {
        "filelist": file_list,
        "shortname": UAT_SHORTNAME,
        "longname": UAT_LONGNAME,
        "logo": UAT_LOGO,
        "version": tag,
        "savefile": UAT_SAVEFILE,
        "meta": UAT_META,
        "homepageDir": HOMEPAGE_DIR
    }
