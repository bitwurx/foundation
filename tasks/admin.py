from django.contrib import admin
from models import Task

class TaskAdmin(admin.ModelAdmin):
	list_display = [
		'company',
		'user',
		'type',
		'created',
		'scheduled',
		'comments',
		'completed'
	]

	search_fields = ['company__name']

admin.site.register(Task, TaskAdmin)