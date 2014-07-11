# set env
import sys
import os
vendor_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(vendor_dir)

import re
import json
import hashlib
from datetime import datetime
from rfc3339 import rfc3339
from google import oauth2

class Event():
    def __init__(self, data, user):
        self.data = data
        self.user = user
        self.credentials = oauth2.get_cred(user.id)


    def send_event(self):
        event = {
            'summary': "%s%s" % (self.data.get('event_type') + ' - ', self.data.get('heading')),
            'colorId': self.get_event_color(),
            'location': self.data['where'] if self.data.get('where') else '',
            'start': {
                'dateTime': self.format_datetime(self.data.get('start'))
            },
            'end': {
                'dateTime': self.format_datetime(self.data.get('end'))
            },
            'attendees': [
                {
                    'email': self.user.username
                }
            ],
            'description': self.data.get('description')
        }
        self.data['company'].status = 'followup'
        self.data['company'].save()
        service = oauth2.build_service(self.user.id, 'calendar')
        created_event = service.events().insert(calendarId=self.data['calendar'], body=event).execute()


    def get_event_color(self):
        colors = oauth2.build_service(self.user.id, 'calendar').colors().get().execute()
        event_color = '8'
        for color in colors['event'].items():
            if color[1]['background'] == self.data['color']:
                event_color = color[0]
        return event_color

    def format_datetime(self, dt):
        return dt.strftime("%Y-%m-%dT%H:%M:%S-04:00")