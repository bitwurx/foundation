from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import UserView, UserTasksView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(UserView.as_view())),
	url(r'\d+/$', csrf_exempt(UserView.as_view())),
	url(r'(?P<user_id>\d+)/tasks/$', csrf_exempt(UserTasksView.as_view())),
	url(r'(?P<user_id>\d+)/tasks/(?P<task_id>\d+)', csrf_exempt(UserTasksView.as_view()))
)