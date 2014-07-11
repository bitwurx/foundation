import json
from django.http import HttpResponse
from vendor.api.apiviews import RestView
from vendor.session.user import ActiveUser
from models import Color

class CalendarView(RestView):
    def get(self, request, *args, **kwargs):
        user = ActiveUser(request.user)
        calendars = user.get_calendars()
        return HttpResponse(json.dumps(calendars, indent=4), content_type='application/json')

    def post(self, request, *args, **kwargs):
    	pass

class ColorView(RestView):
    model = Color