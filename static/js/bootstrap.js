define([
	'jquery',
	'underscore',
	'backbone',
	'text!app/templates/events.html',
	'text!app/templates/alerts/confirm.html'
],
function(
	$,
	_,
	Backbone,
	EventsTemplate
) {
	var Bootstrap = function(callback) { return callback() }
	return Bootstrap;
})