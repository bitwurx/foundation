/**
 *******************************************************************************
 * Foundation -- Enterprise CRM & Collaboration Manager
 *******************************************************************************
 *
 * Version: 0.1(Alpha)
 * Author: Jared Patrick
 * Email: jared.p@heritageps.net
 * 
 * Copyright 2014, ALL RIGHTS RESERVED -- Heritage Payment Solutions
 */

define(['bootstrap'], function(Bootstrap) {
	return Bootstrap(function() 
	{
		/***************************************************************************
		* Config
	    ***************************************************************************/

		var Config = function() {
			/**
		     * Foundation application master config
		     * 
		     * @returns  null
		     */

			// application name
			this.name = 'Foundation';
			// set api hostname:port
			this.url = (window.location.hostname == 'localhost')
				? 'http://localhost:8888' // localhost development hostname
				: 'http://foundation.heritageps.net'; // app deployment hostname
			// api version number
			this.apiVersion = '1.0';
			this.apiUrl = this.url + '/api/' + this.apiVersion;
		}

		/***************************************************************************
		* Events
	    ***************************************************************************/

	    /* Methods for handling Foundation/Google calendar events */

		var Events = function(collections){}
		Events.prototype.initialize = function(collections) {
			/**
			 * Object intializer
			 *
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
			// company view button click handler
			viewEventBtns.on('click', function() {
				var eventSlider = $('article#events'),
					scrollSpeed = 300,
					template    = _.template($(EventsTemplate).html(), {
						'company': [$(this).attr('data-name'), $(this).attr('data-co')],
						'events': self.getEvents($(this).attr('data-co'))
					});	
				// eventSlider behaviors
				eventSlider
					.find('div.events-wrapper').remove().end() // remove any existing events
					// hide the event slider
					.find('button.close').on('click', function() {
						eventSlider
							.find('div.body').fadeOut(100).end()
							.delay(100).animate({
								'width': 0,
								'right': '-40px' // compensate for 20px horizontal padding
							}, scrollSpeed)
						}).end() // return to eventSlider
					.append(template)
					.animate({ 'width': '350px', 'right': 0 }, scrollSpeed)
					.delay(scrollSpeed).find('div.body').fadeIn(1000);
				// trigger accoridan effect on events
				self.accordian();
			});
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
				var date = dateTime.getMonth()+1  + "/"  + 
		                   dateTime.getDate()     + "/"  + 
		                   dateTime.getFullYear();
				var time = dateTime.toLocaleTimeString();
				// The date is stripped from the start and end time attributes.
				// A new attribute 'date' is created to hold the date value only.
				// The dt value (existing start/end time attribute) is overwritten 
				// with the newly formatted time value.
				event.set('date', date);
		        event.set(dt, time);
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

		/***************************************************************************
			Template Helpers
		***************************************************************************/

		/***************************************************************************
			Forms
		***************************************************************************/

		/***************************************************************************
			Layout
		***************************************************************************/

		/* Page layout helpers */

		var Layout = function(){}
		Layout.prototype.initialize = function() {
			/**
			 * Object Initializer
			 *
			 * @returns  null
			 *
			 * @see      Layout.prototype.clearHeader
			 * @see      Layout.prototype.searchToggle
			 */
			this.clearHeader();
			this.searchToggle();
		}
		Layout.prototype.clearHeader = function(rebind, duration) {
			/**
			 * Clear the app header.
			 * 
			 * * Detects content in the lock zone of the application 
			 *   which dictates rendering height
			 *
			 * @param    Boolean   rebind       Whether or not click is rebound on toggle
			 * @param    Number    duration     Speed of search filter section toggling
			 * @var      Object    self         Layout instance
			 * @var      Object    header       The application header
	         * @var      Object    contentBody  The application body (list container)
	         * @var      Object    lock         The application lock section (options/search section)
			 * @returns  null
			 *
			 * @see      Layout.prototype.searchToggle
			 */
			var self = this;
			var header = $('header#main');
			var contentBody = $('div.content-body');
			var lock = $('div.lock');

			// prevent lock div from showing if empty
			if (lock.children().length > 0) {
				lock.show(0);
				contentBody
					.animate({
						'padding-top': ((header.outerHeight()) + (lock.outerHeight())) + 'px',
					}, duration, function() {
						if (rebind) self.searchToggle();
					})
					.show(0);
				
			} else {
				contentBody
					.css('padding-top', (header.outerHeight() + 20) + 'px')
					.show();
			}
		}
		Layout.prototype.searchToggle = function() {
			/**
			 * Toggle the search filter section
			 *
			 * @var      Object  self      Layout instance
			 * @var      Number  duration  The duration of the search toggle animation
			 * @returns  null
			 *
			 * @see      Layout.prototype.clearHeader
			 */
			var self = this;
			var duration = 0;
			$('div#list-options button.search-toggle').on('click', function(e) {
				$(this).unbind('click');
				$('div#lists').css('padding-top', 0);
				$('div#find').toggle(duration, function() {
					self.clearHeader(true, duration);
				});
			});
		}

		/***************************************************************************
			Alerts
		***************************************************************************/

		/* Application wide, custom pop-up/alerts */
	
		var Alerts = function() {}
		Alerts.prototype.initialize = function() {
			/**
			 * Object initializer
			 *
			 * @returns  null
			 */
			$('div#pop-up .alert').remove(); // clear all existing alerts
			this.popup = $('div#pop-up');
			this.popup.show();
		}
		Alerts.prototype.close = function(activeAlert) {
			/**
			 * Close current alert
			 *
			 * @param    object  activeAlert  The alert instance to close
			 * @returns  null
			 */
			this.popup.hide();
			activeAlert.remove();
		}
		Alerts.prototype.confirm = function(message, confirmAction) {
			/**
			 * Custom confirm prompt
			 *
			 * @param    String    message        The message to be displyed for confirmation
			 * @param    Function  confirmAction  Callback to run on "yes" selection
			 * @var      Object    self           Alerts instance
			 * @var      Object    conirmBox      Alert element instance
			 * @returns  null
			 *
			 * @see      Alerts.prototype.close
			 */
			this.initialize();
			
			// append confirm box
			var self = this;
			this.popup.append(_.template($(ConfirmTemplate).html(), { 
				message: message 
			}));

			var confirmBox = $('.alert.confirm-box');
			// set event listeners
			confirmBox.find('button').on('click', function() {
				if ($(this).attr('data-opt') == 'true')
					confirmAction();
				else if ($(this).attr('data-opt') == 'false')
					null;
				self.close(confirmBox);
			})
		}

		/***************************************************************************
			List Actions
		***************************************************************************/
		
		return {
			Config: Config,
			Events: Events,
			Layout: Layout,
			Alerts: Alerts,
		}
	})
})
	