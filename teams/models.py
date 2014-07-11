from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):
	user = models.ForeignKey(User)

	def __unicode__(self):
		return self.user.first_name + " " + self.user.last_name