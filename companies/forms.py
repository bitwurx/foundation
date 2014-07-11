from django import forms
from models import Company

class CompanyForm(forms.ModelForm):
	class Meta:
		model = Company
		exclude = ('user', 'status')
		widgets = {
			'comments': forms.Textarea()
		}
		required_fields = [
			('name', 'TextInput'),
			('address', 'TextInput'),
			('city', 'TextInput'),
			('state', 'TextInput'),
			('zipcode', 'TextInput'),
			('phone', 'TextInput'),
			('origin', 'Select')
		]
		for field in required_fields:
			if (field[0] == 'phone'):
				widgets[field[0]] = getattr(forms, field[1])(attrs={
					'data-req': 'true',
					'data-vfn': 'phone'
				})
			else:	
				widgets[field[0]] = getattr(forms, field[1])(attrs={'data-req': 'true'})

class BatchImportField(forms.Form):
	file = forms.FileField()