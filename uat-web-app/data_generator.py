"""
This module's purpose is generating data for pages for the Flask application.
"""
import re
import string

import inflect
from flask import request

from config import UAT_SHORTNAME, UAT_LONGNAME, UAT_LOGO, UAT_SAVEFILE, UAT_META, HOMEPAGE_DIR

p = inflect.engine()


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
    sort_direction = request.args.get("sort", "alpha") if view_type == "search" else None
    results = search_terms(lookup_term, alpha_terms, sort_direction) \
        if view_type == "search" else []
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
        "alphabet": alphabet,
        "sort": sort_direction,
    }


def normalize_term(term):
    """
    Normalizes a term for comparison:
    - Lowercases
    - Removes common punctuation
    - Converts plurals to singular using inflect
    """
    term = term.lower()
    term = re.sub(r"[\s\-_'\"/.,!?;:()“”’‘]", "", term)
    singular = p.singular_noun(term)
    if singular:
        term = singular
    return term


def search_terms(lookup_term, alpha_terms, sort_direction="alpha"):
    """
    Searches for terms in the alpha terms list
    Ignores plural/singular, spaces, hyphens, apostrophes.
    """
    results = []
    if lookup_term:
        lookup_term = lookup_term.strip()
        # Limit input length to 256 characters to prevent ReDoS
        lookup_term = lookup_term[:256]
        normalized_lookup = normalize_term(lookup_term)
        lookup_variants = [lookup_term.lower(), lookup_term.title(),
                           lookup_term.capitalize(), lookup_term.upper()]

        for term in alpha_terms:
            try:
                if term["status"] != "deprecated":
                    pass
            except KeyError:
                result = search_term(lookup_term, lookup_variants, normalized_lookup, term)
                if result is not None:
                    results.append(result)

    if sort_direction == "relevance":
        results.sort(key=lambda x: (x["_rank"], x["name"].lower()))
    else:
        results.sort(key=lambda x: (x["name"].lower()))
    return results


def search_term(lookup_term, lookup_variants, normalized_lookup, term):
    normalized_name = normalize_term(term["name"])
    normalized_uri = normalize_term(str(term["uri"][30:]))

    matched = False
    term_dict = {}
    best_rank = 100
    # URI matching
    uri = str(term["uri"][30:])
    if lookup_term == uri:
        rank, matched = 1, True
    elif uri.startswith(lookup_term):
        rank, matched = 2, True
    elif lookup_term in uri:
        rank, matched = 3, True
    elif normalized_lookup == normalized_uri:
        rank, matched = 4, True
    elif normalized_lookup in normalized_uri:
        rank, matched = 5, True
    else:
        rank = 100
    if matched and rank < best_rank:
        best_rank = rank
        term_dict["uri"] = uri.replace(lookup_term, "<mark>" + lookup_term + "</mark>")
    # Name matching
    matched_name = False
    for variant in lookup_variants:
        if variant == term["name"]:
            rank, matched_name = 1, True
            term_dict["name"] = highlight_text(term["name"], variant)
            break
        elif term["name"].startswith(variant):
            rank, matched_name = 2, True
            term_dict["name"] = highlight_text(term["name"], variant)
            break
        elif variant in term["name"]:
            rank, matched_name = 3, True
            term_dict["name"] = highlight_text(term["name"], variant)
            break
    if not matched_name:
        if normalized_lookup == normalized_name:
            rank, matched_name = 4, True
            term_dict["name"] = term["name"]
        elif normalized_lookup in normalized_name:
            rank, matched_name = 5, True
            term_dict["name"] = term["name"]
    if matched_name and rank < best_rank:
        best_rank, matched = rank, True
    # altNames matching
    highlighted_alts = []
    if term.get("altNames"):
        for alt_name in term["altNames"]:
            alt_matched = False
            for variant in lookup_variants:
                if variant == alt_name:
                    rank, alt_matched = 1, True
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
                elif alt_name.startswith(variant):
                    rank, alt_matched = 2, True
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
                elif variant in alt_name:
                    rank, alt_matched = 3, True
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
            if not alt_matched:
                normalized_alt = normalize_term(alt_name)
                if normalized_lookup == normalized_alt:
                    rank, alt_matched = 4, True
                    highlighted_alts.append(alt_name)
                elif normalized_lookup in normalized_alt:
                    rank, alt_matched = 5, True
                    highlighted_alts.append(alt_name)
            if alt_matched and rank < best_rank:
                best_rank, matched = rank, True

        if highlighted_alts:
            # Sort the highlighted alternatives alphabetically only
            highlighted_alts.sort(key=lambda x: x.lower())
            term_dict["altNames"] = highlighted_alts
    if matched:
        term_dict["_rank"] = best_rank
        if term_dict.get("uri") is None:
            term_dict["uri"] = uri
        if term_dict.get("name") is None:
            term_dict["name"] = term["name"]
        return term_dict


def highlight_text(name, variant):
    return re.sub(
        r'({})'.format(re.escape(variant)),
        r'<mark>\1</mark>',
        name,
        flags=re.IGNORECASE
    )


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
