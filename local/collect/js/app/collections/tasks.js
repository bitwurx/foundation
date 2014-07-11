define([
	'jquery',
	'underscore',
	'backbone',
	'app/models/task',
	'utility/config'
], function($, _, Backbone, TaskModel) {
	var Tasks = Backbone.Collection.extend({
		model: TaskModel,
		url: APP_URL + '/api/1.0/users/' + currentUser + '/tasks/',
	})

	return Tasks;
})