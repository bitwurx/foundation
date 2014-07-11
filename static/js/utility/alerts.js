define([
	'jquery', 
	'underscore',
	'text!app/templates/alerts/confirm.html'
], function($, _, ConfirmTemplate) {
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

	return Alerts;
})