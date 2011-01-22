"""This module defines all the interfaces used in the application.
"""

from random import randint
import grok
import re

from zope import schema
from zope.interface import Interface, invariant, Invalid, Attribute

from z3c.relationfield import RelationChoice
from z3c.relationfieldui import RelationSourceFactory

from merlot import MerlotMessageFactory as _


class IMerlot(Interface):
    title = schema.TextLine(title=_(u'Title'), required=True)


class IHead(Interface):
    """Head viewlet manager marker interface"""


class IHeader(Interface):
    """Header viewlet manager marker interface"""


class IMain(Interface):
    """Main viewlet manager marker interface"""


class IFooter(Interface):
    """Footer viewlet manager marker interface"""


# Sources
class ColorGenerator():
    """Color factory generator convert an (R, G, B) tuple to #RRGGBB """

    def getValues(self):
        rgb_tuple = (randint(0, 255), randint(0, 255), randint(0, 255))
        hexcolor = u'#%02x%02x%02x' % rgb_tuple
        # that's it! '%02x' means zero-padded, 2-digit hex values
        return hexcolor


class ClientSource(RelationSourceFactory):

    def getTargets(self):
        return [b for b in grok.getSite()['clients'].values()]

    def getTitle(self, value):
        return value.to_object.title


# Auth interfaces
class IUserFolder(Interface):
    title = schema.TextLine(title=_(u'Title'), required=True)


class IAccount(Interface):
    id = schema.BytesLine(title=_(u'Username'), required=True)
    real_name = schema.TextLine(title=_(u'Real name'), required=True)
    password = schema.Password(title=_(u'Password'), required=True)


class ILoginForm(Interface):
    username = schema.BytesLine(title=_(u'Username'), required=False)
    camefrom = schema.BytesLine(title=u'', required=False)
    password = schema.Password(title=_(u'Password'), required=False)


class IAddUserForm(IAccount):
    confirm_password = schema.Password(title=_(u'Confirm password'),
        required=True)

    @invariant
    def matching_passwords(form):
        # XXX: we need to find out why form.password turns to be
        # something of type 'object' when we leave the field empty
        # in the edit form.
        if type(form.password) != object and \
           form.confirm_password != form.password:
            raise Invalid(_('Passwords does not match'))

    @invariant
    def valid_username(form):
        if not re.compile('^[a-z0-9]+$').match(form.id):
            raise Invalid(_('Invalid user name, only characters in [a-z0-9] '
                            'are allowed'))


# XXX: I would like to use the same interface for both the add and edit
# user forms, but grok.Fields does not seem to generate copies of the
# fields; instead, both forms end up pointing to the same actual
# fields. So when in the edit form I do
# form_fields['password'].field = False and then go back to the add
# form, the field is not required.
class IEditUserForm(IAddUserForm):
    """Edit user form"""
    password = schema.Password(title=_(u'Password'), required=False)
    confirm_password = schema.Password(title=_(u'Confirm password'),
        required=False)


class IMetadata(Interface):
    id = schema.BytesLine(title=_(u'ID'))
    creator = schema.TextLine(title=_(u'Creator'))
    creation_date = schema.Datetime(title=_(u'Creation date'))
    modification_date = schema.Datetime(title=_(u'Modification date'))


# Simple project interfaces
class IProjectContainer(Interface):
    title = schema.TextLine(title=_(u'Title'), required=True)


class IProject(Interface):
    title = schema.TextLine(title=_(u'Title'), required=True)
    description = schema.Text(title=_(u'Description'), required=False)
    status = schema.Choice(
        title=_(u'Status'),
        required=False,
        description=_(u'The status the project is in'),
        vocabulary='merlot.ProjectStatusVocabulary',
        default=u'in progress',
    )
    # chronic = schema.Bool(title=u'Chronic', required=True)
    start_date = schema.Date(
        title=_(u'Start date'),
        required=True,
    )
    end_date = schema.Date(title=_(u'End date'), required=False)
    client = RelationChoice(title=_(u'Client'),
                                  source=ClientSource(),
                                  required=True)

    @invariant
    def start_before_end(project):
        if project.end_date and project.start_date:
            if project.end_date < project.start_date:
                raise Invalid(_('Start date must preceed end date'))


