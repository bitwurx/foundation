define([
	'jquery',
	'underscore',
	'backbone',
	'text!app/templates/events.html'
], function($, _, Backbone, EventsTemplate) { 
	/* Methods for handling Foundation/Google calendar events */

	var Events = function(collections) {}
	Events.prototype.initialize = function(collections) {
		/**
		 * @param   Object  collections  set of collections from calling view
		 * @returns null
		 *
		 * @see     Events.prototype.eventSlider
		 */
		this.events = collections.events;
		this.users = collections.users;
		this.eventSlider();
	}
	Events.prototype.eventSlider = function() {
		/**
         * Event slider behavior handler
		 *
		 * @var      Object  self           this Event object
		 * @var      Object  viewEventBtns  jQuery set of view event buttons
		 * @var      Object  eventSlider    events article (right side pop-in)
		 * @var      String  template       underscore.js template
		 * @var      Number  scrollSpeed    the speed of the events pop-in slide animations
		 * @returns  null
		 *
		 * @see      Events.prototype.getEvents
		 * @see      Events.prototype.accordian
		 */
		var self = this;
		var viewEventBtns = $('button.view-events');
		var scrollSpeed = 300;
		// company view button click handler
		viewEventBtns.on('click', function() {
			var eventSlider = $('article#events'),
				template    = _.template($(EventsTemplate).html(), {
					'company': [$(this).attr('data-name'), $(this).attr('data-co')],
					'events': self.getEvents($(this).attr('data-co'))
				});
			// eventSlider behaviors
			eventSlider
				.find('div.events-wrapper').remove().end() // remove any existing events
				// hide the event slider
				.find('button.close').on('click', function() {
					$(this).unbind();
					self._hideSlider(scrollSpeed);
				})
				.end() // return to eventSlider
				.append(template)
				.animate({ 'width': '350px', 'right': 0 }, scrollSpeed)
				.find('div.body').delay(scrollSpeed).fadeIn(300);
			// trigger accoridan effect on events
			self.accordian();

			$('button.fupbtn').on('click', function() {
				self._hideSlider(scrollSpeed);
			})
		});
	}
	Events.prototype._hideSlider = function(speed) {
		/**
		 * Hide the event slider
		 *
		 * @param    Number  speed  the speed of the animation
		 * @returns  null
		 */
		$('article#events').find('div.body')
			.fadeOut(speed).end()
			.delay(speed).animate({
				'width': 0,
				'right': '-40px' // compensate for 20px horizontal padding
			}, speed);
	}
	Events.prototype.getEvents = function(companyId) {
		/**
		 * Get events associated with provided company
		 *
		 * @param    String  companyId  the id of the company for event retrieval
		 * @var      Object  self       this Event object
		 * @var      array   events     holds events matched for provided company
		 * @returns  array   events
		 *
		 * @see      Events.protoype.setContext
		 */
		var self = this;
		var events = [];
		$.each(this.events.models, function() {
			if (this.attributes.company == companyId)
				events.push(self.setContext(this));
		})
		return events;
	}
	Events.prototype.setContext = function(event) {
		/**
		 * Middleware method for event context formatting
		 *
		 * @param    object  event  event object to run formatting against
		 * @returns  object  event
		 *
		 * @see      Events.prototype.getEventUser
		 * @see      Events.prototype.formatDateTime
		 */
		this.getEventUser(event);
		this.formatDateTime(event);
		return event;
	}
	Events.prototype.getEventUser = function(event) {
		/**
		 * Get the user data associated with the provided event
		 * 
		 * @param    object  event  event object to parse user from
		 * @returns  null
		 */
		$.each(this.users.models, function() {
			if (event.get('user') == this.id)
				event.attributes.username = this.get('first_name') + ' ' + 
			                                this.get('last_name');
		});
	}
	Events.prototype.formatDateTime = function(event) {
		/**
		 * Format event date, start, and end times
		 *
		 * @param    object event  event object for parsing date and time
		 * @returns  null
		 */
		_.each(['start', 'end'], function(dt) {
			// iterator dynamically calls start and get attributes of event object
			var dateTime = new Date(event.get(dt));
			var date = dateTime.getMonth()+ 1 + "/" + 
	                   dateTime.getDate()     + "/" + 
	                   dateTime.getFullYear();
	        var hours   = (dateTime.getUTCHours() % 12 == 0) 
                              ? dateTime.getUTCHours()
                              : dateTime.getUTCHours() % 12
	       	var minutes = (String(dateTime.getUTCMinutes()).length == 2) 
			                  ? dateTime.getUTCMinutes()
			                  : dateTime.getUTCMinutes() + '0'
			var meridian = (dateTime.getUTCHours() < 13) ? ' AM' : ' PM'
			var time = hours + ':' + minutes + meridian;   

			// The date is stripped from the start and end time attributes.
			// A new attribute 'date' is created to hold the date value only.
			// The dt value (existing start/end time attribute) is overwritten 
			// with the newly formatted time value.
			event.set('date', date);
	        event.set('_' + dt, time);
		})
	}
	Events.prototype.accordian = function() {
		/**
		 * Events accordian effect handler
		 *
		 * @var      object  events  event/event heaaders
		 * @var      object  $this   the current event
		 * @returns  null
		 */
		var events = $('div.events-wrapper div.event p.event-header');
		// show the first listed event
		events
			.on('click', function() {
				var $this = $(this);
				// trigger accordian only if the clicked event is not expanded
				if (!$this.hasClass('expanded')) {
					// remove all expanded classes and hide all event details
					events.removeClass('expanded');
					$('div.event-detail')
						.stop(true, true).slideUp(200);
					// add expanded class to current event and show dtails
					$this
						.addClass('expanded')
						.siblings('div.event-detail').delay(200).stop(true, true).slideDown(200)
				}
			})
			// show the first event and add expanded class
			.first().addClass('expanded').siblings('div.event-detail').show()
	}

	return Events;
});