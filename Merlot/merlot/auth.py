"""Authentication and authorization.

A simple session based authentication and authorization mechanism is
used.

You will find here definitions of the models and views related to
authentication and authorization.
"""

import grok
from zope import component
from zope.interface import Interface, Invalid

from zope.app.authentication.session import SessionCredentialsPlugin
from zope.app.authentication.interfaces import ICredentialsPlugin
from zope.app.authentication.interfaces import IAuthenticatorPlugin
from zope.app.authentication.interfaces import IPrincipalInfo
from zope.app.authentication.interfaces import IPasswordManager
from zope.app.security.interfaces import IAuthentication, \
    IUnauthenticatedPrincipal, ILogout
from zope.securitypolicy.interfaces import IPrincipalRoleManager

from zope.component import getMultiAdapter

from merlot.lib import master_template, default_form_template
from merlot.interfaces import ILoginForm, IAddUserForm, IEditUserForm, IMain, \
    IAccount
from merlot import MerlotMessageFactory as _


def setup_authentication(pau):
    pau.credentialsPlugins = ['credentials']
    pau.authenticatorPlugins = ['users']


class MySessionCredentialsPlugin(grok.GlobalUtility, SessionCredentialsPlugin):
    grok.provides(ICredentialsPlugin)
    grok.name('credentials')

    loginpagename = 'login'
    loginfield = 'login'
    passwordfield = 'password'


class LoginForm(grok.Form):
    """The login form"""
    grok.name('login-form')
    grok.context(Interface)
    label = _(u'Login')
    template = default_form_template

    prefix = ''
    form_fields = grok.Fields(ILoginForm)

    def setUpWidgets(self, ignore_request=False):
        super(LoginForm, self).setUpWidgets(ignore_request)
        self.widgets['camefrom'].type = 'hidden'

    @grok.action(_('Login'))
    def handle_login(self, **data):
        authenticated = not IUnauthenticatedPrincipal.providedBy(
            self.request.principal,
        )
        if authenticated:
            self.redirect(self.request.form.get('camefrom',
                                                self.url(grok.getSite())))
            self.flash(_(u'You are logged in.'), type=u'message')
        else:
            self.status = _(u'Login failed.')
            self.errors += (Invalid(u'Invalid username and/or password'),)
            self.form_reset = False


class Login(grok.View):
    """The login view"""
    grok.context(Interface)
    grok.require('zope.Public')
    template = master_template


class LoginViewlet(grok.Viewlet):
    """The login viewlet, which renders the login form and is
    registered for the Login view.
    """
    grok.viewletmanager(IMain)
    grok.context(Interface)
    grok.view(Login)
    grok.order(10)

    def update(self):
        self.form = getMultiAdapter((self.context, self.request),
                                    name='login-form',)
        self.form.update_form()

    def render(self):
        return self.form.render()


class Logout(grok.View):
    """The logout view"""
    grok.context(Interface)
    grok.require('merlot.Manage')

    def render(self):
        if not IUnauthenticatedPrincipal.providedBy(self.request.principal):
            auth = component.getUtility(IAuthentication)
            ILogout(auth).logout(self.request)

        self.flash(_(u'You are now logged out'), type=u'message')
        return self.redirect(self.application_url())


class PrincipalInfo(object):
    grok.implements(IPrincipalInfo)

    def __init__(self, id, title, description):
        self.id = id
        self.title = title
        self.description = description
        self.credentialsPlugin = None
        self.authenticatorPlugin = None


class UserAuthenticatorPlugin(grok.LocalUtility):
    """A local utility to manage users"""
    grok.implements(IAuthenticatorPlugin)
    grok.name('users')

    def __init__(self):
        self.user_folder = UserFolder()

    def authenticateCredentials(self, credentials):
        if not isinstance(credentials, dict):
            return None
        if not ('login' in credentials and 'password' in credentials):
            return None
        account = self.getAccount(credentials['login'])

        if account is None:
            return None
        if not account.checkPassword(credentials['password']):
            return None
        return PrincipalInfo(id=account.name,
                             title=account.real_name,
                             description=account.real_name)

    def principalInfo(self, id):
        account = self.getAccount(id)
        if account is None:
            return None
        return PrincipalInfo(id=account.name,
                             title=account.real_name,
                             description=account.real_name)

    def getAccount(self, login):
        return login in self.user_folder and self.user_folder[login] or None

    def addUser(self, username, password, real_name):
        if username not in self.user_folder:
            user = Account(username, password, real_name)
            self.user_folder[username] = user
            role_manager = IPrincipalRoleManager(grok.getSite())
            role_manager.assignRoleToPrincipal('merlot.Manager', username)

    def delUser(self, username):
        if username in self.user_folder:
            role_manager = IPrincipalRoleManager(grok.getSite())
            role_manager.removeRoleFromPrincipal('merlot.Manager', username)
            del self.user_folder[username]

    def listUsers(self):
        return self.user_folder.values()


