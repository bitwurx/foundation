from django.shortcuts import render
from models import Task
from vendor.api.apiviews import RestView

class TasksView(RestView):
	model = Task