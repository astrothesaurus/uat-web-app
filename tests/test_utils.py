# tests/test_utils.py

import unittest
from unittest.mock import patch, mock_open
from src import utils

class TestUtils(unittest.TestCase):

    @patch.dict('os.environ', {'app_name_KEY': 'new_value'})
    def test_update_config_from_environment(self):
        conf = {'KEY': 'value'}
        utils.update_config_from_environment('app_name', conf)
        self.assertEqual(conf['KEY'], 'new_value')

    def test_replace_config_value(self):
        conf = {'KEY': 'value'}
        utils.replace_config_value(conf, 'KEY', 'new_value')
        self.assertEqual(conf['KEY'], 'new_value')

    @patch('builtins.open', new_callable=mock_open, read_data='KEY = "value"')
    def test_load_configuration_module(self, mock_open):
        result = utils.load_configuration_module('/path/to/config.py')
        self.assertIn('KEY', result)
        self.assertEqual(result['KEY'], 'value')

    def test_update_config_from_object(self):
        class Config:
            KEY = 'value'
            key = 'value'

        result = {}
        utils.update_config_from_object(Config, result)
        self.assertIn('KEY', result)
        self.assertNotIn('key', result)
        self.assertEqual(result['KEY'], 'value')

    @patch('os.path.exists', return_value=True)
    @patch('os.path.abspath', side_effect=lambda x: x)
    @patch('inspect.getsourcefile', return_value='/path/to/module.py')
    @patch('inspect.stack')
    def test_get_project_home_directory(self, mock_stack, mock_getsourcefile, mock_abspath, mock_exists):
        mock_stack.return_value = [None, None, [None, None, '/path/to/module.py']]
        result = utils._get_project_home_directory()
        self.assertEqual(result, '/path/to')

    @patch('os.path.exists', return_value=False)
    @patch('sys.stderr.write')
    @patch('inspect.getsourcefile', return_value='/path/to/module.py')
    @patch('inspect.stack')
    def test_get_project_home_directory_not_found(self, mock_stack, mock_getsourcefile, mock_stderr, mock_exists):
        mock_stack.return_value = [None, None, [None, None, '/path/to/module.py']]
        result = utils._get_project_home_directory()
        self.assertEqual(result, '/path/to')
        mock_stderr.assert_called_once()

    @patch('os.path.exists', return_value=True)
    @patch('os.path.abspath', side_effect=lambda x: x)
    @patch('inspect.getsourcefile', return_value='/path/to/module.py')
    @patch('inspect.stack')
    @patch('sys.path', [])
    def test_load_config(self, mock_stack, mock_getsourcefile, mock_abspath, mock_exists):
        mock_stack.return_value = [None, None, [None, None, '/path/to/module.py']]
        with patch('src.utils.load_configuration_module', return_value={'KEY': 'value'}):
            result = utils.load_config()
            self.assertIn('PROJECT_HOME', result)
            self.assertIn('KEY', result)
            self.assertEqual(result['KEY'], 'value')

if __name__ == '__main__':
    unittest.main()