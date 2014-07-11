from django.contrib import admin
from django import forms
from django.db import models
from django.contrib.auth.models import User
from models import CallCode, Phone, PrefixMap

class CallCodeAdmin(admin.ModelAdmin):
	list_display = ('code', 'area_code')

class PhoneAdmin(admin.ModelAdmin):
	list_display = ('user', 'ip_address')

class PrefixMapAdmin(admin.ModelAdmin):
	list_display = ('prefix', 'area_code')

admin.site.register(CallCode, CallCodeAdmin)
admin.site.register(Phone, PhoneAdmin)
admin.site.register(PrefixMap, PrefixMapAdmin)