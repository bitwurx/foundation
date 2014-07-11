define([
	'jquery',
	'underscore',
	'backbone',
	'utility/config'
], function($, _, Backbone) {
	var Company = Backbone.Model.extend({
		urlRoot: APP_URL + '/api/1.0/companies',
		add: function() {
			return;
		}
	})
	
	return Company;
})