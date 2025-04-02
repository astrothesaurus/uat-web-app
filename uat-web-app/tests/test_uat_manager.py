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

        with self.assertLogs(level='ERROR') as log:
            result = uat_manager.get_latest_uat_tag()
            self.assertIn('Failed to get the latest release.', log.output[0])
            self.assertIsNone(result)


if __name__ == '__main__':
    unittest.main()
