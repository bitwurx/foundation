define([
	'jquery',
	'underscore',
	'backbone',
	'foundation',
	'app/views/list',
	'app/views/company',
	'app/views/add',
	'app/views/batch',
	'app/views/tasks',
	'utility/forms',
], 
function(
	$,        // jquery
	_,        // underscore
	Backbone, // backbone
	Foundation,
	ListView,
	CompanyView,
	AddView,
	BatchView,
	TasksView,
	Forms
){
	var initialize = function() {
		Backbone.emulateJSON = true // legacy web server support
		var Router = Backbone.Router.extend({
			routes: {
				''             : 'root'     ,
				'active/'      : 'active-list'  ,  // all companies with "active" status
				'follow-up/'   : 'follow-up-list', // all compaines with "follow up" status
				'company/:id/' : 'company'  ,      // specific company by id
				'add/'         : 'add',
				'batch/'       : 'batch',
				'tasks/'       : 'tasks'
			},
			loadView: function(view) {
				this.view && this.view.remove();
				this.view = new view();
			}
		});
		var router = new Router() // router instance
		router.on('route:root', function() {
			this.loadView(ListView);
		});
		router.on('route:active-list', function() {
			this.loadView(ListView);
		});
		router.on('route:follow-up-list', function() {
			this.loadView(ListView);
		});
		router.on('route:company', function() {
			var layout = new Foundation.Layout();
			this.loadView(CompanyView)
		});
		router.on('route:add', function() {
			var layout = new Foundation.Layout();
			this.loadView(AddView);
		});
		router.on('route:batch', function() {
			var layout = new Foundation.Layout();
			this.loadView(BatchView)
		})
		router.on('route:tasks', function() {
			var layout = new Foundation.Layout();
			this.loadView(TasksView)
		})
		Backbone.history.start({pushState: true});
	};

	return {
		initialize: initialize
	};
});