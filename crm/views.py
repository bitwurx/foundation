from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from companies.models import ListField

@login_required
def index(request):
	teams = request.user.profile_set.get_queryset()[0].team
	fields = ListField.objects.all()
	sorted_fields = [None] * len(fields)
	for field in fields:
		field.class_name = '-'.join(field.name.split()).lower()
		sorted_fields[field.order] = field

	return render(request, 'index.html', {
		'teams': teams.get_queryset(),
		'fields': sorted_fields,
		'list': True
	})