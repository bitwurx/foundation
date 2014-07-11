"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

#!/usr/bin/env python
# -*- coding: utf-8 -*-
	
# user-defined
from zoho import sql
from zoho.core import insert_leads, insert_notes, get_company_notes, get_zoho_users, get_zoho_user
from zoho.database import db, cursor

if __name__ == "__main__":
	cursor.execute(sql.SELECT_COMPANIES)
	companies = cursor.fetchall()

	zoho_lead_ids = insert_leads(companies)

	for company, lead_id in zoho_lead_ids.items():
		company_id = company[1]
		notes = get_company_notes(company_id)
		insert_notes(notes, lead_id)

	db.close()