class UserFolder(grok.Container):
    pass


class ManageUsers(grok.View):
    """The manage users view"""
    grok.context(Interface)
    grok.require('merlot.Manage')
    grok.name('manage-users')
    template = master_template

    def update(self):
        users = component.getUtility(IAuthenticatorPlugin, 'users')
        self.users = users.listUsers()


class UsersList(grok.Viewlet):
    """A viewlet that displays all existing users"""
    grok.viewletmanager(IMain)
    grok.context(Interface)
    grok.view(ManageUsers)
    grok.order(10)


class Account(grok.Model):
    grok.implements(IAccount)

    def __init__(self, name, password, real_name):
        self.name = name
        self.real_name = real_name
        self.setPassword(password)

    def setPassword(self, password):
        passwordmanager = component.getUtility(IPasswordManager, 'SHA1')
        self.password = passwordmanager.encodePassword(password)

    def checkPassword(self, password):
        passwordmanager = component.getUtility(IPasswordManager, 'SHA1')
        return passwordmanager.checkPassword(self.password, password)


class AddUserForm(grok.Form):
    """The add user form"""
    grok.context(Interface)
    grok.name('add-user-form')
    label = _(u'Add user')
    template = default_form_template

    form_fields = grok.Fields(IAddUserForm)

    @grok.action(_(u'Add user'))
    def handle_add(self, **data):
        users = component.getUtility(IAuthenticatorPlugin, 'users')
        users.addUser(data['login'], data['password'], data['real_name'])
        self.flash(_(u'User added.'), type=u'message')
        self.redirect(self.url(grok.getSite(), 'manage-users'))


class AddUser(grok.View):
    """The add user view"""
    grok.context(Interface)
    grok.name('add-user')
    grok.require('merlot.Manage')
    template = master_template


class AddUserViewlet(grok.Viewlet):
    """The add user viewlet, which renders the add user form and is
    registered for the AddUser view.
    """
    grok.viewletmanager(IMain)
    grok.context(Interface)
    grok.view(AddUser)
    grok.order(10)

    def update(self):
        self.form = getMultiAdapter((self.context, self.request),
                                    name='add-user-form')
        self.form.update_form()

    def render(self):
        return self.form.render()


class EditUserForm(grok.Form):
    """The edit user form"""
    grok.context(Interface)
    grok.name('edit-user-form')
    label = _(u'Edit user')
    template = default_form_template

    form_fields = grok.Fields(IEditUserForm)

    @grok.action(_(u'Save'))
    def edit(self, **data):
        users = component.getUtility(IAuthenticatorPlugin, 'users')
        uid = self.request.form.get('form.login')
        user = users.getAccount(uid)
        password = self.request.form.get('form.password')
        if password:
            user.setPassword(password)
        user.real_name = self.request.form.get('form.real_name')
        self.flash(_(u'Changes saved.'), type=u'message')
        self.redirect(self.url(grok.getSite(), '@@manage-users'))

    def setUpWidgets(self, ignore_request=False):
        users = component.getUtility(IAuthenticatorPlugin, 'users')
        user = users.principalInfo(self.request.get('login'))
        super(EditUserForm, self).setUpWidgets(ignore_request)
        if user:
            self.widgets['login'].setRenderedValue(user.id)
            self.widgets['login'].extra = 'readonly="true"'
            self.widgets['real_name'].setRenderedValue(user.title)


class EditUser(grok.View):
    """The edit user view"""
    grok.context(Interface)
    grok.name('edit-user')
    grok.require('merlot.Manage')
    template = master_template


class EditUserViewlet(grok.Viewlet):
    """The edit user viewlet, which renders the edit user form and is
    registered for the EditUser view.
    """
    grok.viewletmanager(IMain)
    grok.context(Interface)
    grok.view(EditUser)
    grok.order(10)

    def update(self):
        self.form = getMultiAdapter((self.context, self.request),
                                    name='edit-user-form')
        self.form.update_form()

    def render(self):
        return self.form.render()


class DeleteUser(grok.View):
    """Delete a user and return to the manage users screen"""

    grok.context(Interface)
    grok.name('delete-user')
    grok.require('merlot.Manage')

    def render(self):
        userid = self.request.get('login', None)
        if userid:
            users = component.getUtility(IAuthenticatorPlugin, 'users')
            users.delUser(userid)
            self.flash(_(u'User deleted.'), type=u'message')
        else:
            self.flash(_(u'User not found.'), type=u'error')

        self.redirect(self.url(grok.getSite(), '@@manage-users'))


class ManagerPermission(grok.Permission):
    """The manage permission"""
    grok.name('merlot.Manage')


class ManagerRole(grok.Role):
    """The manager role"""
    grok.name('merlot.Manager')
    grok.permissions('merlot.Manage')
