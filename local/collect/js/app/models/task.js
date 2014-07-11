define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/company',
	'utility/config',
], function($, _, Backbone, Company) {
	var Task = Backbone.Model.extend({
		urlRoot: APP_URL + '/api/1.0/tasks',
		initialize: function() {
			this.getCompany();
		},
		getCompany: function() {
			var task = this;
			var company = new Company({id: this.get('company')})

			var d = $.Deferred();
			d.promise(company);
			d.resolve()

			company.done(function() {
				company.fetch({
					success: function() {
						task.set('company', company);
					}
				})
			});
		}
	})
	
	return Task;
})