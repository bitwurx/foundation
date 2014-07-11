define(['jquery'], function($) {
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

	return Layout;
});