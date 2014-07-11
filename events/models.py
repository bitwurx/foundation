from django.db import models
from django.contrib.auth.models import User
from companies.models import Company

class Event(models.Model):
	created_on = models.DateTimeField(auto_now=True)
	user = models.ForeignKey(User)
	company = models.ForeignKey(Company)
	heading = models.CharField(max_length=100)
	calendar = models.CharField(max_length=50)
	color = models.CharField(max_length=7)
	event_type = models.CharField(max_length=25, help_text='The type of event (ie. Callback or Appointment)')
	start = models.DateTimeField()
	end = models.DateTimeField()
	description = models.CharField(max_length=500, null=True, blank=True)

	def __unicode__(self):
		return self.heading