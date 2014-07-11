from datetime import datetime

from django.db import models
from django.contrib.auth.models import User
from teams.models import Team

class Profile(models.Model):
    """Company description type and associated SIC code"""

    name = models.CharField(max_length=50)
    sic_code = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        verbose_name = 'Profile'

    def __unicode__(self):
        return self.name

class Tag(models.Model):
    """Custom tags associated with business for list filtering"""

    name = models.CharField(max_length=50)

    def __unicode__(self):
        return self.name

class Company(models.Model):
    """Businesses and organizations"""

    user = models.ForeignKey(User, db_index=True)
    added_on = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100, verbose_name='Company Name', db_index=True)
    phone = models.CharField(max_length=10, null=True, db_index=True)
    fax = models.CharField(max_length=10, null=True, blank=True)
    address = models.CharField(max_length=100, null=True)
    address2 = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=25, null=True)
    state = models.CharField(max_length=2, null=True)
    zipcode = models.CharField(max_length=10, null=True, db_index=True)
    email = models.EmailField(max_length=100, null=True, blank=True) 
    website = models.URLField(max_length=100, null=True, blank=True)
    employee_count = models.IntegerField(null=True, blank=True) 
    sales_volume = models.CharField(max_length=25, null=True, blank=True)
    profile = models.ForeignKey(Profile, null=True, blank=True, db_index=True)
    first_name = models.CharField(max_length=255, null=True, db_index=True)
    last_name = models.CharField(max_length=255, null=True, blank=True) 
    title = models.CharField(max_length=255, null=True, blank=True)
    contact = models.CharField(max_length=50, null=True, blank=True)
    contact_first_name = models.CharField(max_length=255, null=True, blank=True)
    contact_last_name = models.CharField(max_length=255, null=True, blank=True) 
    contact_title = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    best_time_to_call = models.CharField(max_length=25, null=True, blank=True)
    call_access_level = models.IntegerField(default=0, null=True, blank=True)
    comments = models.CharField(max_length=255, null=True, blank=True)
    STATUS_CHOICES = (
        ('active', 'active'),
        ('followup', 'followup'),
        ('archive', 'archive')
    )
    status = models.CharField(max_length=10, 
                              choices=STATUS_CHOICES, 
                              default='active'
                              )
    tags = models.ForeignKey(Tag, null=True, blank=True)
    infoconnect_url = models.CharField(max_length=255, null=True, blank=True)
    ORIGIN_CHOICES = (
        # ('C', 'Coldcall'),
        ('L', 'Lead'),
        ('R', 'Referral')
    )
    origin = models.CharField(max_length=8, choices=ORIGIN_CHOICES, db_index=True)

    class Meta:
        verbose_name_plural = 'Companies'

    def __unicode__(self):
        return self.name

class ListField(models.Model):
    """Table list fields"""

    name = models.CharField(max_length=25)
    relation = models.CharField(max_length=255)
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "List Fields"

    def __unicode__(self):
        return self.name