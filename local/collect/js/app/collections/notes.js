define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/note',
	'utility/config'
], function($, _, Backbone, NotesModel) {
	var Fields = Backbone.Collection.extend({
		model: NotesModel,
		url: APP_URL + '/api/1.0/notes/',
	})

	return Fields;
})