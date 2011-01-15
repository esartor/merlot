..  _dev-getting-started:

Getting started with development
================================

This document will guide you through the steps of getting a development
environment running. We will assume that you have `virtualenv` and `Mercurial`
globally installed in your system. This guide was written for an Ubuntu system,
there may be some differences with other systems.

The first thing you need to do is to check out the source code from the
Mercurial repository::

    $ hg clone https://merlot.googlecode.com/hg/ merlot

Then change to the working copy directory, create a virtualenv right there and
activate it::

    $ cd merlot/Merlot
    $ virtualenv --python=/usr/bin/python2.6 --no-site-packages .
    $ source bin/activate

Now we build the buildout::

    $ python bootstrap.py
    $ buildout

And finally start the server::

    $ merlot

Then point your browser to http://localhost:8080/ and authenticate using
`admin:admin` to access the Grok administration screen. There you can create a
Merlot application and start playing with it.

The first thing you will want to do is to add `users` and `clients`. Projects
will be later associated to clients.

Once you've added at least one client, you can proceed to add a `project`,
which is what this is all about.
