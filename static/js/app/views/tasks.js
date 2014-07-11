define([
	'backbone',
	'app/collections/tasks',
	'text!app/templates/task.html',
], function(Backbone, Tasks, TaskTemplate) {
	var TaskView = Backbone.View.extend({
		el: 'div#lists',
		template: _.template($(TaskTemplate).html()),
		render: function() {
			var templateData = {
				tasks: this.tasks.models
			}
			_.each(templateData.tasks, function(task) {
				console.log(task);
			})
			// this.$el.html(this.template(templateData));
		},	
		initialize: function() {
			$('div.modifiers').hide();
			var view = this;
			this.tasks = new Tasks();
			this.tasks.fetch({
				success: function(data) {
					
				}
			})
		}
	})

	return TaskView;
});