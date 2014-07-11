"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

# stdlib
import re
import json
import urllib
import urllib2

# user-defined
import sql, xml
from serializer import Serializer
from constants import *
from database import cursor


def get_auth_token():
	"""Get ZOHO API token if existing token fails"""

	response = ZOHO_API_AUTH_URI + \
		"&EMAIL_ID={}&PASSWORD={}".format(ZOHO_API_USER, ZOHO_API_PASS)
	body = response.read()
	return re.search(r"(?m)^AUTHTOKEN=(\w+)$", body).group(1)


def get_cols(table):
	"""Get the columns of the specified table"""

	cursor.execute("SELECT * FROM companies_company")
	return [desc[0] for desc in cursor.description]


def fetch_with_cols(values, table):
	"""Fetch the data with colmuns from database"""

	result = {}
	cols = get_cols(table)
	for i in range(len(cols)):
		result[cols[i]] = values[i]
	return result


def parse_empty_notes(notes):
	"""Parse notes containing no text"""

	if len(notes) > 0:
		filtered = []
		for note_text, note_id, user in notes:
			# filter out notes with blank values
			if not re.match(r"^\"\s+\"$", note_text):
				filtered.append((note_text, user))
	return tuple(filtered)


def get_company_notes(cid):
	"""Get the notes for company matching the provided ID"""

	cursor.execute(sql.SELECT_NOTES, (cid,))
	notes = cursor.fetchall()
	parsed_notes = parse_empty_notes(notes)
	return cid, parsed_notes


def get_lead_ids(response):
	"""Parse zoho xml response for lead id strings"""

	zoho_id_pattern = r'<FL val="Id">(\d{19})</FL>'
	print response 
	print re.findall(zoho_id_pattern, response)
	return re.findall(zoho_id_pattern, response)


def lead_id_dict(companies, ids):
	"""Make a dictionary with company and id keys and lead id values"""

	id_map = {}
	for i, company in list(enumerate(companies)):
		company = fetch_with_cols(company, "companies_company")
		id_map[(company["name"], company["id"])] = ids[i]
	return id_map


def get_zoho_users():
	"""Get the users from ZOHO crm"""

	params = {
		"authtoken": ZOHO_AUTH_TOKEN,
		"newFormat": 1,
		"scope": ZOHO_CRM_SCOPE,
		"type": "AllUsers"
	}
	url = "{}/{}/getUsers".format(ZOHO_CRM_API_USERS_URI, "Users")
	data = urllib.urlencode(params)
	request = urllib2.Request(url, data)
	response = urllib2.urlopen(request)

	return json.loads(response.read())["users"]["user"]


def get_zoho_user(username):
	"""Get the ZOHO id of the provided username"""

	users = get_zoho_users()
	return [user for user in users if user["email"] == username][0]


def company_to_xml(company, row):
	"""Serialize and format company data to xml"""

	serializer = Serializer(
		fetch_with_cols(company, "companies_company"), cursor)
	company = serializer.serialize()

	return xml.INSERT_LEAD.format(
		row=row,
		lead_source=company.get("lead_source"),
		company=company.get("name"),
		first_name=company.get("first_name"),
		last_name=company.get("last_name"),
		email=company.get("email"),
		designation=company.get("title"),
		phone=company.get("phone"),
		fax=company.get("fax"),
		website=company.get("website"),
		employees=company.get("employee_count"),
		street=company.get("street"),
		city=company.get("city"),
		state=company.get("state").upper(),
		description=company.get("commments")
	)


def note_to_xml(note, row, lead_id):
	"""Format note data to xml"""

	content = note[0]
	user_id = note[1]
	# get the note user
	cursor.execute(sql.SELECT_USER, (user_id,))
	user = get_zoho_user(cursor.fetchone()[0])
	print user

	return xml.INSERT_NOTE.format(
		row=row,
		id=lead_id,
		content=content,
		user_id=user["id"]
	)


def _insert(scope, xml_data):
	"""insert records into provided ZOHO scope"""

	params = {
		"authtoken": ZOHO_AUTH_TOKEN,
		"newFormat": 1,
		"xmlData": xml_data,
		"scope": ZOHO_CRM_SCOPE
	}
	url = "{}/{}/insertRecords".format(ZOHO_CRM_API_URI, scope)
	data = urllib.urlencode(params)
	request = urllib2.Request(url, data)
	response = urllib2.urlopen(request)

	# return xml response
	return response.read()


def _fetch(scope):
	"""fetch records from provided ZOHO scope"""

	params = {
		"authtoken": ZOHO_AUTH_TOKEN,
		"scope": ZOHO_CRM_SCOPE
	}
	url = "{}/{}/getRecords".format(ZOHO_CRM_API_URI, scope)
	data = urllib.urlencode(params)
	request = urllib2.Request(url, data)
	response = urllib2.urlopen(request)
	xml_response = response.read()


def insert_leads(companies):
	"""Insert leads into the ZOHO API"""

	row = 1 # current row in xml data
	xml_data = '<?xml version="1.0" encoding="UTF-8"?>\n<Leads>'
	# fetch serialized xml for each company
	for company in companies:
		xml_data += company_to_xml(company, row)
		row += 1
	# append closing xml tag
	xml_data += "\n</Leads>"

	response = _insert("Leads", xml_data)
	lead_ids = get_lead_ids(response)
	return lead_id_dict(companies, lead_ids)


def insert_notes(notes, lead_id):
	"""Insert notes into the ZOHO API"""

	row = 1
	xml_data = '<?xml version="1.0" encoding="UTF-8"?>\n<Notes>'
	for note in notes[1]:
		xml_data += note_to_xml(note, row, lead_id)
		row += 1
	xml_data += "\n</Notes>"
	response = _insert("Notes", xml_data)