class ITask(Interface):
    next_id = schema.Int(title=_(u'Next ID'), default=1)
    title = schema.TextLine(title=_(u'Title'), required=True)
    description = schema.Text(title=_(u'Description'), required=False)
    status = schema.Choice(
        title=_(u'Status'),
        required=False,
        description=_(u'The status the task is in'),
        vocabulary='merlot.ProjectStatusVocabulary',
        default=u'in progress',
    )
    start_date = schema.Date(
        title=_(u'Start date'),
        required=True,
    )
    end_date = schema.Date(title=_(u'End date'), required=False)
    estimate = schema.Decimal(title=_(u'Hours estimate'), required=False)
    remaining = schema.Decimal(title=_(u'Remaining hours'), required=False)
    priority = schema.Choice(
        title=_(u'Priority'),
        required=False,
        vocabulary='merlot.TaskPriorityVocabulary',
        default=u'normal',
    )

    def deleteFromStarredLists():
        """Remove the task from the starred tasks lists"""

    @invariant
    def start_before_end(task):
        if task.end_date and task.start_date:
            if task.end_date < task.start_date:
                raise Invalid(_('Start date must preceed end date'))


class ILog(Interface):
    description = schema.Text(title=_(u'Description'), required=True)
    date = schema.Date(
        title=_(u'Date'),
        required=True,
    )
    user = schema.BytesLine(title=_(u'Username'), required=True)
    hours = schema.Decimal(title=_(u'Worked hours'), required=True)
    remaining = schema.Decimal(
        title=_(u'Remaining hours'),
        description=_(u'The task will be automatically marked as completed if '
                       'you enter 0 here'),
        required=False)


class ITaskStats(Interface):
    """Task statistics"""

    def getWorkedHours():
        """The total amount of hours logged in the task"""

    def getUserWorkedHours():
        """The total amount of hours logged in the task by the
        authenticated user.
        """


class IProjectStats(Interface):
    """Project statistics"""

    def getWorkedHours():
        """The total amount of hours logged in the project"""

    def getUserWorkedHours():
        """The total amount of hours logged in the prject by the
        authenticated user.
        """


class IClientContainer(Interface):
    next_id = schema.Int(title=_(u'Next ID'), default=1)
    title = schema.TextLine(title=_(u'Title'), required=True)


class IClient(Interface):
    title = schema.TextLine(title=_(u'Title'), required=True)
    type = schema.Choice(
        title=_(u'Type'),
        required=False,
        description=_(u'The client type'),
        vocabulary='merlot.ClientTypeVocabulary',
        default=u'company',
    )


class ISearchable(Interface):
    title = Attribute('title')
    description = Attribute('description')
    start_date = Attribute('start_date')
    end_date = Attribute('end_date')
    client = Attribute('client')
    modification_date = Attribute('modification_date')
    user = Attribute('user')
    content_type = Attribute('content_type')
    status = Attribute('status')
    date = Attribute('date')

    def searchable_text():
        """Concatenation of all text fields to search"""

    def task():
        """The task a log is in"""

    def project():
        """The project a task or a log is in"""


class ILogsReport(Interface):
    project_or_client = schema.Choice(
        title=_(u'Project'),
        required=True,
        vocabulary='merlot.ProjectVocabulary',
        default=u'All projects',
    )
    from_date = schema.Date(
        title=_(u'From'),
        required=True
    )
    to_date = schema.Date(
        title=_(u'To'),
        required=True,
    )
    user = schema.Choice(
        title=_(u'User'),
        required=True,
        vocabulary='merlot.UserVocabulary',
        default='All users',
    )


class ITasksReport(Interface):
    projects = schema.Choice(
        title=_(u'Project'),
        required=True,
        vocabulary='merlot.ProjectVocabulary',
        default=u'All projects',
    )
    from_date = schema.Date(
        title=_(u'From'),
        required=True
    )
    to_date = schema.Date(
        title=_(u'To'),
        required=True,
    )
    user = schema.Choice(
        title=_(u'User'),
        required=True,
        vocabulary='merlot.UserVocabulary',
        default='All users',
    )


class IStarredTasks(Interface):
    """A list of starred tasks per user"""

    def getStarredTasks():
        """Return a list of starred tasks for the adapted user account"""

    def addStarredTask(task_intid):
        """Add a task to the starred tasks list"""

    def removeStarredTask(task_intid):
        """Remove a task from the starred tasks list"""
