define([
	'jquery',
	'underscore',
	'backbone',
	'utility/forms',
], function($, _, Backbone, Forms) {
	Add = Backbone.View.extend({
		initialize: function() {
			var addForm = new Forms.Form();
			addForm.initialize($('form#business-form'), {
				submit: 'button',
				decorate: 'required',
				vTrigger: 'blur'
			});
		}
	})

	return Add;
})