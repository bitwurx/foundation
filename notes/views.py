from vendor.api.apiviews import RestView
from notes.models import Note

class NoteView(RestView):
	model = Note

	class Meta:
		user_save = 'active'