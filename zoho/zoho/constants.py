"""
Jared Patrick <jared@bitwurx.com>

Foundation CRM to Zoho CRM migration module

***DO NOT USE WITHOUT EXPRESS PERMISSION
"""

#stdlib
import getpass

# zoho api
ZOHO_API_USER = "jared.p@heritageps.net"
ZOHO_API_PASS = "Summoner1!" # getpass.getpass("ZOHO password: ")
ZOHO_API_AUTH_URI = \
	"https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoCRM/crmap"
ZOHO_CRM_API_URI = "https://crm.zoho.com/crm/private/xml"
ZOHO_CRM_API_USERS_URI = "https://crm.zoho.com/crm/private/json"
ZOHO_AUTH_TOKEN = "062cf58af1d66b0b956d815d76107219"
ZOHO_CRM_SCOPE = "crmapi"
# database
DB_NAME = "crm"
DB_USER = "jared"
DB_PASS = "9tailz" # getpass.getpass("Postgres password: ")