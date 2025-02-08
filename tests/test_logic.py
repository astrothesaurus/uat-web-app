# tests/test_logic.py

import unittest
from flask import Flask, request
from unittest.mock import patch
from src.logic import build_html_list, retrieve_alpha_page_data, retrieve_sorting_tool_data

class TestLogic(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    @patch('os.listdir')
    def test_retrieve_sorting_tool_data(self, mock_listdir):
        mock_listdir.return_value = ['concept1.json', 'concept2.json']
        config = type('Config', (object,), {
            "shortname": "shortname",
            "longname": "longname",
            "version": "1.0",
            "savefile": "savefile",
            "meta": "meta",
            "url": "http://example.com",
            "logo": "logo.png"
        })()
        result = retrieve_sorting_tool_data(self.app, config)
        self.assertEqual(len(result['filelist']), 2)
        self.assertEqual(result['filelist'][0]['name'], 'Concept1')

if __name__ == '__main__':
    unittest.main()