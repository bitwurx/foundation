// application name
var APPNAME = 'foundation';

// set api hostname:port
if (window.location.hostname == 'localhost')
	// localhost development hostname
	var APP_URL = 'http://localhost:8888';
else
	// app deployment hostname
	var APP_URL = 'http://foundation.heritageps.net';