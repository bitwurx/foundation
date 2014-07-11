import json

from django.http import HttpResponse, HttpResponseForbidden
from django.contrib.auth.models import User
from vendor.api.apiviews import RestView
from vendor.api.api import API
from tasks.models import Task

class UserView(RestView):
    model = User


class UserTasksView(RestView):
    model = Task

    def get(self, request, *args, **kwargs):
        """Retrieve the resource(s)"""

        if request: #.is_ajax():
            uid = self.kwargs.get('user_id', None)
            tid = self.kwargs.get('task_id', None)
            user = User.objects.get(pk=uid)
            if tid is not None:
                task_set = API._serialize(user.tasks.get_queryset().get(pk=tid))
                task_set.pop('_user_cache')
            else:
                tasks_queryset = user.tasks.get_queryset()
                # get tasks through tasks foreign key queryset
                task_set = [API._serialize(task) for task in tasks_queryset]
                # remove user cache object for json dump
                [task.pop('_user_cache') for task in task_set]
            return HttpResponse(json.dumps(task_set, indent=4), 
                content_type='application/json')
        return HttpResponseForbidden('403 Forbidden')