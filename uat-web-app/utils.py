from __future__ import absolute_import, unicode_literals

import importlib as imp
import inspect
import os
import sys


def _get_project_home_directory(extra_frames=0):
    """
    Get the location of the caller module; then go up max_levels until
    finding requirements.txt.

    :param extra_frames: int, number of frames to look back; default is 0.
    :return: str, the project home directory.
    """
    frame = inspect.stack()[2 + extra_frames]
    module = inspect.getsourcefile(frame[0])
    if not module:
        raise Exception("Sorry, wasn't able to guess your location. Let devs know about this issue.")
    directory = os.path.dirname(module)
    current_directory = directory
    max_level = 3
    while max_level:
        requirements_file = os.path.abspath(os.path.join(current_directory, "requirements.txt"))
        if os.path.exists(requirements_file):
            return current_directory
        current_directory = os.path.abspath(os.path.join(current_directory, ".."))
        max_level -= 1
    sys.stderr.write("Sorry, can't find the project home; returning the location of the caller: %s\n" % directory)
    return directory


def load_config(project_home=None, extra_frames=0):
    """
    Loads configuration from config.py and also from local_config.py.

    :param project_home: str, location of the home - we'll always try to load config files from there.
    :param extra_frames: int, number of frames to look back; default is 2.
    :return: dict, the configuration dictionary.
    """
    config = {}

    if project_home is not None:
        project_home = os.path.abspath(project_home)
        if not os.path.exists(project_home):
            raise Exception("{project_home} doesn't exist".format(project_home=project_home))
    else:
        project_home = _get_project_home_directory(extra_frames=extra_frames)

    if project_home not in sys.path:
        sys.path.append(project_home)

    config["PROJECT_HOME"] = project_home

    config.update(load_configuration_module(os.path.join(project_home, "config.py")))
    config.update(load_configuration_module(os.path.join(project_home, "local_config.py")))
    update_config_from_environment(config)

    return config


def update_config_from_environment(conf):
    for key in conf.keys():
        if key in os.environ:
            conf[key] = os.environ[key]


def load_configuration_module(filename):
    """
    Loads a module from a given filename.

    :param filename: str, the filename of the module to load.
    :return: dict, the module's attributes as a dictionary.
    """
    filename = os.path.join(filename)
    module = imp.import_module("config")
    module.__file__ = filename
    try:
        with open(filename) as config_file:
            exec(compile(config_file.read(), filename, "exec"), module.__dict__)
    except IOError:
        pass
    result = {}
    update_config_from_object(module, result)
    return result


def update_config_from_object(from_obj, to_obj):
    """
    Updates the values from the given object. Only the uppercase variables in that object are stored in the config.

    :param from_obj: object, the object to load attributes from.
    :param to_obj: dict, the dictionary to update with attributes.
    """
    for key in dir(from_obj):
        if key.isupper():
            to_obj[key] = getattr(from_obj, key)
