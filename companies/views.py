import re
import json
import datetime

from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from vendor.api.apiviews import RestView
from vendor.api.api import API
from vendor.batch import Xls
from vendor.session import user as user_session
from forms import CompanyForm, BatchImportField
from models import Company, ListField, Profile
from teams.models import Team
from batches.models import Batch

class CompaniesView(RestView):
    model = Company


class CompanyView(RestView):
    model = Company

    class Meta:
        relations = ('event', 'note')


class ListView(RestView):
    model = ListField


class ProfilesView(RestView):
    model = Profile


def company(request):
    return render(request, 'index.html', {
        'company': True
    })


@login_required
def company_add(request):
    """Add new company to database"""

    errors = []
    if request.method == 'POST':
        _post = request.POST.copy()
        for field, value in _post.items():
            # simple format phone
            if field == 'phone':
                _post['phone'] = ''.join(
                    re.findall('.+(\d{3}).+(\d{3}).+(\d{4})', 
                               request.POST['phone'])[0]
                )
            # prevent origin lowercase
            elif field == 'origin': 
                _post[field] = value
            # save all values as lowercase
            else:
                _post[field] = value.lower()
        form = CompanyForm(_post)
        if form.is_valid():
            company = form.save(commit=False)
            team = request.POST.get('team', None)
            if team is not None:
                team = team.split(' ')
                company.user = User.objects.get(first_name=team[0],
                                                last_name=team[1]
                                                )
            else:
                company.user = request.user
            company.save()
            # form response
            messages.success(request, 'Company Successfully Added')
            return redirect('/add')
        else:
            errors = [messages.success(request, error) for error in form.errors][0]
    return render(request, 'forms/add.html', {
        'form': CompanyForm(),
        'errors': errors,
        'teams': Team.objects.all()
    })


@login_required
def batch(request):
    """Batch add companies from .xls file"""

    if request.method == 'POST':
        form = BatchImportField(request.POST, request.FILES)
        if form.is_valid():
            xls = Xls(request, Xls.SGListParser)
            xls.save()
            messages.success(request, 'List import successful')
            return redirect('/batch')
        else:
            messages.error(request, 'Import failed')
    return render(request, 'batches.html', {
        'form': BatchImportField(),
        'teams': Team.objects.all(),
        'batches': Batch.objects.all()
    })