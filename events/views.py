import json
from datetime import datetime
from django.http import HttpResponse, HttpResponseNotAllowed
from django.shortcuts import render
from django.contrib.auth.models import User
from vendor.api.apiviews import RestView
from vendor.session import events
from models import Event
from tasks.models import Task
from forms import EventForm
from companies.models import Company


class EventView(RestView):
    model = Event

    def post(self, request, *args, **kwargs):
        """
        Rest POST method saves JSON formatted data to data model
        """
        if request.method == 'POST':
            # call google api and format fields
            data = json.loads(request.POST['model'])
            data.update(**{
                'company': Company.objects.get(pk=data['company']),
                'start': datetime.strptime(data.get('start'), "%m/%d/%Y %I:%M%p"),
                'end': datetime.strptime(data.get('end'), "%m/%d/%Y %I:%M%p")
            })
            # create task
            if data.get('type', None) == 'call back':
                data['scheduled'] = data['start']
                map(lambda x: data.pop(x), ['end', 'start', 'heading'])
                task = Task(**data)
                task.user = request.user
                task.save()
                return HttpResponse(request.POST['model'], content_type='application/json')
                
            # create event
            event = events.Event(data, request.user)
            event.send_event()

            # save event model
            data['company'] = data['company'].id
            data['user'] = request.user.id
            e = EventForm(data)
            if e.is_valid():
                e.save()
                return HttpResponse(request.POST['model'], content_type='application/json')
            else:
                return HttpResponse(e.errors)
            return HttpResponse(request.POST['model'])
        else: 
            return HttpResponseNotAllowed('405 Method Not Allowed')