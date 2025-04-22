# #! /usr/bin/env python
# -*- coding: utf-8 -*-
from werkzeug.serving import run_simple

from routes import app as application

# application = loadapp("config:/home/path/to/site/production.ini")

if __name__ == "__main__":
    """
    Entry point for running the WSGI (Web Server Gateway Interface) application
    using the Werkzeug development server.
    The application will be served on host "0.0.0.0" and port 4000.
    """
    run_simple(
        "0.0.0.0", 4000, application, use_reloader=False, use_debugger=True
    )
