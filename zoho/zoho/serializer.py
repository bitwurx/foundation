"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

#stdlib
import re

# user-defined
import sql

class Serializer(object):
	"""Serialize company data"""

	TITLE_FIELDS = (
		"name",
		"first_name",
		"last_name",
		"title",
		"industry",
		"street",
		"city",
		"state"
	)

	def __init__(self, company, cursor):
		self.company = company
		self.cursor = cursor

	def serialize(self):
		"""Run serializer methods"""

		self.serialize_phone_no()
		self.serialize_profile()
		self.serialize_origin()
		self.serialize_street()
		self.to_title()
		return self.company

	def serialize_phone_no(self):
		"""Convert the phone number to US format"""

		phone = self.company["phone"]
		phone_pattern = r"\(\d{3}\) \d{3}-\d{4}"
		if not re.match(phone_pattern, phone):
			phone_no = re.match(
				".*(?P<area>\d{3}).*(?P<prefix>\d{3}).*(?P<line>\d{4})", phone)
			if phone_no is not None:
				self.company["phone"] = "({area}) {prefix}-{line}".format(
					area=phone_no.groupdict()["area"],
					prefix=phone_no.groupdict()["prefix"],
					line=phone_no.groupdict()["line"])

 
	def serialize_profile(self):
		"""Get the name value of the provided company profile id"""

		if self.company["profile_id"] is not None:
			self.cursor.execute(sql.SELECT_PROFILE, (self.company["profile_id"],))
			industry = self.cursor.fetchone()[0]
			self.company["industry"] = industry


	def serialize_street(self):
		"""Convert the address1 and address2 values to a single street value"""
		
		address = self.company["address"]
		address2 = self.company["address2"]
		self.company["street"] = address
		if address2 is not None:
			self.company["street"] += " " + address2
		pass


	def serialize_origin(self):
		self.company["lead_source"] = {
			"C": "Cold Call",
			"L": "Employee Referral",
			"R": "External Referral"
		}[self.company.get("origin")]


	def to_title(self):
		"""Convert serializer title fields to title text"""
		
		for field in Serializer.TITLE_FIELDS:
			value = self.company.get(field, None)
			if value is not None and isinstance(field, str):
				self.company[field] = value.title()