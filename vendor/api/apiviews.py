import re
import json

from api import API
from django.http import HttpResponse, HttpResponseForbidden
from django.views.generic.detail import DetailView

class RestView(DetailView):
    Meta = None # fallback assignment

    def get(self, request, *args, **kwargs):
        """Retrieve the resource(s)"""

        if request.is_ajax():
            api = API(request=request, model=self.model, meta=self.Meta) 
            return HttpResponse(json.dumps(api.fetch(), indent=4), 
                                content_type='application/json')
        return HttpResponseForbidden('403 Forbidden')


    def post(self, request, *args, **kwargs):
        """Save the resource"""
        
        if request.is_ajax():
            api = API(request=request, model=self.model, meta=self.Meta)
            return HttpResponse(json.dumps(api.save(), indent=4), 
                                content_type='application/json')
        return HttpResponseForbidden('403 Forbidden')


    def put(self, request, *args, **kwargs):
        """Update existing resource"""

        if request.is_ajax():
            api = API(request=request, model=self.model, meta=self.Meta)
            return HttpResponse(json.dumps(api.update(), indent=4), 
                                content_type='application/json')
        return HttpResponseForbidden('403 Forbidden')


    def delete(self, request, *args, **kwargs):
        """Remove the resource"""

        if request.is_ajax():
            api = API(request=request, model=self.model)
            return HttpResponse(json.dumps(api.destroy(), indent=4), 
                                content_type='application/json')
        return HttpResponseForbidden('403 Forbidden')