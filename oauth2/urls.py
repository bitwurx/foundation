from django.conf.urls import patterns, url

urlpatterns = patterns('',
	url(r'google_oauth2/', 'oauth2.views.google_oauth2', name='goauth2'),
    url(r'login/', 'oauth2.views.login_user', name='login'),
    url(r'logout/', 'oauth2.views.logout_user', name='logout'),
)