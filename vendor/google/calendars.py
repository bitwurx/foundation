import os
import re
import hashlib
import requests
from oauth2 import TMP_DIR, build_service
from oauth2client.file import Storage

class GCal():
	def __init__(self, user, redis):
		self.TMP_DIR = TMP_DIR
		self.user = hashlib.sha224(str(user)).hexdigest()
		self.storage = Storage("%s/%s" % (self.TMP_DIR, self.user))
		self.credentials = self.storage.get()
		self.access_token = self.credentials.__dict__['access_token']

	def get_cals(self):
		"""
		Get all google calenders associated with user
		"""

		calendars = requests.get('https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=' + self.access_token)

		cals = []
		for cal in calendars.json()['items']:
			pattern = '@group'
			if not re.findall(pattern, cal['id']):
				cal_data = {'id': cal.get('id')}
				try:
					cal_data['name'] = cal['description']
				except KeyError:
					cal_data['name'] = cal['summary']
				cals.append(cal_data)
		return cals