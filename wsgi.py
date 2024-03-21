#! /usr/bin/env python
# -*- coding: utf-8 -*-
from werkzeug.serving import run_simple
import sys, os
#INTERP = os.path.join(os.environ['HOME'], 'uat.wolba.ch', 'bin', 'python3')
#INTERP is present twice so that the new Python interpreter knows the actual executable path
# if sys.executable != INTERP:
#     os.execl(INTERP, INTERP, *sys.argv)

from sortingtool import app as application
#application = loadapp('config:/home/path/to/site/production.ini')
if __name__ == "__main__":

    run_simple(
        '0.0.0.0', 4000, application, use_reloader=False, use_debugger=True
    )