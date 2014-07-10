"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

INSERT_LEAD = """
<row no="{row}">
	<FL val="Lead Source">{lead_source}</FL>
	<FL val="Company">{company}</FL>
	<FL val="First Name">{first_name}</FL>
	<FL val="Last Name">{last_name}</FL>
	<FL val="Email">{email}</FL>
	<FL val="Designation">{designation}</FL>
	<FL val="Phone">{phone}</FL>
	<FL val="Fax">{fax}</FL>
	<FL val="Website">{website}</FL>
	<FL val="Industry">{industry}</FL>
	<FL val="No of Employees">{employees}</FL>
	<FL val="Street">{street}</FL>
	<FL val="City">{city}</FL>
	<FL val="State">{state}</FL>
	<FL val="Country">US</FL>
	<FL val="Description">{description}</FL>
</row>"""

INSERT_NOTE = """
<row no="{row}">
	<FL val="entityID">{id}</FL>
	<FL val="Note Title">None</FL>
	<FL val="Note Content">{content}</FL>
</row>"""