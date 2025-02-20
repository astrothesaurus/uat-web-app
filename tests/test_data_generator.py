import unittest
from unittest.mock import patch

from flask import Flask

from src.data_generator import retrieve_sorting_tool_data


class TestDataGenerator(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    @patch('os.listdir')
    def test_retrieve_sorting_tool_data(self, mock_listdir):
        mock_listdir.return_value = ['concept1.json', 'concept2.json']
        result = retrieve_sorting_tool_data(self.app)
        self.assertEqual(len(result['filelist']), 2)
        self.assertEqual(result['filelist'][0]['name'], 'Concept1')

if __name__ == '__main__':
    unittest.main()