define(['jquery', 'utility/events'], function($, Events) {
	var TemplateHelpers = function(model, fields) {
		/**
		 * Tempate parsing/formatting helper methods
		 *
		 * @returns null
		 */
		if (this.model && this.fields) {
			this.fields = fields;
			this.model  = model;
		}
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
	TemplateHelpers.prototype.getProper = function(obj, attribute) {
		if (obj.get(attribute))
			try {
				return obj.get(attribute).toProperCase();
			} catch(err) {
				return obj.get(attribute);
			}		
	}
	TemplateHelpers.prototype.formatAreaField = function(obj) 
	{
		/**
		 * Concatenate comma separated state and city
		 *
		 * @params   Object  obj  Backbone.js model object
		 * @returns  null
		 */
		obj.attributes.area = obj.attributes.city.toProperCase() + ", " + 
		                      obj.attributes.state.toUpperCase();
	}
	TemplateHelpers.prototype.formatPhoneNo = function(obj) 
	{
		/**
		 * Convert number string to US format
		 *
		 * @params   Object  obj      Backbone.js model object
		 * @var      String  phoneNo  Backbone.js model phone attribute
		 * @var      Array   match    phone number split for individual part parsing
		 * @var      String  area     area code
		 * @var      String  prefix   dial prefix
		 * @var      String  line     line number
		 * @returns  null
		 */
		try {
			var phoneNo = obj.attributes.phone;
			var match   = phoneNo.match(/(\d{3})(\d{3})(\d{4})/);
			var area    = match[1],
			    prefix  = match[2],
			    line    = match[3];
			obj.attributes.phone = "(" + area + ")" + " " + prefix + "-" + line;
		} catch(err) { // catch index out of range
			return null;
		}
	}
	TemplateHelpers.prototype.formatDate = function(obj) 
	{
		/**
		 * Format object date 
		 *
		 * @param   Object  obj        Backbone.js model object to format date value
		 * @var     Object  date       javascript native date object
		 * @var     String  formatted  formatted date string
		 * @returns null
		 */
		var date = new Date(obj.attributes.last_update)
		var formatted = (date.getMonth()+1) + "/" + 
		                 date.getDate()     + "/" + 
		                 date.getFullYear()
		obj.attributes.last_update = formatted;
	}
	
	var ListHelpers = function(collections) {
		/**
		 * List template specific helpers
		 *
		 * @param   Object  collections  Backbone.js data collections
		 * @returns null
		 *
		 * @see     ListHelpers.prototype.getFields
		 */
		this.collections = collections;
		if (this.collections.fields)
			this.setFields();
	}
	ListHelpers.prototype = new TemplateHelpers();
	ListHelpers.constructor = ListHelpers;
	ListHelpers.prototype.get = function(company, field) 
	{
		/**
		 * Field router for template helper formatting
		 *
		 * @param    Object  company  company to retrieve formatted fields
		 * @param    String  field    field name to format
		 * @returns  String           parsed company field
		 */
		switch(field) {
			case 'phone':
				this.formatPhoneNo(company);
			case 'area':
				this.formatAreaField(company);
			case 'last_update':
				this.formatDate(company);
		}	
		return company.get(field);
	}
	ListHelpers.prototype.setFields = function() 
	{
		/**
		 * Get list table head fields
		 *
		 * @var      Object  fields       object list of fields
		 * @var      Array   classFields  fields class names
		 * @var      String  index        positional index of current field
		 * @var      String  name         name of the field
		 * @returns  object  fields
         *  
         * @see     TemplateHelpers.protoype.fieldAsClass
		 */
		this.fields = {};
		this.classFields = [];
		for (i in this.collections.fields.models) {
			var index = this.collections.fields.models[i].get('order'),
				name = this.collections.fields.models[i].get('name');
			this.fields[index] = name;
			this.fieldAsClass(name, index);
		}
	}
	ListHelpers.prototype.fieldAsClass = function(field, index) 
	{
		/**
		 * Convert provided field to underscore('_') separated string
		 * 
		 * @param   String  field      string to format
		 * @var     Number  i          field iterator
		 * @var     Array   formatted  container for formatted field classes
		 * @returns String             joined version of formatted array
		 */
		var i = 0;
		var fields = field.split(' ');
		for (i in fields)
			fields[i] = fields[i++].toLowerCase();
		this.classFields[index] = fields.join('-');
	};
	ListHelpers.prototype.getEvents = function(obj) 
	{
		/**
		 *
		 *
		 */
		var events = this.collections.events.models
		var obj_events = []
		for (var i = 0; i < events.length; i++) {
			var e = events[i];
			var event_id = e.get('company');
			var company_id = obj.get('id');
			if (event_id == company_id) {
				var date = new Date(e.attributes.created_on)
				var formatted = (date.getMonth()+1) + "/" + 
		                 		 date.getDate()     + "/" + 
		                 		 date.getFullYear()
		        e.attributes.created_on = formatted;
				obj_events.push(e);
			}
		}
		return obj_events;
	}
	ListHelpers.prototype.viewEvents = function(company) 
	{
		/**
		 *
		 *
		 */
		var events = new Events(this.events);
	}
	ListHelpers.prototype.getNotes = function(company) 
	{
		/**
		 *
		 *
		 */
		var notes = [];
		for (i in this.collections.notes.models) {   
			var note = this.collections.notes.models[i];
			if (note.get('company') == company.get('id')) {
				this.parseNote(note);
				notes.push(note);
			}	
		}
		return notes;
	}
	ListHelpers.prototype.parseNote = function(note, users) 
	{
		/**
		 *
		 *
		 */
		var users = users || this.collections.users.models;
		var date = new Date(note.attributes.timestamp)
		var formatted = date.getMonth()+1  + "/"  + 
		                date.getDate()     + "/"  + 
		                date.getFullYear() + ', ' +
		                date.toLocaleTimeString();
		note.attributes.timestamp = formatted;
		// filter user
		for (i in users) {
			if (users[i].get('id') == note.get('user') ||
				users[i].get('id') == note.get('user_id')
			){
				note.attributes.firstName = users[i].get('first_name')
				note.attributes.lastName  = users[i].get('last_name')
			}
		}
		return note;
	}

	return {
		Base: TemplateHelpers,
		ListHelpers: ListHelpers
	}
})