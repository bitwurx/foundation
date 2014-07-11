import os
import re
import hashlib
import httplib2
from apiclient.discovery import build
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.file import Storage

TMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../tmp')
DOMAIN = 'heritageps.net'

# Google Oauth2 parameters
FLOW = OAuth2WebServerFlow(
    client_id='797031806446-h7o17q5go5iv0uvokb83tc8tvna5hgar.apps.googleusercontent.com',
    client_secret='oIRqo8duomj-D4kY5iTRR3pw',
    scope=(
        'https://www.googleapis.com/auth/userinfo#email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar',
    ),
    redirect_uri='http://foundation.heritageps.net/accounts/login'
)

def get_auth_url(request):
    if request.META['HTTP_HOST'] == 'localhost:8888':
        FLOW.redirect_uri='http://localhost:8888/accounts/login'
    elif request.META['HTTP_HOST'] == 'localhost:8000':
        FLOW.redirect_uri='http://foundation.heritageps.net/accounts/login'
    return FLOW.step1_get_authorize_url()

def exchange(code):
    return FLOW.step2_exchange(code)

def store_cred(credentials, uid):
    storage = Storage("%s/%s" %(TMP_DIR, hashlib.sha224(str(uid)).hexdigest()))
    storage.put(credentials)

def get_cred(uid):
    storage = Storage("%s/%s" %(TMP_DIR, hashlib.sha224(str(uid)).hexdigest()))
    return storage.get()

def build_service(uid, service):
    credentials = get_cred(uid)
    http = httplib2.Http()
    http = credentials.authorize(http)
    return build(service, 'v3', http=http)