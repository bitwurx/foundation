# set env
import sys
import os
import datetime
vendor_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(vendor_dir)

import json
import redis
from google import calendars as gcal
from google.oauth2 import build_service

class ActiveUser():
    def __init__(self, user):
        self.user = user
        self.redis = redis.Redis('localhost')
        self.service = build_service


    def add_user(self):
        """
        Add new user to redis 'user' hash
        """
        user_data = {
            '_user': {
                'email': self.user.email,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name
            },
            '_calendars': self.get_calendars()
        }

        self.redis.hset('user',
                        self.user.id, 
                        json.dumps(user_data)
                        )
        return user_data


    def append_data(self, key, data):
        """
        Append data to redis 'user' hash user json object
        """
        if (data):
            user_data = self.get_data()
            user_data[key] = data
            self.redis.hset('user', self.user.id, user_data)


    def get_data(self):
        """
        Retrieve user data from redis 'user' hash
        """
        return self.redis.hget('user', self.user.id)


    def get_calendars(self):
        """
        Get all user calendars
        """
        calendars = gcal.GCal(self.user.id, self.redis)
        # get access token
        self.access_token = calendars.access_token
        return calendars.get_cals()


    def set_cookie(response, key, value, days_expire = 7):
        if days_expire is None:
            max_age = 365 * 24 * 60 * 60  #one year
        else:
            max_age = days_expire * 24 * 60 * 60
            expires = datetime.datetime.strftime(datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age), 
                                                 "%a, %d-%b-%Y %H:%M:%S GMT"
                                                 )
            response.set_cookie(key, 
                                value, 
                                max_age=max_age, 
                                expires=expires, 
                                domain=settings.SESSION_COOKIE_DOMAIN, 
                                secure=settings.SESSION_COOKIE_SECURE or None
                                )