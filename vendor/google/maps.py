import requests
import urllib

API_KEY = 'AIzaSyB0r-k0ctOXJn_j0YcF5GcUOHSvaV2agF4'
URL = 'http://maps.googleapis.com/maps/api/staticmap'
r = requests.get("%s?center=Raleigh,NC&size=400x400&key=%s" % (URL, API_KEY))
print r.__dict__['encoding']
# for key, value in r.__dict__.items():
	# print key