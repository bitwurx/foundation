from django.contrib import admin
from models import Batch

class BatchAdmin(admin.ModelAdmin):
	list_display = [
		'id',
		'user',
		'team',
		'quantity',
		'timestamp'
	]

admin.site.register(Batch, BatchAdmin)
