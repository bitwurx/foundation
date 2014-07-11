define([
	'jquery',
	'underscore',
	'backbone',
	'utility/config'
], function($, _, Backbone) {
	var Users = Backbone.Collection.extend({
		url: APP_URL + '/api/1.0/users/',
		initialize: function() {
			
		}
	});
	
	return Users;
})