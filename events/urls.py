from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import EventView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(EventView.as_view())),
	url(r'\d+/', csrf_exempt(EventView.as_view())),
)