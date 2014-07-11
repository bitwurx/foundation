define([
	'jquery',
	'underscore',
	'backbone',
	'utility/config'
], function($, _, Backbone) {
	var Colors = Backbone.Collection.extend({
		url: APP_URL + '/api/1.0/calendars/colors/',
	});
	
	return Colors;
})