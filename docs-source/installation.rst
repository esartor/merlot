..  _installation:

Installing Merlot
=================

This document will guide you through the steps of installing Merlot. This guide
was written for an Ubuntu 10.10 system, there may be some differences with
other systems.

Install the required system packages
------------------------------------

Before even getting the source code, we need to make sure you have all the
system level dependencies installed. The following command will take care of
it::

    $ sudo apt-get install mercurial python-virtualenv python-dev libxslt-dev libxml2-dev python-pip


Create and build the buildout
-----------------------------

We are approaching a `buildout-based <http://www.buildout.org/>`_ installation. 

The first thing you need to do is to install the MerlotTemplates package, which
provides a `PasteScript <http://pythonpaste.org/script/>`_ template to create
a buildout that sets up Merlot::

    $ pip install MerlotTemplates

Now you are ready to create the buildout::

    $ paster create -t merlot_buildout merlot

Provide the Merlot version to be used when the question is prompted. Then
create a `virtual environment <http://pypi.python.org/pypi/virtualenv>`_ inside
the buildout directory that you've just generated::

    $ cd merlot
    $ virtualenv --python=/usr/bin/python2.6 --no-site-packages .
    $ source bin/activate

Now you can run buildout::

    $ python bootstrap.py
    $ buildout

And you are ready to start Merlot::

    $ merlot

This will start the server on port 8080 with basic authentication in front.

First steps with Merlot
-----------------------

Once the server is up, point your browser to http://localhost:8080/ and
authenticate using `admin` for both user name and password. This will take you
to an administration screen. There you can create a Merlot application.

The first thing you will want to do is to add `users` and `clients`. Projects
will be later associated to clients.

Once you've added at least one client, you can proceed to add a `project`,
that is the main concept of Merlot.
