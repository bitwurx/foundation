import re
import hashlib
import requests

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from vendor.google import oauth2
from users.models import Profile

def google_oauth2(request):
    """
    retrieve google oauth2 authentication url
    """
    return redirect(oauth2.get_auth_url(request))

def login_user(request):
    """
    log in user using google oauth2 credentials
    """
    code = request.GET.get('code')

    print request.GET
    if code:
        credentials = oauth2.exchange(code)
        access_token = credentials.__dict__['access_token']
        user_info = requests.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token).json()
        if user_info.get('hd') == oauth2.DOMAIN and user_info.get('verified_email'):
            username = user_info.get('email')
            password = user_info.get('id')

            # get user verbose name
            name_pattern = '(\w+)\s(\w+)'
            first_name = re.findall(name_pattern, user_info['name'])[0][0]
            last_name = re.findall(name_pattern, user_info['name'])[0][1]
            
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = User(username=username,
                            password=password,
                            first_name=first_name,
                            last_name=last_name
                            )
                user.set_password(user_info['id'])
                user.save()
            try:
                profile = user.profile_set.get_queryset()[0]
                print profile
            except IndexError:
                profile = Profile(user=user)
                profile.save()
            user = authenticate(username=username,
            	                password=password
            	                )
            if user is not None:
                login(request, user)
                oauth2.store_cred(credentials, user.id) # store oauth2 credentials
                request.session.set_expiry(3500)      # set sessions expiration to match google oauth timeout
                return redirect('/')
            return HttpResponse('Something went wrong')
        return redirect('/')
    return redirect('/accounts/google_oauth2/')

def logout_user(request):
    """
    Log out user (Recursively log the user out of thier Google account)
    """
    logout(request)
    return redirect('https://accounts.google.com/logout')