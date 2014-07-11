define([
	'jquery',
	'underscore',
	'backbone',
	'text!app/templates/forms/times.html',
	'jquery-ui'
], function($, _, Backbone, EventTimesTemplate) {
	/* */

	var Form = function(){}
	Form.prototype.initialize = function(form, options) {
		/**
		 *
		 *
		 */
		this.form    = $(form);
		this.options = options;
		this.valid   = false;
		this.fields  = {};
		this.CSRF();
		this.validate();
	}
	Form.prototype.CSRF = function() {
		/**
		 *
		 *
		 */
		$this = this;
		var csrftoken = this.getCookie('csrftoken');
        $.ajaxSetup({
            crossDomain: false, // obviates need for sameOrigin test
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    }
    Form.prototype.getCookie = function(name) {
    	/**
		 *
		 *
		 */
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        } 
        return cookieValue;
    }
	Form.prototype.validate = function() {
		/**
		 *
		 *
		 */
		var thisForm = this;

		$.each(thisForm.form, function() {
			var form   = $(this);
			var fields = [];
			var valid  = {};
			$.each(form.find('input[type=text], textarea, url, email, select'), function() {
				$this = $(this);
				if ($this.attr('data-req') == 'true') {
					if (thisForm.options.decorate === 'required')
						$this.siblings('label').append('<span class="required">*</span>');
					fields.push($this);
				}
			})
			$.each(fields, function() {
				var $this        = $(this);
				var fieldName    = $(this).attr('name');
				valid[fieldName] = false; // set valid object key to false until field validates

				$this.fn = thisForm[$(this).attr('data-vfn') + 'Validator'];
				$this
					.on('change', function() {  // clear error class for fields with 'highlight' decorators
						if ($this.siblings('small.FormError').length == 0)
							$this.removeClass('failed');
					})	
				if (thisForm.options.vTrigger == 'submit') {
					form.find(thisForm.options.submit).on('click', function(e) {
						e.preventDefault();
						thisForm.run($this, valid);
					});
				} else {
					$this.on(thisForm.options.vTrigger, function() {
						thisForm.run($this, valid);
					});
				}
			});
			$.each(form.find(thisForm.options.submit), function() {
				$(this).on('click', function(e) {
					if (thisForm.options.family) 
						thisForm.form = $(this).closest('form');
					e.preventDefault();
					thisForm.checkValid(valid);
					if (thisForm.valid === true) { // submit form if no errors are present
						thisForm.submit(form);
					} else {
						if (thisForm.options.decorate)
							for (var field in valid)       // if there are errors trigger all invalid fields for user correction
								if (valid[field] == false)
									thisForm.invalid($('#id_' + field));
					}
				})
			})
		})
	}
	Form.prototype.run = function(obj, fields) {
		/**
		 *
		 *
		 */
		var fieldName = obj.attr('name');
		var value     = obj.val();
		if (!value) {
			if (this.options.decorate)
				this.invalid(obj); // set field invalid if no value
			fields[fieldName] = false;
		} else {
			if (typeof(obj.fn) == 'function') {
				fields[fieldName] = obj.fn(value);
			} else {
				fields[fieldName] = true;
				this.fields[fieldName] = value;
			}
			obj.removeClass('failed')
			   .siblings('small.required').remove();
		}
	}
	Form.prototype.phoneValidator = function(value) {
		/**
		 *
		 *
		 */
		if (value) {
			var pattern = /.*(\d{3}).*(\d{3}).*(\d{4}).*/;
			var number  = value.match(pattern);
			if (number) {
				var aCode = number[1];
				var pfx   = number[2];
				var line  = number[3];
				this.val('(' + aCode + ')' + ' ' + pfx + '-' + line)
					.siblings('small.FormError').remove();
				return true;
			} else {
				if (this.siblings('small.FormError').length < 1)
					this.after('<small class="FormError">Invalid Number</small>')
				return false;
			}
		}
	}
	Form.prototype.checkValid = function(field_set) {
		/**
		 *
		 *
		 */
		for (field in field_set)
			if (field_set[field] == false)
				return;
		this.valid = true;
	}
	Form.prototype.invalid = function(obj) {
		/**
		 *
		 *
		 */
		obj.addClass('failed');
		if (this.options.decorate === 'required') {
			if (obj.val().length < 1) // remove error classes if no value is present
				obj.siblings('small.FormError').remove();
			if (obj.siblings('small.required').length < 1 && //  
				obj.siblings('small.FormError').length < 1) 
				obj.after('<small class="required">Field Required</small>')
				   .siblings('small.FormError').remove();
		}
	}
	Form.prototype.submit = function(form) {
		/**
		 *
		 *
		 */
		var thisForm = this;
		if (this.options.model) {
			var fields = this.form.find('input[type=text], input[type=email], input[type=hidden], input[type=password], textarea, select');
			var model = (typeof this.options.model == 'function')
				? new this.options.model() 
				: this.options.model;
			var set = model.models || model;
			var target = (this.save) ? this : model;
			// set field values
			$.each(fields, function() {
				var $this = $(this);
				// search for id attribute on select fields options
				if (this.nodeName == 'SELECT') {
					var id = $this.find(':selected').attr('data-id');
					if (id) thisForm.fields[$this.attr('name')] = id;
				} else
					thisForm.fields[$this.attr('name')] = $this.val();
			});
			// set and clear fields
			model.set(this.fields);
			console.log(this.fields)
			_.each(this.options['exclude'], function(attr) { model.unset(attr) });
			// save the model
			target.save(null, {
				success: function(data) {
					if (model.afterSave) model.afterSave(data);
					if (thisForm.options['clearOnSubmit'] == true)
						form.find(              // clear form inputs
							'input[type=text]',
							'input[type=email]',
							'input[type=password]',
							'select', 
							'textarea'
						).val('');
				},
				error: function() {
					console.log('error');
				}
			});
		} else form.submit();
	}

	var EventForm = function(){};
	EventForm.prototype = new Form();
	EventForm.constructor = EventForm;
	EventForm.prototype.initialize = function(event, form, options) {
		/**
		 *
		 *
		 */
		this.event = event;
		this.form = form;
		this.options = options;
		this.valid = false;
		this.fields = {};
		this.datepicker();
		this.rbgAsHex();
		this.colors();
		this.validate();
	}
	EventForm.prototype.submit = function() {
		/**
		 *
		 *
		 */
		var thisForm = this;
		if (this.options.model) {
			var event = new this.options.model();
			var fields = this.form.find('input[type=text], input[type=email], input[type=hidden], input[type=password], textarea, select');

			$.each(fields, function() {
				var $this = $(this);
				if ($this.attr('name') == 'calendar') {
					var option = $this.find(':selected')
					thisForm.fields[$this.attr('name')] = option.attr('data-id');
				} else {
					thisForm.fields[$this.attr('name')] = $this.val();
				}
			}); this.formatDateTime('start');
			event.set(this.fields);
			event.save(null, {
				success: function(data) {
					event.addEvent(data);
					thisForm.clean();
				},
				error: function(msg) {
					console.error(msg);
				}
			});
		} else console.error('No model provided to save');
	}
	EventForm.prototype.clean = function() {
		/**
		 *
		 *
		 */
		var self = this;
		var speed = 300;
		$('div.event').fadeOut(speed);
		$('div#overlay').delay(speed).fadeOut(speed, function() {
			$('div#pop-up').hide();
			$('div#overlay').show();
			self.event.remove();
			self.form.remove();
		});
		if (window.location.pathname != '/follow-up/')
			this.options.company.next().remove().end().remove(); // remove company from list

	}
	EventForm.prototype.formatDateTime = function() {
		/**
		 *
		 *
		 */
		var thisForm = this;
		$.each([
			['start', this.fields['start-date'], this.fields['start-time']], 
			['end'  , this.fields['end-date'  ], this.fields['end-time'  ]]
		], function() {
			if (this[1] != undefined) {
				var datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
					timePattern = /(\d+):(\d{2})((am|pm))/;
					date  = this[1].match(datePattern);
					time  = this[2].match(timePattern);
				thisForm.fields[this[0]] = date[0] + " " + time[0];
			} else {
				thisForm.fields['end'] = thisForm.fields['start'];
			}
		});

		delete this.fields['start-date'];
		delete this.fields['start-time'];
		delete this.fields['end-date'  ];
		delete this.fields['end-time'  ];
	}
	EventForm.prototype.colors = function() {
		/**
		 *
		 *
		 */
		var eventColors = this.form.find('div#g-colors');
			colorOptions = eventColors.find('p.g-color');
			colorField = this.form.find('input#cal-color');

		colorOptions.first().addClass('selected');
		eventColors
			.find('p').on('click', function() {
				$this = $(this);
				colorOptions.removeClass('selected');
				$this.addClass('selected');
				colorField.val($this.css('backgroundColor'));
			});
	}
	EventForm.prototype.datepicker = function() {
		/**
		 *
		 *
		 */
		this.form.find('select.time').append(_.template($(EventTimesTemplate).html(),{}));
		var dateInputs = this.form.find('input.date');
		dateInputs.datepicker({showOtherMonths: true});

		var datepicker = $('div#ui-datepicker-div');
		$(window)
			.scroll(function() { datepicker.fadeOut(); })
			.resize(function() { datepicker.fadeOut(); });
	}
	EventForm.prototype.rbgAsHex = function() {
		/**
		 *
		 *
		 */
		$.cssHooks.backgroundColor = {
		    get: function(elem) {
		        if (elem.currentStyle)
		            var bg = elem.currentStyle["backgroundColor"];
		        else if (window.getComputedStyle)
		            var bg = document.defaultView.getComputedStyle(elem,
		                null).getPropertyValue("background-color");
		        if (bg.search("rgb") == -1)
		            return bg;
		        else {
		            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		            function hex(x) {
		                return ("0" + parseInt(x).toString(16)).slice(-2);
		            }
		            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
		        }
		    }
		}
	}

	return {
		Form: Form,
		EventForm: EventForm
	}
})