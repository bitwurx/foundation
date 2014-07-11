define([
	'jquery',
	'underscore',
	'backbone',
], function($, _, Backbone) {
	Batch = Backbone.View.extend({
		initialize: function() {
			var form = $('form#import-list');
			var formErr = $('p.error');
			var fileInput = form.find('input[type=file]');
			var selectBtn = form.find('input#browse');
			var importBtn = form.find('input#import');
			var teamSelect = form.find('select.batch-team-select');

			formErr.hide(); // hide for errors

			fileInput.on('change', function() {
				if (teamSelect.find(':selected').html() != 'Select Team') {
					var filename = $(this).val().match(/(\w|\.)+$/)[0];
					var fileExt = $(this).val().match(/\w+$/);
					fileInput.parent('fieldset').find('p.filename')
						.addClass('hasValue')
						.html(filename);
					if (fileExt == 'xls') 
						form.submit();
					else 
						formErr.html('xls extension required. Please try again').show();
				} else {
					teamSelect.addClass('error');
				}
			})
			selectBtn.on('click', function() { fileInput.click() })
			teamSelect.on('change', function() {
				$(this).removeClass('error');
			})
		}
	})

	return Batch
})