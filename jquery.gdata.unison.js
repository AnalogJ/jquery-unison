(function ($, gapi) {
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Storage Classes
    // 
    var ErrorContainer = function(errMsg){
        this.Message = errMsg;
    };
    
    var EventsContainer = function(){};
    EventsContainer.prototype.flatten = function(){};

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Plugin Logic + Methods
    //
    var methods = {
        init: function (options) {

            var defaults = {
                calendars: [],
                eventParser: null
            };

            options = $.extend(defaults, options);

            return this.each(function () {

                var $this = $(this),
                    data = $this.data('unison');

                // If the plugin hasn't been initialized yet
                if (!data) {

                    $(this).data('unison', {
                        target: $this,
                        eventStorage: {},
                        options: options,
                    });
                }
            });
        },
        destroy: function () {

            return this.each(function () {

                var $this = $(this),
                    data = $this.data('unison');

                // Namespacing FTW
                $this.removeData('unison');

            })

        },
        
        
        /**
         *  @param {Object} options
            {
                date: {Date},
                timezone: {Int} - timezone offset, 0 = utc (utc offset eg. -7, +3)
      
                keys: {Array of Strings} - Optional list of calendars to retrieve events from
            }
            @param *Function} callback(EventsContainer, ErrorContainer)
        **/
        eventsOnDate: function (options, callback) {
            return this.each(function () {

                var $this = $(this),
                    data = $this.data('unison');
                console.log('eventsOnDate', $this,data);
                // If the plugin hasn't been initialized yet
                if(typeof(callback) =="undefined"){
                    return;
                }
                else if (!data) {
                    callback(new EventsContainer(), new ErrorContainer("plugin has not been initialized yet."))
                    return;
                }
                else{
                    console.log('eventsOnDate', options);
                    options = $.extend({timezone:0}, options);
                    //validate options:
                    if(!util.isValidDate(options.date)){
                        callback(new EventsContainer(), new ErrorContainer("invalid date."))
                        return;
                    }
                                        
                    //build GetEventsInRange Options
                    console.log('eventsOnDate starting.')
                    var ajaxOptions = {};
                    var ajaxModel = new AjaxModel($this, data, ajaxOptions, callback)
                    ajaxModel.getEvents();
                    
                    
                }
            });
        },
        eventsInMonth: function (options, callback) {},
        eventsInRange: function (options, callback) {
            //options = $.extend({timezone:0, calendars: data.options.calendars}, options);
            gapi.client.calendar.events.list({ 
                        'calendarId': 'ualberta.ca_2v3p6rpf54suburs18h3444l6c@group.calendar.google.com'
                    }).execute(function(){console.log(arguments)})
            
        },
        _debug : function(){}
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Unison Events Storage Model
    //
    
    var AjaxModel = function($ele, data, ajaxOptions, callback){
        
        var keys = [];
        for(var ndx in data.options.calendars){
            keys.push(data.options.calendars[ndx].id);
        }
        
        this.ajaxOptions = $.extend({},{keys:keys},ajaxOptions);
        this.callback = callback;
        this.$ele = $ele;
        this.data = data;
        console.log(this)
        //counter closure to store the count state;
        this.counter = (function(){
            var count = 0;
            
            function incr(){
                count ++;                
            }
            function decr(){
                count--;
            }
            return {
                incr: incr,
                decr: decr,
                getCount: function(){return count;}
                
            }
            
        })()
    }
    AjaxModel.prototype.getEvents = function(){
            
            for(var ndx in this.ajaxOptions.keys){
                var calId = this.ajaxOptions.keys[ndx];
                
                console.log(gapi.client);
                
                gapi.client.calendar.events.list({ 
                        'calendarId': calId,
                    }).execute(function(){console.log(arguments)})
            }
            
        }
    





    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Unison Utilities
    //
    var util = {
        isValidDate: function(d) {
            if ( Object.prototype.toString.call(d) !== "[object Date]" )
                return false;
            return !isNaN(d.getTime());
        }
        
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // JQuery Plugin Core
    //
    $.fn.unison = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.unison');
        }

    };

})(jQuery, gapi);