define([
	'jquery',
	'underscore',
	'backbone',
	'utility/config'
], function($, _, Backbone) {
	var Profiles = Backbone.Collection.extend({
		url: APP_URL + '/api/1.0/companies/profiles/',
	});
	
	return Profiles;
})