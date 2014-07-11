
define([
	'jquery',
	'underscore',
	'backbone',
	'utility/helpers',
	'utility/templateHelpers',
	'utility/forms',
	'app/collections/companyProfiles',
	'app/models/company',
	'app/models/note',
	'app/models/event',
	'text!app/templates/company.html'
], function(
	$,
	_,
	Backbone,
	Helpers,
	TemplateHelpers,
	Forms,
	CompanyProfiles,
	CompanyModel,
	EventModel,
	NoteModel,
	CompanyTemplate
){
	var Company = Backbone.View.extend({
		el: 'div#company',
		render: function() {
			// hide finders
			$('div#find').hide();
			this.$el.html(this.template);
			this.map(this.company);
			this.returnToList();
			form = new Forms.Form();
			form.initialize('form#company-save-form', {
				model   : this.company,
				decorate: 'highlight',
				submit  : 'input[type=submit]#company-save',
				vTrigger: 'submit',
				exclude : ['last_update', 'added_on']
			});
		},
		initialize: function() {
			var view = this;
			this.id = window.location.pathname.match(/\d+/)[0];
			this.company = new CompanyModel({id: this.id});
			this.profiles = new CompanyProfiles();
			$.when(this.company.fetch(), this.profiles.fetch()).done(function() {
				view.template = _.template($(CompanyTemplate).html(), {
					$th     : new TemplateHelpers.Base(),
					company : view.company,
					events  : view.company['events'],
					notes   : view.company['notes'],
					profiles: view.profiles.models
				}); 

				// set active company cookie
				var status = view.company.get('status')[0].toUpperCase();
				var cookie = 'activecompany[' + status + ']';
				Helpers.createCookie(cookie, view.id, 30);

				// set active company cookie to current company
				view.render();
			});
			this.listenTo(this.company, 'reset', this.render);
		},
		returnToList: function() {
			$('button.back').on('click', function() {
				window.history.back();
			});
		},
		map: function(company) {
			var map;
			var latitude;
			var longitude;
			var address  = company.get('address');
			var address2 = company.get('address2') || '';
			var city     = company.get('city');
			var state    = company.get('state').toUpperCase();
			// queue map if address isn't PO BOX
			if (address.search(/(PO|Po|po|pO).+(BOX|Box|box).+(\d)/) == -1) {
				var encodedAddress = address + ' ' + address2 + ', ' + city + ', ' + state
				// get address geolocation
				$.ajax('https://maps.googleapis.com/maps/api/geocode/json', {
					data: $.param({
						'address': encodedAddress.split(' ').join('+'),
						'sensor': 'false',
						'key': 'AIzaSyB0r-k0ctOXJn_j0YcF5GcUOHSvaV2agF4'
					}),
					success: function(data) {
						// verify geocode request returned latitude and longitude
						try {
							latitude = data.results[0].geometry.location.lat;
							longitude = data.results[0].geometry.location.lng;
							$('#map-trigger').click(); // display map
						}
						catch (err) { $('#map-canvas').hide() }
					}
				})
				google.maps.event.addDomListener(document.getElementById('map-trigger'), 'click', function() {
					var _LatLng = new google.maps.LatLng(latitude, longitude);
					var mapOptions = {
						center: new google.maps.LatLng(latitude, longitude),
						zoom: 15,
						scrollwheel: false
					};
					map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
					var marker = new google.maps.Marker({
						position: _LatLng,
						map: map,
						title: company.get('name').toProperCase()
					})
				}) 
			} else { $('#map-canvas').hide() }
			
		}
	})

	return Company;
});