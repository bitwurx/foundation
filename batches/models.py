from django.db import models
from django.contrib.auth.models import User
from teams.models import Team

class Batch(models.Model):
	user = models.ForeignKey(User)
	team = models.ForeignKey(Team)
	quantity = models.IntegerField()
	timestamp = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name_plural = 'Batches'

	def __unicode__(self):
		return str(self.id)