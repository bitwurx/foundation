"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

SELECT_COMPANIES = \
"""

SELECT 
	*
FROM 
	companies_company 
LIMIT 
	10

"""

SELECT_NOTES = \
"""

SELECT 
	n.text, n.id
FROM 
	notes_note AS n INNER JOIN companies_company AS c 
ON 
	n.company_id = c.id 
WHERE 
	c.id = (%s)

"""

SELECT_PROFILE = \
"""

SELECT 
	name
FROM 
	companies_profile
WHERE 
	id = (%s)

"""