from django.contrib import admin
from models import Event

class EventAdmin(admin.ModelAdmin):
	list_display = [
		'company', 
		'user', 
		'event_type', 
		'start', 
		'end'
	]

admin.site.register(Event, EventAdmin)