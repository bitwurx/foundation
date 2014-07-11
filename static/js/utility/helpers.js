define([], function() {
	var Utility = 
	{
		createCookie: function(name,value,days) {
			var isSet = Utility.readCookie(name);
			if (!isSet || isSet != "") {
				if (days) {
					var date = new Date();
					date.setTime(date.getTime()+(days*24*60*60*1000));
					var expires = "; expires="+date.toGMTString();
				}
				else var expires = "";
				document.cookie = name+"="+value+expires+"; path=/";
			} else {
				Utility.eraseCookie(name);
				Utility.createCookie(name, value, days);
			}
		},
		readCookie: function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		},
		eraseCookie: function(name) {
			Utility.createCookie(name,"",-1);
		}
	}

	return Utility;
})