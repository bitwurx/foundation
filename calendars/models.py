from django.db import models

class Color(models.Model):
	name = models.CharField(max_length=50)
	hex_value = models.CharField(max_length=6)
	# order = models.IntegerField()

	def __unicode__(self):
		return self.name