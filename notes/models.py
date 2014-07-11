from datetime import datetime

from django.db import models
from django.contrib.auth.models import User
from companies.models import Company
from events.models import Event

class Note(models.Model):
    user = models.ForeignKey(User)
    event = models.ForeignKey(Event, null=True, blank=True)
    company = models.ForeignKey(Company)
    text = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.text