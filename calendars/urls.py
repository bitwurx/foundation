from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import CalendarView, ColorView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(CalendarView.as_view())),
	url(r'colors/', csrf_exempt(ColorView.as_view()))
)