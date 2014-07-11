define([
	'jquery',
	'underscore',
	'backbone',
	'utility/forms',
	'utility/events',
	'utility/listActions',
	'utility/templateHelpers',
	'utility/layout',
	'app/collections/companies',
	'app/collections/calendars',
	'app/collections/fields',
	'app/collections/users',
	'app/collections/notes',
	'app/collections/events',
	'app/models/note',
	'text!app/templates/list.html',
	'text!app/templates/events.html'
], function(
	$,          	    
	_,           	   
	Backbone,
	Forms,
	Events,  	 
	ListActions,
	TemplateHelpers,
	Layout,
	CompaniesCollection,
	CalendarsCollection,
	FieldsCollection,
	UsersCollection,
	NotesCollection,
	EventsCollection,
	NoteModel,  
	ActiveListTemplate,
	NoteTemplate,
	EventsTemplate
) {
	var ActiveListView = Backbone.View.extend({
		el: 'div#lists',
		notes: NoteModel,
		render: function() {
			var view = this;
			this.template = _.template($(ActiveListTemplate).html(), {
				$th         : this.templateHelpers,
				companies   : this.collections.companies.models,
				fieldsLength: this.collections.fields.models.length
			}); this.$el.html(this.template);
			this.notesForm.initialize('form.biz-data', {
				model   : NoteModel,
				family  : true,
				decorate: 'highlight',
				submit  : 'input[type=submit].add-note',
				vTrigger: 'submit',
				clearOnSubmit: true
			});
			this.events.initialize(this.collections);
			this.listActions.render();
		},
		remove: function() {
			this
				.undelegateEvents()
				.stopListening()
				.$el.empty()
			return this;
		},
		initialize: function() {
			var view = this;
			this.collections = {
				'calendars': new CalendarsCollection(),
				'fields'   : new FieldsCollection(),
				'users'    : new UsersCollection(),
				'notes'    : new NotesCollection(),
				'events'   : new EventsCollection()
			}
			$.when(null, _.invoke(this.collections, 'fetch')).done(function() {
				view.companies = new CompaniesCollection();
				view.companies.fetch({
					data: $.param(view.getOrigin()),
					success: function() {
						view.collections['companies'] = view.companies;
						view.templateHelpers = new TemplateHelpers.ListHelpers(view.collections);
						view.listActions     = new ListActions(view, view.collections);
						view.events          = new Events();
						view.notesForm       = new Forms.Form();
						view.listActions.initialize();
						setTimeout(function() {
							view.render();
						}, 500)
					}
				});
			});
			this.listenTo(this.companies, 'reset', this.render);
		},
		getOrigin: function() {
			/**
			 *
			 *
			 */
			var params;
			if (window.location.pathname == '/follow-up/') {
				params = {'user': $('select#team-select').find(':selected').attr('id') };
				$('select#origin-select').hide();
			} else {
				params = {
				    'user': $('select#team-select').find(':selected').attr('id'),
					'origin': $('select#origin-select').find(':selected').attr('data-type')
				}
			}
			return params;	
		}
	});

	return ActiveListView;
})