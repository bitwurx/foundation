from django.db import models
from django.contrib.auth.models import User
from companies.models import Company

class Task(models.Model):
	user = models.ForeignKey(User, related_name="tasks")
	company = models.ForeignKey(Company, null=True)
	TYPE_CHOICES = (
		('cb', 'call back'),
	)
	type = models.CharField(max_length=25, choices=TYPE_CHOICES, default='cb')
	created = models.DateTimeField(auto_now_add=True)
	scheduled = models.DateTimeField(null=True)
	comments = models.CharField(max_length=500, null=True)
	completed = models.BooleanField(default=False)