define([
	'jquery',
	'underscore',
	'backbone',
	'router',
	'utility/layout',
], function($, _, Backbone, Router, Layout) {
	// require.js modules
	var initialize = function() {
		var layout = new Layout();
		layout.initialize();
		Router.initialize();
	}

	String.prototype.toProperCase = function () 
	{
		/**
		 * Convert string to title case
		 *
		 * @returns  String
		 */
	    return this.replace(/\w\S*/g, function(txt) {
	    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	};

	return {
		initialize: initialize
	}
})