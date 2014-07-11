define([
	'jquery',
	'underscore',
	'backbone',
	'app/collections/colors',
	'utility/config'
], function($, _, Backbone, EventColors) {
	var Calendars = Backbone.Collection.extend({
		url: APP_URL + '/api/1.0/calendars/',
		initialize: function() {
			var self = this;
			var eventColors = new EventColors();
			eventColors.fetch({
				success: function() {
					self.eventColors = eventColors;
				}
			})
		}
	});
	
	return Calendars;
})