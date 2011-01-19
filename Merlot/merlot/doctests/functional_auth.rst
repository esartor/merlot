Users, Authentication & Authorization Functional Tests
------------------------------------------------------

.. :doctest:
.. :setup: merlot.tests.setup
.. :teardown: merlot.tests.teardown
.. :layer: merlot.tests.browser_layer

In Merlot there are only two roles: authenticated and anonymous. If you are
authenticated you have full access to the system; if you are not logged in, you
have no permissions.

We need to create a user to play with later. First of all we access the site
as admin::

    >>> from zope.app.wsgi.testlayer import Browser
    >>> browser = Browser()
    >>> browser.addHeader('Authorization', 'Basic admin:admin')
    >>> browser.open('http://localhost/app')
    >>> 'Logged in as: Manager' in browser.contents
    True

Now we create a new user::

    >>> browser.getLink('Users').click()
    >>> browser.getLink('Add new User').click()
    >>> browser.getControl(name="form.login").value = u'user'
    >>> browser.getControl(name="form.real_name").value = u'Testing User'
    >>> browser.getControl(name="form.password").value = u'secret'
    >>> browser.getControl(name="form.confirm_password").value = u'secret'
    >>> browser.getControl("Add user").click()
    >>> 'User added' in browser.contents
    True
    >>> 'Testing User' in browser.contents
    True

We are now ready to start testing permissions. First of all let's log out from
the site to test that we can't access any pages::

    >>> browser = Browser()
    >>> browser.open('http://localhost/app')
    >>> browser.url
    'http://localhost/app/@@login?camefrom=%2Fapp%2F%40%40index'

We can't access the projects container::

    >>> browser.open('http://localhost/app/projects')
    >>> browser.url
    'http://localhost/app/@@login?camefrom=%2Fapp%2Fprojects%2F%40%40index'

We can't access the reports either::

    >>> browser.open('http://localhost/app/@@logs-report')
    >>> browser.url
    'http://localhost/app/@@login?camefrom=%2Fapp%2F%40%40logs-report'

    >>> browser.open('http://localhost/app/@@tasks-report')
    >>> browser.url
    'http://localhost/app/@@login?camefrom=%2Fapp%2F%40%40tasks-report'

We can't access the clients container::

    >>> browser.open('http://localhost/app/clients')
    >>> browser.url
    'http://localhost/app/@@login?camefrom=%2Fapp%2Fclients%2F%40%40index'

Now we authenticate using the user we created::

    >>> browser.open('http://localhost/app')
    >>> browser.getControl(name="login").value = u'user'
    >>> browser.getControl(name="password").value = u'secret'
    >>> browser.getControl("Login").click()
    >>> 'You are logged in.' in browser.contents
    True

And we can access everything. For example, we can access the projects
container::

    >>> browser.getLink('Projects').click()
    >>> browser.url
    'http://localhost/app/projects'

We can also access the reports::

    >>> browser.open('http://localhost/app/@@logs-report')
    >>> browser.url
    'http://localhost/app/@@logs-report'

    >>> browser.open('http://localhost/app/@@tasks-report')
    >>> browser.url
    'http://localhost/app/@@tasks-report'

We can also access the clients container::

    >>> browser.open('http://localhost/app/clients')
    >>> browser.url
    'http://localhost/app/clients'

Now we log in as admin again to delete the user we created::

    >>> browser = Browser()
    >>> browser.addHeader('Authorization', 'Basic admin:admin')
    >>> browser.open('http://localhost/app')
    >>> browser.getLink('Users').click()
    >>> browser.getLink('delete').click()
    >>> 'Are you sure you want to delete the "user" item?' in browser.contents
    True
    >>> browser.getControl('Delete').click()
    >>> 'User deleted.' in browser.contents
    True

Now we see the empty listing::

    >>> browser.url
    'http://localhost/app/@@manage-users'
    >>> 'There are currently no users.' in browser.contents
    True
