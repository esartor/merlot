"""Vocabularies"""

import grok

from zope.component import getUtility
from zope.schema.interfaces import IVocabularyFactory, ISource
from zope.schema.vocabulary import SimpleVocabulary, SimpleTerm

from z3c.objpath.interfaces import IObjectPath

from merlot import interfaces as ifaces
from merlot import MerlotMessageFactory as _


class VocabularyFactory(grok.GlobalUtility):
    grok.baseclass()
    grok.implements(ISource, IVocabularyFactory)
    grok.provides(IVocabularyFactory)

    terms = []

    def __call__(self, context=None):
        terms_list = [SimpleTerm(*term) for term in self.terms]
        return SimpleVocabulary(terms_list)


class ProjectVocabulary(grok.GlobalUtility):
    """A vocabulary with all the existing projects"""
    grok.implements(ISource, IVocabularyFactory)
    grok.provides(IVocabularyFactory)
    grok.name('merlot.ProjectVocabulary')

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


class UserVocabulary(grok.GlobalUtility):
    """A vocabulary with all the existing users"""
    grok.implements(ISource, IVocabularyFactory)
    grok.provides(IVocabularyFactory)
    grok.name('merlot.UserVocabulary')

    def __call__(self, context=None):
        site = grok.getSite()
        users = site['users'].values()
        users = [SimpleTerm(u.username, u.username, u.real_name) for \
                 u in users]

        all_users = ('all', 'all', 'All users')
        users.insert(0, SimpleTerm(*all_users))

        return SimpleVocabulary(users)


class TaskPriorityVocabulary(VocabularyFactory):
    """A vocabulary for task priorities"""
    grok.name('merlot.TaskPriorityVocabulary')

    terms = [(u'critical', u'critical', _(u'Critical')),
             (u'high', u'high', _(u'High')),
             (u'normal', u'normal', _(u'Normal')),
             (u'low', u'low', _(u'Low'))]


class ProjectStatusVocabulary(VocabularyFactory):
    """The statuses a project or task can be in"""
    grok.name('merlot.ProjectStatusVocabulary')

    terms = [(u'in progress', u'in progress', _(u'In progress')),
             (u'blocked', u'blocked', _(u'Blocked')),
             (u'completed', u'completed', _(u'Completed'))]


class ClientTypeVocabulary(VocabularyFactory):
    """The different client types"""
    grok.name('merlot.ClientTypeVocabulary')

    terms = [(u'company', u'company', _(u'Company')),
             (u'government', u'government', _(u'Government')),
             (u'ngo', u'ngo', _(u'NGO')),
             (u'internal', u'internal', _(u'Internal')),
             (u'individual', u'individual', _(u'Individual'))]
