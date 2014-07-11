from django.db import models
from django.contrib.auth.models import User
from teams.models import Team

class Profile(models.Model):
	user = models.ForeignKey(User)
	team = models.ManyToManyField(Team, null=True, blank=True)
	phone = models.CharField(max_length=10, null=True, blank=True)

	def __unicode__(self):
		return self.user.first_name + " " + self.user.last_name