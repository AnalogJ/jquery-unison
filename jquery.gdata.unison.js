(function ($) {
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Storage Classes
    // 
    var ErrorContainer = function(errMsg){
        this.Message = errMsg;
    };
    
    var EventsContainer = function(){};
    EventsContainer.prototype.flatten = function(){
        var flatEventList = [];
        for(var prop in this){
            flatEventList.push.apply(flatEventList, this[prop]);
        }
        return flatEventList;
        
    };

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
                // If the plugin hasn't been initialized yet
                if(typeof(callback) =="undefined"){
                    return;
                }
                else if (!data) {
                    callback(null, new ErrorContainer("plugin has not been initialized yet."))
                    return;
                }
                else if(!util.isValidDate(options.date)){
                    callback(null, new ErrorContainer("invalid date."))
                    return;
                }
                else{
                    
                    options = $.extend({timezone:0}, options);
                    //validate options:
                                  
                    //build GetEventsInRange Options
                    
                    var startDate = new Date(
                        Date.UTC(options.date.getFullYear(),
                        options.date.getMonth(),
                        options.date.getDate(),
                        0 + options.timezone
                    ));
                    var endDate = new Date(
                        Date.UTC(options.date.getFullYear(),
                        options.date.getMonth(),
                        options.date.getDate(),
                        23 + options.timezone,
                        59,
                        59
                    ));
                    
                    var ajaxOptions = {startDate: startDate, endDate: endDate };
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
    var successCallback = function(calId, ajaxModel){
                var _ajaxModel = ajaxModel;
                var _ajaxOptions = _ajaxModel.ajaxOptions;
                var _data = _ajaxModel.data;
                var _calId = calId.toLowerCase();
                return function(calendar){
                    
                    var year = _ajaxOptions.startDate.getUTCFullYear();
                    var month = _ajaxOptions.startDate.getUTCMonth();
                    _ajaxModel.counter.decr();
                    _data.eventStorage[_calId] = {};
                    _data.eventStorage[_calId][year] = {};
                    _data.eventStorage[_calId][year][month] = calendar.items;
                    console.log(_data.eventStorage);
                    
                    if(!_ajaxModel.counter.getCount()){
                        _ajaxModel.complete();
                    }
                }
            }
    var AjaxModel = function($ele, data, ajaxOptions, callback){
        
        var keys = [];
        for(var ndx in data.options.calendars){
            keys.push(data.options.calendars[ndx].id);
        }
        
        this.ajaxOptions = $.extend({},{keys:keys},ajaxOptions);
        this.callback = callback;
        this.$ele = $ele;
        this.data = data;
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
            
            var year = this.ajaxOptions.startDate.getUTCFullYear();
            var month = this.ajaxOptions.startDate.getUTCMonth();
            
            for(var ndx in this.ajaxOptions.keys){
                var calId = this.ajaxOptions.keys[ndx].toLowerCase();
                
                console.log(gapi.client);
                if(
                    typeof(this.data.eventStorage[calId]) == "undefined"
                    || typeof(this.data.eventStorage[calId][year]) == "undefined"
                    || typeof(this.data.eventStorage[calId][year][month]) == "undefined"
                ){
                    this.counter.incr();
                    gapi.client.calendar.events.list({ 
                        'calendarId': calId,
                        "timeMin" : this.ajaxOptions.startDate.toISOString(),
                        "timeMax" : this.ajaxOptions.endDate.toISOString()
                    }).execute(successCallback(calId, this))
                    
                }
                
            }
    }
    
    AjaxModel.prototype.complete = function(){
        //no calendars left to parse. 
        //create the eventContainer and return to callback.
        var eventContainer = new EventsContainer();
        for(var ndx in this.ajaxOptions.keys){
            var key = this.ajaxOptions.keys[ndx].toLowerCase();
            eventContainer[key] = this.data.eventStorage[key][this.ajaxOptions.startDate.getUTCFullYear()][this.ajaxOptions.startDate.getUTCMonth()];
            
        }
        
        this.callback(eventContainer, null)
        return;
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

})(jQuery);