"""Vocabularies"""

import grok

from zope.component import getUtility
from zope.schema.interfaces import IVocabularyFactory, ISource
from zope.schema.vocabulary import SimpleVocabulary, SimpleTerm

from z3c.objpath.interfaces import IObjectPath
from zope.app.authentication.interfaces import IAuthenticatorPlugin

from merlot import interfaces as ifaces


class ProjectsVocabulary(grok.GlobalUtility):
    """A vocabulary with all the existing projects"""
    grok.implements(ISource, IVocabularyFactory)
    grok.provides(IVocabularyFactory)
    grok.name('merlot.ProjectsVocabulary')

    def __call__(self, context=None):
        site = grok.getSite()
        path = getUtility(IObjectPath).path

        projects = [i for i in site['projects'].values() if \
                    ifaces.IProject.providedBy(i)]
        title = lambda p: '%s (%s)' % (p.title, p.client.to_object.title)

        projects = [SimpleTerm(path(p), path(p), title(p)) for p in projects]

        all_projects = ('all', 'all', 'All projects')
        projects.insert(0, SimpleTerm(*all_projects))

        return SimpleVocabulary(projects)


class UsersVocabulary(grok.GlobalUtility):
    """A vocabulary with all the existing users"""
    grok.implements(ISource, IVocabularyFactory)
    grok.provides(IVocabularyFactory)
    grok.name('merlot.UsersVocabulary')

    def __call__(self, context=None):
        users_util = getUtility(IAuthenticatorPlugin, 'users')
        users = users_util.listUsers()
        users = [SimpleTerm(u.name, u.name, u.real_name) for u in users]

        all_users = ('all', 'all', 'All users')
        users.insert(0, SimpleTerm(*all_users))

        return SimpleVocabulary(users)
