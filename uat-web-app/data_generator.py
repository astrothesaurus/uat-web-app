"""
This module's purpose is generating data for pages for the Flask application.
"""
import re
import string

import inflect
from flask import request

from config import UAT_SHORTNAME, UAT_LONGNAME, UAT_LOGO, UAT_SAVEFILE, UAT_META, HOMEPAGE_DIR

inflector = inflect.engine()


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
    sort_direction = request.args.get("sort", "relevance") if view_type == "search" else None
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
    term = re.sub(r"[\s\-_'\"\/.,!?;:()“”’‘]", "", term)
    singular = inflector.singular_noun(term)
    if singular:
        term = singular
    return term


def search_terms(lookup_term, alpha_terms, sort_direction="relevance"):
    """
    Searches for terms in the provided list that match the lookup term,
    using various normalization and matching strategies.
    Supports sorting results by relevance or alphabetically.

    Args:
        lookup_term (str): The search term entered by the user.
        alpha_terms (list): List of term dictionaries to search within.
        sort_direction (str, optional): Sorting method for results;
        "relevance" sorts by match rank, "alpha" sorts alphabetically.

    Returns:
        list: A list of dictionaries representing matched terms,
        each with highlighting and ranking information.
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
    for result in results:  # Remove the _rank key from the result
        result.pop("_rank", None)
    return results


def search_term(lookup_term, lookup_variants, normalized_lookup, term):
    """
    Searches for a match between the lookup term and a given term's name, URI,
    and alternative names.
    Assigns a relevance rank based on the type of match and highlights matched substrings.

    Args:
        lookup_term (str): The original search term entered by the user.
        lookup_variants (list): List of case-variant forms of the lookup term.
        normalized_lookup (str): Normalized version of the lookup term for loose matching.
        term (dict): The term dictionary containing 'name', 'uri', and optionally 'altNames'.

    Returns:
        dict or None: A dictionary with highlighted and ranked match information
        if a match is found, otherwise None.
    """
    term_dict = {}
    best_rank = 100
    # URI matching
    uri = str(term["uri"][30:])
    normalized_uri = normalize_term(uri)
    if lookup_term == uri:
        rank = 1
    elif uri.startswith(lookup_term):
        rank = 2
    elif lookup_term in uri:
        rank = 3
    elif normalized_lookup == normalized_uri:
        rank = 4
    elif normalized_lookup in normalized_uri:
        rank = 5
    else:
        rank = 100
    if rank < best_rank:
        best_rank = rank
        term_dict["uri"] = uri.replace(lookup_term, "<mark>" + lookup_term + "</mark>")
    # Name matching
    rank = 100
    for variant in lookup_variants:
        if variant == term["name"]:
            rank = 1
            term_dict["name"] = highlight_text(term["name"], variant)
            break
        elif term["name"].startswith(variant):
            rank = 2
            term_dict["name"] = highlight_text(term["name"], variant)
            break
        elif variant in term["name"]:
            rank = 3
            term_dict["name"] = highlight_text(term["name"], variant)
            break
    if rank >= 100:  # No match found with variants
        normalized_name = normalize_term(term["name"])
        if normalized_lookup == normalized_name:
            rank = 4
            term_dict["name"] = term["name"]
        elif normalized_lookup in normalized_name:
            rank = 5
            term_dict["name"] = term["name"]
    if rank < best_rank:
        best_rank = rank
    # altNames matching
    highlighted_alts = []
    if term.get("altNames"):
        for alt_name in term["altNames"]:
            rank = 100
            for variant in lookup_variants:
                if variant == alt_name:
                    rank = 1
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
                elif alt_name.startswith(variant):
                    rank = 2
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
                elif variant in alt_name:
                    rank = 3
                    highlighted_alts.append(highlight_text(alt_name, variant))
                    break
            if rank >= 100:  # No match found with variants
                normalized_alt = normalize_term(alt_name)
                if normalized_lookup == normalized_alt:
                    rank = 4
                    highlighted_alts.append(alt_name)
                elif normalized_lookup in normalized_alt:
                    rank = 5
                    highlighted_alts.append(alt_name)
            if rank < best_rank:
                best_rank = rank

        if highlighted_alts:
            # Sort the highlighted alternatives alphabetically only
            highlighted_alts.sort(key=lambda x: x.lower())
            term_dict["altNames"] = highlighted_alts
    if best_rank < 100:
        term_dict["_rank"] = best_rank
        if term_dict.get("uri") is None:
            term_dict["uri"] = uri
        if term_dict.get("name") is None:
            term_dict["name"] = term["name"]
        return term_dict


def highlight_text(name, variant):
    """
    Highlights all case-insensitive occurrences of `variant`
    in `name` by wrapping them in <mark> tags.

    Args:
        name (str): The text in which to highlight matches.
        variant (str): The substring to highlight.

    Returns:
        str: The input text with all matches of `variant` wrapped in <mark> tags.
    """
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


def retrieve_sorting_tool_data(tag, file_list):
    """
    Prepares and returns context data for rendering the sorting tool page.

    Args:
        tag (str): The version tag for the UAT data.
        file_list (list): List of files to be displayed or sorted.

    Returns:
        dict: A dictionary containing sorting tool page data,
        including file list, UAT metadata, and configuration.
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
