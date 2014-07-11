import re
import requests
from django.http import HttpResponse
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from models import CallCode, Phone, PrefixMap

@login_required
def call(request):
    """Place call using Cisco phone API"""

    if request.method == 'POST' and request.user.is_staff:
        try:
            phone_ip = Phone.objects.get(user=request.user).ip_address
        except Phone.DoesNotExist:
            return HttpResponse(0)
        codes = CallCode.objects.filter(user=request.user)
        pattern = '\((\d{3})\)\s(\d{3})\-(\d{4})'
        phone_no = re.findall(pattern, request.POST.get('phone_no'))[0]
        area_code = str(phone_no[0])
        phone_no = ''.join(phone_no)
        c_phone = [] # Coded phone number

        for _map in PrefixMap.objects.all():
            if str(_map.prefix) == area_code:
                for code in codes:
                    try:
                        if str(code.code)[:3] == str(_map.area_code):
                            c_phone = "%s**%s" % (code, phone_no)
                    except AttributeError:
                        pass

        # format xml
        number = c_phone if c_phone else phone_no
        url = 'http://%s:%s/CGI/Execute' % (phone_ip, '2006')
        print url
        xml = 'XML=<CiscoIPPhoneExecute> \
                   <ExecuteItem Priority="0" URL="Key:Headset"/> \
                   <ExecuteItem Priority="1" URL="Dial:' + number + '"/> \
               </CiscoIPPhoneExecute>'
        r = requests.post(url, data=xml, headers={'content-type': 'text/xml'}, auth=('user', ''))
        return HttpResponse(r)
    return HttpResponseForbidden('403 Forbidden')


def hangup(request):
    if request.method == 'GET' and request.user.is_staff:
        try:
            phone_ip = Phone.objects.get(user=request.user).ip_address
        except Phone.DoesNotExist:
            return HttpResponse(0)
        url = 'http://%s:%s/CGI/Execute' % (phone_ip, '2006') 
        xml = 'XML=<CiscoIPPhoneExecute> \
                   <ExecuteItem Priority="0" URL="Key:Headset"/> \
               </CiscoIPPhoneExecute>'
        requests.post(url, data=xml, headers={'content-type': 'text/xml'}, auth=('user', ''))
        return HttpResponse('call ended')
    return HttpResponseForbidden('403 Forbidden')