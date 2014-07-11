#!/usr/bin/evn python

import os
import sys

# append django project dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# set django settings environment variable
os.environ['DJANGO_SETTINGS_MODULE'] = 'crm.settings'

from companies.models import ListField
from calendars.models import Color

# list fields
[field.save() for field in [
	ListField(name="Company", order=0),
	ListField(name="Phone Number", order=1),
	ListField(name="Contact Name", order=2),
	ListField(name="Area", order=3),
	ListField(name="Last Update", order=4)
]]

# event colors
[color.save() for color in [
	Color(name="default", hex_value="cabdbf"),
	Color(name="bold-blue", hex_value="5484ed"),
	Color(name="blue", hex_value="a4bdfc"),
	Color(name="turquoise", hex_value="46d6db"),
	Color(name="green", hex_value="7ae7bf"),
	Color(name="bold-green", hex_value="51b749"),
	Color(name="yellow", hex_value="fbd75b"),
	Color(name="orange", hex_value="ffb878"),
	Color(name="red", hex_value="ff887c"),
	Color(name="bold-red", hex_value="dc2127"),
	Color(name="purple", hex_value="dbadff"),
	Color(name="gray", hex_value="e1e1e1"),
]]