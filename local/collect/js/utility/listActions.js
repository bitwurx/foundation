define([
    'jquery',
    'underscore',
    'utility/helpers',
    'utility/forms',
    'utility/alerts',
    'app/models/event',
    'text!app/templates/forms/callback.html',
    'text!app/templates/forms/appointment.html',
    'text!app/templates/forms/dropin.html'
], function($, _, Helpers, Forms, Alerts, EventModel, CallbackTemplate, AppointmentTemplate, DropInTemplate) {
    var ListActions = function(view, collections) {
        /**
         * Behaviors for company lists
         *
         * @param   object  view         calling view
         * @param   object  collections  backbone collection
         * @return  null         
         */
        this.view = view;
        this.collections = collections;
    }
    ListActions.prototype.initialize = function() {
        this.ModRegister(['teamModifier', 'originModifier'])
        this.Search();
        this.Sort();
    }
    ListActions.prototype.render = function() {
        /**
         * Initialize template dependency methods post template render
         *
         * @return  null
         */
        this.Paginate();
        this.highlightLink();
        this.Accordian();
        this.callPhone();
        this.Move();
        this.event('button#cb', CallbackTemplate);
        this.event('button#appt', AppointmentTemplate);
        this.event('button#drop', DropInTemplate);
    }
    ListActions.prototype.getActiveFilter = function() {
        /**
         *
         *
         */
        var param  = {};
        if (this.activeFilter) {
            var filter = $('select#list-filters').find(':selected').attr('data-field');
            param[filter] = this.activeFilter;
        } 
        return param;
    }
    ListActions.prototype.getActiveTeam = function() {
        return 
    }
    ListActions.prototype.getListType = function() {
        var path = window.location.pathname;
        if (path == '/' || path == '/active/')
            return 'A'
        else if (path == '/follow-up/')
            return 'F';
    }
    ListActions.prototype.Paginate = function() {
        /** 
         * List Pagination 
         *
         * * multiple calls to 'select.per-page :selected' necessary for select 
         *   state changes
         *
         * @var     object  self           this Pagination context
         * @var     object  perPageSelect  select element containing pagination quantities
         * @var     object  pageBtns       prev and next page buttons
         * @var     object  perPageCount   current option of per page select
         * @return  null
         */
        Helpers.createCookie('page', 0, 30); // create pagination cookie
        var page = Number(Helpers.readCookie('page'));
        this.pageBasePos = page; // base pagination position
        var self = this;
        var perPageSelect = $('select.per-page');
        var pageBtns = $('div#list-options div#pagination button');
        self.Paginate.init(perPageSelect.find(':selected'), this.pageBasePos); // pagination initializer

        perPageSelect.on('change', function(e) {
            // prevent duplicate event handler bindings
            e.stopPropagation();
            // recalculate pagianation on change of quantity per page
            // reset page base position to zero to prevent misalignment
            self.pageBasePos = Number(Helpers.readCookie('page'));
            self.pageLimit = false;
            self.Paginate.init(perPageSelect.find(':selected'), self.pageBasePos, self.pageLimit);
        })

        // unbind to prevent duplicate click handlers
        pageBtns.unbind().on('click', function() {
            Helpers.createCookie('page', Number(self.pageBasePos) + 30, 30); // create pagination cookie

            var perPageCount = perPageSelect.find(':selected');
            if ($(this).hasClass('next')) {
                // if the next "block" of range values does not overflow company count
                if ((self.pageBasePos + Number(perPageCount.val())) < $('tr.biz').length) {
                    self.pageBasePos += Number(perPageCount.val());
                    if ((self.pageBasePos + Number(perPageCount.val())) > $('tr.biz').length) {
                        self.pageLimit = true;
                    }
                }
            } else if ($(this).hasClass('prev') && self.pageBasePos != 0) {
                self.pageLimit = false;
                self.pageBasePos -= Number(perPageCount.val());
            }
            self.Paginate.init(perPageCount, self.pageBasePos, self.pageLimit);
        })
    }
    ListActions.prototype.Paginate.init = function(perPage, pageBasePos, pageLimit) {
        /**
         *
         *
         */
        var companies = $('tr.biz');
        var companiesLength = companies.length;
        var range = this.range(perPage, pageBasePos);
        var pageCount = $('div#list-options div#pagination p.count');
        companies.hide(); // hide all companies
        $('div.slider').hide();
        // set range display. Value is visual only and has no effect on implmentation.
        // values displayed are for ui reference
        pageCount
            .find('span.range').html((Number(range[0])) + ((companiesLength > 0) ? 1 : 0) + ' - ' +
                                     ((pageLimit || range.length > companiesLength)
                                           ? companiesLength
                                           : Number(range[range.length -1 ]) + 1)).end()
            .find('span.total').html(companiesLength);
        $.each(range, function() {
            // show companies matching indeces in range[]
            $(companies[this]).show();
        });
    }
    ListActions.prototype.Paginate.range = function(perPage, pageBasePos) {
        /**
         * Create an array of all values between page base position and perPage range offset
         *
         * Ex.
         * pageBasePos = 0;
         * perPage.val() (option value) is 30
         * range[] would have values [0, 1, 2, 3, 4, 5, ..., 29]
         *
         */
        var range = []
        for (var i = pageBasePos; i < (pageBasePos + Number(perPage.val())); i++)
            range.push(i);
        return range;
    }
    ListActions.prototype.Sort = function() {
        /**
         *
         *
         */
        var self = this;
        var fields = $('div#fields li');
        fields.on('click', function() {
            fields.unbind('click');
            self.Sort.bind(self, $(this));
        })
    }
    ListActions.prototype.Sort.bind = function(context, field) {
        /**
         *
         *
         */
        var db_map = '_' + field.attr('data-map');
        var direction;
        var params = context.getActiveFilter();
        params['user'] = $('select#team-select').find(':selected').attr('id');
        params['origin'] = $('select#origin-select').find(':selected').attr('data-type');

        if (field.hasClass('desc') || !field.hasClass('asc')) 
            direction = context.Sort.setFields(field, 'asc', '&#9660');
        else if (field.hasClass('asc')) 
            direction = context.Sort.setFields(field, 'desc', '&#9650');
        
        context.Sort[db_map](context, direction, function(set) {
            set.fetch({
                data: $.param(params),
                reset: true,
                success: function(data) {
                    context.Sort();
                }
            })
        });
    }
    ListActions.prototype.Sort.setFields = function(field, direction, html) {
        /**
         *
         *
         */
        field
            .siblings()
                .removeClass('asc desc')
                .find('span.field-filter').html('&#9660').end().end()
            .removeClass('asc desc').addClass(direction)
            .find('span.field-filter').html(html);
        return direction
    }
    ListActions.prototype.Sort.byString = function(letters, direction) {
        /**
         *
         *
         */
        return _.map(letters, function(letter) {
            return (direction == 'asc') 
                ? String.fromCharCode(letter.charCodeAt())
                : String.fromCharCode(-letter.charCodeAt());
        });
    }
    ListActions.prototype.Sort.byNumber = function(direction, value) {
        /**
         *
         *
         */
         return (direction == 'asc') ? value : -value
    }
    ListActions.prototype.Sort._name = function(context, direction, callback) {
        /**
         *
         *
         */
        companies = context.collections.companies;
        companies.comparator = function(collection) {
            return context.Sort.byString(
                collection.get('name').toLowerCase().split(''), direction);
        }
        callback(companies);
    }
    ListActions.prototype.Sort._best_time_to_call = function(context, direction, callback) {
        companies = context.collections.companies;
        companies.comparator = function(collection) {
            return context.Sort.byNumber(
                direction, collection.get('call_access_level'));
        }
        callback(companies);
    }
    ListActions.prototype.Sort._first_name = function(context, direction, callback) {
        /**
         *
         *
         */
        companies = context.collections.companies;
        companies.comparator = function(collection) {
            return context.Sort.byString(
                collection.get('first_name').toLowerCase().split(''), direction);
        }
        callback(companies);
    }
    ListActions.prototype.Sort._zipcode = function(context, direction, callback) {
        /**
         *
         *
         */
         companies = context.collections.companies;
         companies.comparator = function(collection) {
            return context.Sort.byNumber(direction, companies.get('zipcode'));
         }
         callback(companies);
    }
    ListActions.prototype.Sort._last_update = function(context, direction, callback) {
        companies = context.collections.companies;
        companies.comparator = function(collection) {
            return context.Sort.byNumber(direction, companies.get('last_update'));
        }
        callback(companies);
    }
    ListActions.prototype.highlightLink = function() {
        /**
         *
         *
         */
        var listLinks = $('article#actions ul.lists a');
        $.each(listLinks, function() {
            $this = $(this);
            if ($this.attr('href') == window.location.pathname)
                $this.css('color', '#006eb5');
        })
    }
    ListActions.prototype.Accordian = function() {
        /**
         *
         *
         */
        var self = this;
        var companies = $('tr.biz');
        companies.on('click', function(e) {  
            var id = $(this).attr('id');

            // set cookie
            self.Accordian.setActiveCompany(self, id);

            // remove highlighting from deselected companies and add to current company
            companies.removeClass('highlight');
            $(this).addClass('highlight');     

            var company = $(this).next('tr.biz-info');  // toggle business detail on click
            company.siblings('tr.biz-info')
                .removeClass('expanded')
                .find('div.slider').hide(0); // collapse all
            if (company.hasClass('expanded')) {
                company
                    .removeClass('expanded')
                    .find('div.slider').hide(0).end() // if is already expanded
                    .prev('tr.biz').removeClass('highlight') // remove selected highlight from business
            } else {
                 // if not yet expanded 
                company.addClass('expanded').find('div.slider').show(0, function() {
                    $('html, body').animate({scrollTop:$('tr#' + id).position().top - 3}, 0);
                });   
            }
        });

        // expand company from cookie
        this.Accordian.autoExpand(this);

        // prevent accordian effect on href click
        var companyLink = $('td.company a.details');
        companyLink.on('click', function(e) {
            e.stopPropagation();
        })
    }
    ListActions.prototype.Accordian.autoExpand = function(context) {
        var listType = context.getListType();
        var id = Helpers.readCookie('activecompany[' + listType + ']')
        $('tr.biz#' + id).click();
    }
    ListActions.prototype.Accordian.setActiveCompany = function(context, id) {
        var listType = context.getListType();
        Helpers.createCookie('activecompany[' + listType + ']', id, 30);
    }
    ListActions.prototype.Move = function() {
        /**
         *
         *
         */
        var self = this;
        var selectBuffer = $('table#active-list div.select-biz');
        var selectors = selectBuffer.find('input[type=checkbox]');
        var moveBtns = $('div#list-options button.move');

        // Buffer div for UI sugar. Prevents accidental expansion and "call company" click.
        // clicking in buffer area indicates an intended checkbox click.  Calls click() method
        // of associated checkbox for smarter UI use.
        selectBuffer.on('click', function(e) {
            e.stopPropagation();
            $(this).find('input[type=checkbox]').click()
        })

        selectors.on('click', function(e) {
            e.stopPropagation();
            if (this.checked)
                $(this).closest('tr.biz').addClass('selected')
            else
                $(this).closest('tr.biz').removeClass('selected')
            self.Move.toggleActionButtons(selectors, moveBtns)
        })

        // unbind before call. View rerender causes duplicate event handlers.
        moveBtns.unbind().on('click', function(e) {
            var $this = $(this)
            if (!$this.hasClass('disabled')) {
                var selected = $('tr.biz.selected')
                var companies = self.Move.matchSelected(selected, self.collections.companies);
                if ($this.attr('data-action') == 'remove') 
                    self.Move.remove(selected, companies, self);
                else if ($this.attr('data-action') == 'archive')
                    self.Move.archive(selected, companies, self);
            }
        })
    }
    ListActions.prototype.Move.clean = function(selected, context) {
        /**
         *
         *
         *
         */
        $('div#list-options button.move').addClass('disabled'); // disable action buttons
        // purge moved from table
        $.when(
            selected
                .siblings('tr.biz-info.expanded')
                    .remove()
                    .end()
                .remove()
        ).then(function() {
            if ($('tr.biz').length == 0) 
                window.location.reload();
        })
    }
    ListActions.prototype.Move.remove = function(selected, companies, context) {
        /**
         *
         *
         *
         */
        var alert = new Alerts();
        alert.confirm('Delete ' + selected.length + ' selected record(s)?', function() {
            $.each(companies, function() {
                this.destroy({success: function(data) {
                    context.Move.clean(selected);
                }})
            })
        });
    }
    ListActions.prototype.Move.archive = function(selected, companies, context) {
        /**
         *
         *
         *
         */
        var alert = new Alerts();
        alert.confirm('Acrhive ' + selected.length + ' selected record(s)?', function() {
            $.each(companies, function() {
                var targetFields = ['status'];
                this.set({'status': 'archive', '__@target': targetFields})
                this.save(null, { 
                    success: function(data) {
                        context.Move.clean(selected, context);
                    }
                });
            })
        })
    }
    ListActions.prototype.Move.toggleActionButtons = function(selectors, buttons) {
        /**
         *
         *
         */
        var checked = false;
        $.each(selectors, function() {
            if (this.checked) checked = true;
        })
        if (checked == true) 
            buttons.removeClass('disabled');
        else
            buttons.addClass('disabled');
    }
    ListActions.prototype.Move.matchSelected = function(selected, companies) {
        /**
         *
         *
         */
        var matches = [];
        $.each(selected, function() {
            matches.push(companies.get(($(this).attr('id'))));
        })
        return matches;
    }
    ListActions.prototype.callPhone = function() {
        /**
         *
         *
         */
        var call = $('table.list td.expand a.call-biz');
        call.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $.ajax('/phone/call/', {
                type: 'POST',
                data: { 'phone_no': $(this).attr('data-phone-no') },
                success: function() {
                }
            })
        })
    };
    ListActions.prototype.hangupPhone = function() {
        /**
         *
         *
         */
        var call = $('table.list td.expand a.call-hangup');
        call.on('click', function(e) {
            e.stopPropagation();
            $.ajax('/phone/hangup/', {
                type: 'GET',
                success: function() {
                }
            })
        })
    }
    ListActions.prototype.event = function(trigger, template) {
        /**
         *
         *
         */
        var self = this;
        var popUpDiv = $('div#pop-up');
        $(trigger).on('click', function(e) {
            var event = $('<div></div>', { class: 'event' });
                company  = self.collections.companies.get($(this).attr('data-biz'));
                address2 = (company.get('address2')) ? company.get('address2') + " " : ""
                where    = company.get('address') + " "  + address2 +
                           company.get('city')    + ", " +
                           company.get('state')   + " "  + 
                           company.get('zipcode');
                heading  = company.get('name');
            if (trigger == 'button#appt' || trigger == 'button#drop') {
                var contact = false;
                    contact_first = company.get('contact_first_name'),
                    contact_last = company.get('contact_last_name'),
                    owner_first = company.get('first_name'),
                    owner_last = company.get('last_name');

                if (contact_first || contact_last)
                    var contact = ((contact_first + " " || "")) + contact_last + " "; 
                else
                    var owner = (owner_first || owner_last)
                        ? ((owner_first + " " || "")) + owner_last + " "
                        : ""

                heading += " - " + ((contact != false) ? contact : owner)
                           + company.get('phone');
            }
            event.html(_.template($(template).html(), {
                escape   : false,
                heading  : heading,
                where    : where,
                company  : company,
                colors   : self.collections.calendars.eventColors.models,
                calendars: self.collections.calendars.models
            }));

            popUpDiv
                .prepend(event)
                .show() 
                .find('span.close').on('click', function() {
                    var speed = 300;
                    $('div.event').fadeOut(speed);
                    $('div#overlay').delay(speed).fadeOut(speed, function() {
                        $('div#pop-up').hide();
                        $('div#overlay').show();
                        event.remove();
                    });
                })
            event.css('display', 'inline-block').hide().fadeIn(200);

            var form = new Forms.EventForm()
            form.initialize(event, event.find('form'), {
                decorate: 'highlight',
                vTrigger: 'submit',
                submit: 'input#add-event',
                model: EventModel,
                company: $('table.list').find('tr#' + $(this).attr('data-biz'))
            });
        });
    }
    ListActions.prototype.Search = function() {
        /**
         *
         *
         */
        var self = this;
        var searchInput = $('input[type=text]#search');
        var letterFilters = $('ul#letter-filter p');
        letterFilters.on('click', function() {
            self.activeFilter = $(this).html();
            searchInput.val(''); // clear search input to prevent "wonky" filtering
            self.Search.run($(this).html(), true, self.collections.companies);
        })
        searchInput.on('keyup', function(e) {
            self.activeFilter = $(this).val();
            self.Search.run($(this).val(), false, self.collections.companies);
        });
    }
    ListActions.prototype.Search.run = function(query, delay, companies) {
        /**
         *
         *
         */
        var filters      = $('select#list-filters'),
            query        = query.toLowerCase(),
            teamSelect   = $('div#list-options select#team-select'),
            originSelect = $('div#list-options select#origin-select'),
            parms        = {},
            nullTimeout;

        // set team filter for companies search query based on team select option
        parms['user'] = teamSelect.find(':selected').attr('id');
        if (window.location.pathname != '/follow-up/')
            parms['origin'] = originSelect.find(':selected').attr('data-type');

        if (filters.find(':selected').attr('data-field') == 'contact') {
            var contactName = query.split(' ')
            parms['first_name'] = contactName[0]
            parms['last_name'] = contactName[1]
        } else {
            parms[filters.find(':selected').attr('data-field')] = query 
        }

        companies.fetch({
            method: 'GET',
            reset: true,
            data: $.param(parms),
            success: function(data) {
                if (delay && data.length == 0) {
                    clearTimeout(nullTimeout);
                    nullTimeout = (setTimeout(function() {
                        companies.fetch({
                            data: $.param({ 
                                'user': teamSelect.find(':selected').attr('id'),
                                'origin': originSelect.find(':selected').attr('data-type')
                            }),
                            reset: true,
                        });
                    }, 1000));
                } else {
                    clearTimeout(nullTimeout);
                }
            }
        });
    }
    ListActions.prototype.ModRegister = function(modifiers) {
        /**
         *
         *
         */
        this.Modifiers(modifiers)
    }
    ListActions.prototype.Modifiers = function(modifiers) {
        /**
         *
         *
         */
        Helpers.createCookie('page', 0, 30); // create pagination cookie
        var self = this;
        var mods = [];
        $.each(modifiers, function() {
            var modifier = self['Modifiers'][this]()
            mods.push({
                'target': $(modifier['target']),
                'param': modifier['param'],
                'attr': modifier['attr']
            });
        });
        $.each(mods, function() {
            this['target'].change(function() {
                var params = {}
                $.each(mods, function() {
                    if (this['param'] == 'origin' && window.location.pathname == '/follow-up/')
                        return;
                    params[this['param']] = this['target'].find(':selected').attr(this['attr'])
                })
                // get parameters       
                self.collections.companies.fetch({
                    reset: true,
                    data: $.param(params)
                });
            });
        })
        
    }
    ListActions.prototype.Modifiers.teamModifier = function(context) {
        /**
         *
         *
         *
         */
        return { 
            target: 'select#team-select', 
            attr: 'id', 
            param: 'user'
        }
    }
    ListActions.prototype.Modifiers.originModifier = function(context) {
        /**
         *
         *
         *
         */
        return { 
            target: 'select#origin-select', 
            attr: 'data-type', 
            param: 'origin' 
        }
    }

    return ListActions;
});