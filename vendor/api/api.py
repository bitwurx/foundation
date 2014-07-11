import re
import json
import time
import urllib
from datetime import datetime

from django.core.exceptions import ValidationError
from django.db.models.fields import FieldDoesNotExist
from django.core import serializers

class API():
    """REST API controller"""

    version = '1.0' # API Version number

    def __init__(self, request, model, meta=None, **kwargs):
        self.request = request
        self.user = request.user
        self.model = model
        self.meta = meta
        self.resource_id = self.__get_id()
        self.search_fields = []
        self.__get_search_fields()


    def fetch(self):
        """get resource"""

        # clear cache
        self.model.objects.update()
        if self.model is not None:
            self.serialized = []
            # search route
            if self.request.GET:
                self.__search_resources()
            # resource by id route
            elif self.resource_id:
                self.__get_resource()
            # all resources route
            else:
                self.__get_resources()
            return self.serialized


    def save(self):
        """save resource"""
        
        if self.request.POST.get('model'):
            resource = self.model()
            for field, value in json.loads(self.request.POST['model']).items():
                # set all field values lowercase for search parsing
                setattr(resource, field, value.lower())
            # save active user if specified
            print resource.__dict__
            if getattr(self.meta, 'user_save', None) is not None:
                resource.__dict__['user_id'] = self.request.user.id
            resource.save()
            return API._serialize(resource)


    def update(self):
        """update resource"""
        
        query = self.__parse_qs(self.request.read())
        fields = query.get('__@target', query)
        data = {}
        # pop id fields
        for field, value in query.items():
            if re.findall('.+_id$', field):
                query.pop(field)
        # pop relational fields
        map(lambda x: query.pop(x+'s', None), self.meta.relations)
        # atomic update iterated __@target value of query params
        map(lambda x: self.model.objects.filter(id=query['id']).update(**dict([(x, query[x])])), 
                      fields
                      )
        # clear cache
        self.model.objects.update()
        return API._serialize(self.model.objects.get(id=query['id']))
            

    def destroy(self):
        """Destroy resource"""

        # parse id from url path
        id = re.findall('\/([0-9a-zA-z]+)/$', self.request.path)[0]
        resource = self.model.objects.get(id=self.resource_id)
        resource.delete()
        # clear cache
        self.model.objects.update()
        return API._serialize(resource)


    def __is_search_field(self, field_name):
        """check if provided is in search fields array"""

        for _field in self.search_fields:
            if field_name == _field.__dict__['attname']:
                return True
        return False


    def __get_search_fields(self):
        """get all fields eligible for x__startswith ORM queries"""

        fields = self.model._meta.get_all_field_names()
        for field in fields:
            try:
                _field = self.model._meta.get_field(field)
                if _field.__class__.__name__ is not 'AutoField' and \
                   _field.__class__.__name__ is not 'ForeignKey' and \
                   _field.__class__.__name__ is not 'DateTimeField':
                    self.search_fields.append(_field)
            except FieldDoesNotExist:
                pass


    def __get_id(self):
        """Get id of request URI"""
        
        pattern = API.url() + '.+/(\d+)?/$'
        try:
            return re.findall(pattern, self.request.path)[0]
        except IndexError:
            pass # no id provided in URI


    def __search_resources(self):
        """search an endpoint with provided GET query parameters"""

        params = {} # query as x__startswith to be passed to data store filter
        for param in self.request.GET.items():
            if (self.__is_search_field(param[0])):
                params[param[0] + '__startswith'] = param[1]
            else:
                params[param[0]] = param[1]
        resources = json.loads(serializers.serialize('json', 
            self.model.objects.filter(**params)))
        try:
            for resource in resources:
                resource['fields']['id'] = str(resource['pk'])
                resource = resource['fields']
                self.serialized.append(resource)
        except TypeError:
            pass # No Search Criteria


    def __get_resources(self):
        """get the full collection of models"""

        resources = json.loads(serializers.serialize('json', 
            self.model.objects.all()))
        try:
            for resource in resources:
                resource['fields']['id'] = str(resource['pk'])
                resource = resource['fields']
                self.serialized.append(resource)
        except TypeError:
            pass # There are no Resources


    def __get_resource(self):
        """get a single model by associated id"""

        try:
            resource = self.model.objects.get(id=self.resource_id)
            to_json = json.loads(serializers.serialize('json', [resource]))[0]
            to_json['fields']['id'] = str(to_json['pk'])
            to_json = to_json['fields']
            # get meta relations models
            try:
                [to_json.update(**dict([(
                    "%ss" % relation, # relation key
                    self.__get_relational_queryset(resource, relation) # value
                )])) for relation in self.meta.relations]
            except AttributeError:
                pass # no class meta
            self.serialized = to_json
        except self.model.DoesNotExist:
            to_json = None # Resource not found


    def __get_relational_queryset(self, resource, relation):
        return [API._serialize(item) for 
            item in getattr(resource, '%s_set' % relation).get_queryset()]


    @staticmethod
    def _serialize(obj):
        """serialize json dump data for HttpResponse"""
        
        data = obj.__dict__
        if data.get('_state', None):
            data.pop('_state')
        if data.get('_company_cache', None):
            data.pop('_company_cache') 
        # filter datetime
        [data.update([(field, value.isoformat())]) 
            for field, value in data.items() if isinstance(value,datetime)]
        return data


    def __parse_qs(self, url):
        """parse raw url string"""

        # decode url
        url = json.loads(re.findall('^(model=)(.+)', 
                         urllib.unquote(url).decode())[0][1])
        # convert "+" space placeholders to real spaces
        for field, value in url.items():
            if value is not None and isinstance(value, unicode):
                url[field] = re.sub(
                    r'(\+)\+', # parse true "+"
                    r' \1', # true "+" space buffer
                    re.sub(r'(\+)(?=[^\+])', r' ', value) # parse encoded spaces
                ).strip() # strip white space from strings with true "+"
        return url 

    @staticmethod
    def url():
        """Returns API url"""

        return 'api/%s/' % API.version