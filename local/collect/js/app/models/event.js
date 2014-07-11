define([
	'jquery',
	'underscore',
	'backbone',
	'utility/events',
	'app/collections/events',
	'app/collections/users',
	'utility/config'
], function($, _, Backbone, Events, EventsCollection, UsersCollection) {
	var Event = Backbone.Model.extend({
		urlRoot: APP_URL + '/api/1.0/events/',
		addEvent: function(data) {
			var collections = {
				'events': new EventsCollection(),
				'users': new UsersCollection()
			}
			$.when.apply(null, _.invoke(collections, 'fetch')).done(function() {
				var company = $('tr#' + data.get('company'));
				var companyInfo = company.next();
				var companyName = company.find('a.details').html();
				if (!companyInfo.find('button.view-events').length > 0) {
					var button = '<li><button data-name="' + companyName + '" data-co="' + 
						data.get('company') + '" class="view-events">View Events</button></li>';
					companyInfo
						.find('div.options ul').append(button)
						.find('button.view-events').hide().fadeIn(500);
				}
				var _events = new Events(collections);
			});
		}
	})
	
	return Event;
})