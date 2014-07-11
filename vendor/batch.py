import os
import re
import csv
import xlrd
from datetime import datetime

from django.contrib.auth.models import User
from companies.models import Company, Profile
from teams.models import Team
from batches.models import Batch

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# excluded xls fields

class Xls:
    def __init__(self, request, parser):
        self.xls = request.FILES['file']
        self.request = request
        self.parser = parser


    def save(self):
        """Write xls file on the server."""

        date = datetime.utcnow().strftime("%Y-%m-%d")
        directory = '%s/xls/%s/' % (PROJECT_DIR, date)
        _file = directory + '/' + self.xls.name
        if not os.path.exists(directory):
            os.makedirs(directory)
        with open(_file, 'wb+') as destination:
            [destination.write(chunk) for chunk in self.xls.chunks()]
        self.batch(_file)


    def batch(self, xls):
        """Initialize xls workbook batch process."""
        
        workbook = xlrd.open_workbook(xls)
        sheet = workbook.sheet_by_name(workbook.sheet_names()[0])
        self.headers = sheet.row(0)
        self.index = self._getHeaders([x.value for x in sheet.row(0)])
        self.__create_batch([self.parseRow(sheet.row(i)) 
                            for i in range(1, (sheet.nrows))])


    def _getHeaders(self, headers):
        """Filter Xls parser class header exclusions."""

        exclude_indeces = [headers.index(x) for x in self.parser.EXCLUDE]
        return filter(lambda x: x not in exclude_indeces, 
                      [i for i in range(len(headers))])


    def parseRow(self, row):
        """Parse the field data in row."""

        data = {}
        for i in self.index:
            data[self.headers[i].value] = row[i].value
        # initialize parser
        username = re.findall('(\w+)\s(\w+)', self.request.POST['user'])[0]
        self.user = User.objects.get(first_name=username[0], 
                                     last_name=username[1]
                                     )
        self.parser(self.user, data)


    def __create_batch(self, data):
        Batch(**{
            'user': self.request.user,
            'team': Team.objects.get(user=self.user),
            'quantity': len(data)
        }).save()

    class SGListParser():
        # excluded columns
        EXCLUDE = [
            'Date List Produced',
            'Record Expiration Date',
            'Credit Rating Score',
            'IUSA Number',
            'SIC Code 1',
            'SIC Code Description 1'
        ]


        def __init__(self, user, row_data):
            self.data = row_data
            self.user = user
            self._match_fields()


        def __parse__(self, filter):
            """Parse the excel data"""
            
            if filter == 'zipcode':
                # Return 5 digit zip or, if applicable, Concatenate 5 digit and 
                # 4 digit zipcode
                if self.data['Mailing Zip 4']:
                    return "%s-%s" %(str(self.data['Mailing Zip Code'])[:-2],
                                     str(self.data['Mailing Zip 4'])[:-2]
                                     )
                else:
                    return str(self.data['Mailing Zip Code'])[:-2]
            elif filter == 'employee_count':
                # Convert employee count string to digit
                pattern = '.+to\s([0-9]+)'
                try:
                    return re.findall(
                        pattern, self.data['Location Employee Size Range'])[0]
                except IndexError:
                    pass
            elif filter == 'phone':
                # Regex phone number digits and concatenate
                number =  ''.join(re.findall('[0-9]+', 
                                         self.data['Phone Number Combined']))
                return number if len(number) == 10 else 0


        def _get_profile(self):
            """Get Company profile"""


            profile_args = {'name': self.data['Primary SIC Code Description'],
                            'sic_code': str(self.data['Primary SIC Code'])
                            }
            try:
                return Profile.objects.get(**profile_args)
            except Profile.DoesNotExist:
                return Profile(**profile_args).save()
            

        def _match_fields(self):
            """Match xls fields with database fields"""

            data = {
                'user': self.user,
                'name': self.data['Company Name'].lower(),
                'address': self.data['Mailing Address'].lower(),
                'city': self.data['Mailing City'].lower(),
                'state': self.data['Mailing State'].lower(),
                'zipcode': self.__parse__('zipcode'),
                'phone': self.__parse__('phone'),
                'first_name': self.data['Executive First Name'].lower(),
                'last_name': self.data['Executive Last Name'].lower(),
                'title': self.data['Executive Title'].lower(),
                'profile': self._get_profile(),
                'sales_volume': self.data['Location Sales Volume Range'],
                'employee_count': self.__parse__('employee_count'),
                'origin': 'C' # cold call
            }
            Company(**data).save()
            return len(data);