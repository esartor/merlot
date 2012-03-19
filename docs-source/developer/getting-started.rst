..  _dev-getting-started:

Getting started with development
================================

This document will guide you through the steps of getting a development
environment up and running. This guide was written for an Ubuntu 10.10 system,
there may be some differences with other systems.

Install the required system packages
------------------------------------

Before even getting the source code, we need to make sure you have all the
system level dependencies installed. The following command will take care of
it::

    $ sudo apt-get install mercurial python-virtualenv python-dev libxslt-dev libxml2-dev


Get the source and build the development environment
----------------------------------------------------

The first thing you need to do is to clone the Mercurial repository::

    $ hg clone https://merlot.googlecode.com/hg/ merlot

Then change to the working directory, create a virtualenv right there and
activate it::

    $ cd merlot
    $ virtualenv --python=/usr/bin/python2.6 --no-site-packages .
    $ source bin/activate

Now we build the `buildout`::

    $ python bootstrap.py
    $ buildout

This usually takes a while, as the buildout command downloads all the
requirements for Merlot.

Finally, we can start the server, which will run in port 8080::

    $ merlot fg

First steps to play with the system
-----------------------------------

Once the server is up, point your browser to http://localhost:8080/ and
authenticate using `admin:admin` to access the Grok administration screen.
There you can create a Merlot application and start playing with it.

The first thing you will want to do is to add `users` and `clients`. Projects
will be later associated to clients.

Once you've added at least one client, you can proceed to add a `project`,
which is what this is all about.


Run the automated tests
-----------------------

To run Merlot automated tests, just run the following command from the working
directory::

    $ bin/test

You can generate a coverage report with the following command::

    $ bin/test -s merlot --coverage=coverage

The report files will be generated in HTML format in the `coverage` directory.


Build the documentation
-----------------------

To build the Merlot documentation, just run the following command from the
working directory::

    $ bin/sphinx-build docs-source/ docs

The documentation will be created in the `docs` directory in HTML format.
