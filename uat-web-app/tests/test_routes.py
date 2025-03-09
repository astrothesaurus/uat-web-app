import os
import sys
import unittest
from unittest.mock import patch, mock_open

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import routes

class TestFlaskEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = routes.app.test_client()
        self.app.testing = True

    @patch("builtins.open", new_callable=mock_open, read_data='{"key": "value"}')
    def test_home_endpoint(self, mock_file):
        response = self.app.get('/')

        self.assertEqual(200, response.status_code)

    @patch("builtins.open", new_callable=mock_open, read_data='{"key": "value"}')
    def test_uat_endpoint(self, mock_file):
        response = self.app.get('/uat', follow_redirects=True)

        self.assertEqual(200, response.status_code)

    @patch("builtins.open", new_callable=mock_open, read_data='{"key": "value"}')
    def test_sort_endpoint(self, mock_file):
        response = self.app.get('/sort', follow_redirects=True)

        self.assertEqual(200, response.status_code)

    def test_non_existent_endpoint(self):
        response = self.app.get('/non-existent')

        self.assertEqual(404, response.status_code)

if __name__ == "__main__":
    unittest.main()