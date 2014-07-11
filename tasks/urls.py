from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import TasksView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(TasksView.as_view())),
	url(r'\d+/', csrf_exempt(TasksView.as_view()))
)