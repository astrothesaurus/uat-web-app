import sys
import os
import unittest
from unittest.mock import patch
from flask import Flask

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import data_generator

class TestDataGenerator(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    @patch("os.listdir")
    def test_retrieve_sorting_tool_data(self, mock_listdir):
        mock_listdir.return_value = ["concept1.json", "concept2.json"]
        result = data_generator.retrieve_sorting_tool_data(self.app)
        self.assertEqual(len(result["filelist"]), 2)
        self.assertEqual(result["filelist"][0]["name"], "Concept1")

if __name__ == "__main__":
    unittest.main()