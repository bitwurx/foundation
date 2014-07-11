from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt
from views import CompaniesView, CompanyView, ListView, ProfilesView

urlpatterns = patterns('',
	url(r'^$', csrf_exempt(CompaniesView.as_view())),
	url(r'search', csrf_exempt(CompaniesView.as_view())),
	url(r'\d+/', csrf_exempt(CompanyView.as_view())),
	url(r'fields/', csrf_exempt(ListView.as_view())),
	url(r'profiles/', csrf_exempt(ProfilesView.as_view())),
)