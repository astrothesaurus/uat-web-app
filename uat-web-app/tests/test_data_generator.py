import os
import sys
import unittest
from unittest.mock import patch

from flask import Flask

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import data_generator  # noqa: E402


class TestDataGenerator(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    @patch("os.listdir")
    def test_retrieve_sorting_tool_data(self, mock_listdir):
        filelist = {
            "name": "root",
            "children": [
                {
                    "name": "branch",
                    "children": {
                        "name": "Cosmology", }}]}

        result = data_generator.retrieve_sorting_tool_data("v.5.1.0", filelist)

        self.assertEqual(2, len(result["filelist"]))
        self.assertEqual(filelist, result["filelist"])

    def test_build_html_list_without_children(self):
        term_list = {
            "uri": "http://astrothesaurus.org/uat/104",
            "name": "Astrophysical processes"
        }
        previous_path = None
        expected_html = ""

        result = data_generator.build_html_list(term_list, previous_path)

        self.assertEqual(expected_html, result)

    def test_build_html_list_with_children(self):
        term_list = {
            "uri": "http://astrothesaurus.org/uat/104",
            "name": "Astrophysical processes",
            "children": [
                {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism"}
            ]
        }
        previous_path = None
        expected_html = (
            "\n\t\t<ul id=ul-104 class='treeview'>\n"
            "\t<li><a id=li-104-102 href=102?view=hierarchy&path=104>"
            "Astrophysical magnetism</a></li>\n"
            "</ul>\n"
        )
        result = data_generator.build_html_list(term_list, previous_path)
        self.assertEqual(expected_html, result)

    def test_build_html_list_with_nested_children(self):
        term_list = {
            "uri": "http://astrothesaurus.org/uat/104",
            "name": "Astrophysical processes",
            "children": [
                {
                    "uri": "http://astrothesaurus.org/uat/102",
                    "name": "Astrophysical magnetism",
                    "children": [
                        {"uri": "http://astrothesaurus.org/uat/321",
                         "name": "Cosmic magnetic fields theory"}
                    ]
                }
            ]
        }
        previous_path = None
        expected_html = (
            "\n\t\t<ul id=ul-104 class='treeview'>\n"
            "\t<li><a id=li-104-102 href=102?view=hierarchy&path=104>Astrophysical magnetism</a>"
            "\n\t\t<ul id=ul-104-102 class='treeview'>\n"
            "\t<li><a id=li-104-102-321 href=321?view=hierarchy&path=104-102>"
            "Cosmic magnetic fields theory</a></li>\n"
            "</ul>\n"
            "</li>\n"
            "</ul>\n"
        )
        result = data_generator.build_html_list(term_list, previous_path)
        self.assertEqual(expected_html, result)

    def test_get_paths(self):
        path = "104-102-321"
        expected_paths = ["104", "104-102", "104-102-321"]

        paths = data_generator.get_paths(path)

        self.assertEqual(expected_paths, paths)

    def test_get_element_and_status(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes"},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism"},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory"}
        ]
        uat_id = 102
        view_type = "hierarchy"
        expected_element = {"uri": "http://astrothesaurus.org/uat/102",
                            "name": "Astrophysical magnetism"}
        expected_status = "no"

        element, status = data_generator.get_element_and_status(uat_id, alpha_terms, view_type)

        self.assertEqual(expected_element, element)
        self.assertEqual(expected_status, status)

    def test_get_element_and_status_unknown_type(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes"},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism"},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory"}
        ]
        uat_id = 102
        view_type = "unknown"
        expected_element = {"uri": "http://astrothesaurus.org/uat/102",
                            "name": "Astrophysical magnetism"}
        expected_status = "no"

        element, status = data_generator.get_element_and_status(uat_id, alpha_terms, view_type)

        self.assertEqual(expected_element, element)
        self.assertEqual(expected_status, status)

    def test_search_terms_with_no_results(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes",
             "altNames": ["Astro processes"], "status": "active"},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism",
             "altNames": []},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory",
             "altNames": ["Magnetic fields"]}
        ]
        lookup_term = "Nonexistent"
        expected_results = []

        results = data_generator.search_terms(lookup_term, alpha_terms)

        self.assertEqual(expected_results, results)

    def test_search_terms_with_none_lookup_term(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes",
             "altNames": ["Astro processes"], "status": "active"},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism",
             "altNames": [], "status": "active"},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory",
             "altNames": ["Magnetic fields"], "status": "deprecated"}
        ]
        lookup_term = None
        expected_results = []

        results = data_generator.search_terms(lookup_term, alpha_terms)

        self.assertEqual(expected_results, results)

    def test_search_terms_name_no_status(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes",
             "altNames": ["Astro processes"]},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism",
             "altNames": []},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory",
             "altNames": ["Magnetics", "Magnetics fields", "Milky Way Galaxy magnetics fields",
                          "Magnetic"]}
        ]
        lookup_term = "Magnetics"
        expected_results = [{'altNames': ['<mark>Magnetics</mark>',
                                          '<mark>Magnetics</mark> fields',
                                          'Magnetic',
                                          'Milky Way Galaxy <mark>magnetics</mark> fields'],
                             'name': 'Cosmic magnetic fields theory',
                             'uri': '321'}]

        results = data_generator.search_terms(lookup_term, alpha_terms)

        self.assertEqual(expected_results, results)

    def test_search_terms_uri_no_status(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astrophysical processes",
             "altNames": ["Astro processes"]},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism",
             "altNames": []},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory",
             "altNames": ["Magnetic fields"]}
        ]
        lookup_term = "321"
        expected_results = [{'name': 'Cosmic magnetic fields theory',
                             'uri': '<mark>321</mark>'}]

        results = data_generator.search_terms(lookup_term, alpha_terms)

        self.assertEqual(expected_results, results)

    def test_search_terms_alt_name_no_status(self):
        alpha_terms = [
            {"uri": "http://astrothesaurus.org/uat/104", "name": "Astro processes",
             "altNames": ["Astro-processes"]},
            {"uri": "http://astrothesaurus.org/uat/102", "name": "Astrophysical magnetism",
             "altNames": []},
            {"uri": "http://astrothesaurus.org/uat/321", "name": "Cosmic magnetic fields theory",
             "altNames": ["Magnetic fields"]}
        ]
        lookup_term = "Astro processes"
        expected_results = [{'altNames': ['Astro-processes'],
                             'name': '<mark>Astro processes</mark>',
                             'uri': '104'}]

        results = data_generator.search_terms(lookup_term, alpha_terms, "alpha")

        self.assertEqual(expected_results, results)


if __name__ == "__main__":
    unittest.main()
