define([
	'jquery',
	'underscore',
	'backbone',
	'app/collections/users',
	'utility/templateHelpers',
	'text!app/templates/note.html',
	'utility/config',
], function($, _, Backbone, Users, TemplateHelpers, NoteTemplate) {
	var Note = Backbone.Model.extend({
		urlRoot: APP_URL + '/api/1.0/notes/',
		initialize: function() {
			this.templateHelpers = new TemplateHelpers.ListHelpers(this);
		},
		addNote: function(note, users) {
			note = this.templateHelpers.parseNote(note, users.models);
			var companyId  = note.get('company_id')
			var companyRow = $('table.list').find('tr#' + companyId);
			var template   = _.template($(NoteTemplate).html(), { note: note, user: user });
			companyRow.next().find('ul.notes').prepend(template);
		},
		afterSave: function(note) {
			var self = this;
			var users = new Users();
			users.fetch({
				success: function() {
					self.addNote(note, users)
				}
			})
		}
	})
	
	return Note;
})