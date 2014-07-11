define([
	'jquery',
	'underscore',
	'backbone',
	'utility/forms'
], function($, _, Backbone, Forms) {
	var AddCompanyView = Backbone.View.extend({
		initialize: function() {
			var addForm = new Forms.Form($('form#business-form'), {
				submit: 'button',
				decorate: 'required',
				vTrigger: 'blur'
			});
		}
	})
	
	return AddCompanyView;
})