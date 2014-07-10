"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

# 3rd party
import psycopg2
from constants import DB_NAME, DB_USER, DB_PASS

db = psycopg2.connect("dbname={} user={} password={}".format(
		DB_NAME, DB_USER, DB_PASS))
cursor = db.cursor()