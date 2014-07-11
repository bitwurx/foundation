from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from vendor.api.api import API
from views import index

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', login_required(index), name='index'),
    url(r'^add/', 'companies.views.company_add', name='add_company'),
    url(r'^company/\d+/', 'companies.views.company'),
    url(r'^batch/', 'companies.views.batch', name='batches'),
    url(r'^phone/', include('phones.urls')),
    url(r'^accounts/', include('oauth2.urls'), name='login'),
    url(r'^admin/', include(admin.site.urls)),
)

# API endpoints
urlpatterns += patterns('',
	url(r'^' + API.url() + 'companies/', include('companies.urls')),
    url(r'^' + API.url() + 'notes/', include('notes.urls')),
    url(r'^' + API.url() + 'users/', include('users.urls')),
    url(r'^' + API.url() + 'calendars/', include('calendars.urls')),
    url(r'^' + API.url() + 'events/', include('events.urls')),
    url(r'^' + API.url() + 'tasks/', include('tasks.urls'))
)

# Backbone Urls
urlpatterns += patterns('',
	url(r'^active', login_required(index), name='active-list'),
	url(r'^follow-up', login_required(index), name='follow-up-list'),
    url(r'^tasks', login_required(index), name='task-list')
)