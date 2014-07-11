from django.contrib import admin
from models import Company, ListField, Tag, Profile

class CompanyAdmin(admin.ModelAdmin):
	search_fields = ['name', 'first_name']

class ProfileAdmin(admin.ModelAdmin):
	list_display = ['name', 'sic_code']

class ListFieldsAdmin(admin.ModelAdmin):
	list_display = ['name', 'order', 'relation']

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Tag)
admin.site.register(Company, CompanyAdmin)
admin.site.register(ListField, ListFieldsAdmin)