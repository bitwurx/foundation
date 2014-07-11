define([
	'jquery',
	'underscore',
	'backbone',
	'utility/config'
], function($, _, Backbone) {
	var Fields = Backbone.Collection.extend({
		url: APP_URL + '/api/1.0/events/',
	})

	return Fields;
})