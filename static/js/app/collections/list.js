define([
	'jquery',
	'underscore',
	'backbone',
	'app/collections/calendars',
	'app/collections/fields',
	'app/collections/users',
	'app/collections/notes',
], function(
	$, 
	_, 
	Backbone,
	Calendars, 
	Fields, 
	Users,
	Notes
) {
	var List = Backbone.Collection.extend({
		collections: {
			'calendars': new Calendars(), 
			'fields'   : new Fields(), 
			'users'    : new Users(),
			'notes'    : new Notes()
		},
		fetch: function() {
			var collection = this;
			return $.when.apply(null, _.invoke(this.collections, 'fetch')).done();
		}
	});
	
	return List;
})