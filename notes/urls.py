from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import NoteView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(NoteView.as_view())),
	url(r'\d+/$', csrf_exempt(NoteView.as_view())),
)