from django.contrib import admin
from models import Note 

class NoteAdmin(admin.ModelAdmin):
	search_fields = ['company__name']
	list_display = ['user', 'company', 'text', 'timestamp']

admin.site.register(Note, NoteAdmin)