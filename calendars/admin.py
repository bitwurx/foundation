from django.contrib import admin
from models import Color

class ColorAdmin(admin.ModelAdmin):
	list_display = ['name', 'hex_value']

admin.site.register(Color, ColorAdmin)