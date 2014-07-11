from django.db import models
from django.contrib.auth.models import User

class CallCode(models.Model):
	user = models.ManyToManyField(User, null=True, blank=True)
	code = models.IntegerField()
	area_code = models.IntegerField(verbose_name=u'Maps to Area Code')

	class Meta:
		verbose_name_plural = "Call Codes"

	def __unicode__(self):
		return str(self.code)

class Phone(models.Model):
	user = models.ForeignKey(User)
	ip_address = models.CharField(max_length=25)

	def __unicode__(self):
		return self.ip_address

class PrefixMap(models.Model):
	prefix = models.IntegerField(verbose_name=u'Area Code')
	area_code = models.IntegerField(verbose_name=u'Map To Area Code')

	class Meta:
		verbose_name_plural = "Area Codes"

	def __unicode__(self):
		return str(self.prefix)