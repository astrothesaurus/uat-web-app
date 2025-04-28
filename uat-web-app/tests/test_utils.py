import os
import sys
import unittest
from unittest.mock import patch, mock_open

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import utils  # noqa: E402


class TestUtils(unittest.TestCase):

    @patch.dict(os.environ, {"KEY": "new_value"})
    def test_update_config_from_environment(self):
        conf = {"KEY": "value"}
        self.assertEqual("value", conf["KEY"])

        utils.update_config_from_environment(conf)

        self.assertEqual("new_value", conf["KEY"])

    @patch("builtins.open", new_callable=mock_open, read_data='KEY = "value"')
    def test_load_configuration_module(self, mock_open):
        result = utils.load_configuration_module("/path/to/config.py")

        self.assertIn("KEY", result)
        self.assertEqual("value", result["KEY"])

    def test_update_config_from_object(self):
        class Config:
            KEY = "value"
            key = "value"

        result = {}

        utils.update_config_from_object(Config, result)

        self.assertIn("KEY", result)
        self.assertNotIn("key", result)
        self.assertEqual("value", result["KEY"])

    @patch("os.path.exists", return_value=True)
    @patch("os.path.abspath", side_effect=lambda x: x)
    @patch("inspect.getsourcefile", return_value="/path/to/module.py")
    @patch("inspect.stack")
    def test_get_project_home_directory(self, mock_stack,
                                        mock_getsourcefile, mock_abspath, mock_exists):
        mock_stack.return_value = [None, None, [None, None, "/path/to/module.py"]]

        result = utils._get_project_home_directory()

        self.assertEqual("/path/to", result)

    @patch("os.path.exists", return_value=False)
    @patch("sys.stderr.write")
    @patch("inspect.getsourcefile", return_value="/path/to/module.py")
    @patch("inspect.stack")
    def test_get_project_home_directory_not_found(self, mock_stack,
                                                  mock_getsourcefile, mock_stderr, mock_exists):
        mock_stack.return_value = [None, None, [None, None, "/path/to/module.py"]]
        result = utils._get_project_home_directory()

        self.assertEqual("/path/to", result)

        mock_stderr.assert_called_once()

    @patch("os.path.exists", return_value=True)
    @patch("os.path.abspath", side_effect=lambda x: x)
    @patch("inspect.getsourcefile", return_value="/path/to/module.py")
    @patch("inspect.stack")
    @patch("sys.path", [])
    def test_load_config(self, mock_stack, mock_getsourcefile, mock_abspath, mock_exists):
        mock_stack.return_value = [None, None, [None, None, "/path/to/module.py"]]

        with patch("utils.load_configuration_module", return_value={"KEY": "value"}):
            result = utils.load_config()

            self.assertIn("PROJECT_HOME", result)
            self.assertIn("KEY", result)
            self.assertEqual("value", result["KEY"])

    @patch("os.path.exists", return_value=False)
    def test_load_config_with_nonexistent_project_home(self, mock_exists):
        project_home = "/nonexistent/path"

        with self.assertRaises(Exception) as context:
            utils.load_config(project_home=project_home)

        self.assertIn(
            "path doesn't exist",
            str(context.exception)
        )


if __name__ == "__main__":
    unittest.main()
