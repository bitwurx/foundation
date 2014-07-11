from django.conf.urls import patterns, url

urlpatterns = patterns('',
	url(r'^call/', 'phones.views.call', name='call_company'),
	url(r'^hangup/', 'phones.views.hangup', name='hangup_company')
)