define([
	'jquery',
	'underscore',
	'backbone',
	'foundation',
	'app/models/company',
	'utility/templateHelpers'
], function($, _, Backbone, Foundation, Company, TemplateHelpers) {
	var Companies = Backbone.Collection.extend({
		model: Company,
		url: function() {
			return this.instanceUrl
		},
		initialize: function(models, options) {
			var foundationConfig = new Foundation.Config();
			var team = $('select#team-select').find(':selected').attr('id');
			if (window.location.pathname == '/' || window.location.pathname == '/active/') 
				this.instanceUrl = foundationConfig.apiUrl + '/companies?status=active';
			else if (window.location.pathname == '/follow-up/') 
				this.instanceUrl = foundationConfig.apiUrl + '/companies?status=followup';
		},
		comparator: function(collection) {
			return _.map(collection.get('name'), function(letter) {
				return String.fromCharCode(letter.charCodeAt())
			});
		}
	});
	
	return Companies;
})