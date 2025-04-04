import os
import sys
import unittest
from unittest.mock import patch

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uat_manager


class TestUatManager(unittest.TestCase):
    @patch('requests.get')
    def test_get_latest_uat_tag_failure(self, mock_get):
        # Mock the response to simulate a failed request
        mock_get.return_value.status_code = 404

        with self.assertRaises(Exception) as context:
            uat_manager.get_latest_uat_tag()

        self.assertIn('Failed to fetch the UAT latest release version from github', str(context.exception))


if __name__ == '__main__':
    unittest.main()
