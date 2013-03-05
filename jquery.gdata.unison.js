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

            });

        },
        
        
        /**
         *  @param {Object} options
            {
                date: {Date} - UTC valid date with correct timezone.
                keys: {Array of Strings} - Optional list of calendars to retrieve events from
            }
            @param *Function} callback(EventsContainer, ErrorContainer)
        **/
        eventsOnDate: function (options, callback) {
            /*get dates from month if missing.*/
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('unison');
                // If the plugin hasn't been initialized yet
                if(typeof(callback) =="undefined"){
                    return;
                }
                else if (!data) {
                    callback(null, new ErrorContainer("plugin has not been initialized yet."));
                    return;
                }
                else if(!util.isValidDate(options.date)){
                    callback(null, new ErrorContainer("invalid date."));
                    return;
                }
                else{
                    
                    options = $.extend({}, options);
                    //validate options:
                                  
                    //build GetEventsInRange Options
                    
                    var startDate = new Date(
                        Date.UTC(options.date.getUTCFullYear(),
                        options.date.getUTCMonth(),
                        options.date.getUTCDate(),
                        0,0,0
                    ));
                    var endDate = new Date(
                        Date.UTC(options.date.getUTCFullYear(),
                        options.date.getUTCMonth(),
                        options.date.getUTCDate(),
                        23,
                        59,
                        59,999
                    ));
                    
                    var ajaxOptions = {startDate: startDate, endDate: endDate };
                    if(options.eventParser){
                        ajaxOptions.eventParser = options.eventParser;
                    }
                    
                    var ajaxModel = new AjaxModel($this, data, ajaxOptions, callback);
                    ajaxModel.getEvents();
                    
                    
                }
            });
            
        },
        eventsInMonth: function (options, callback) {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('unison');
                // If the plugin hasn't been initialized yet
                if(typeof(callback) =="undefined"){
                    return;
                }
                else if (!data) {
                    callback(null, new ErrorContainer("plugin has not been initialized yet."));
                    return;
                }
                else if(!util.isValidDate(options.date)){
                    callback(null, new ErrorContainer("invalid date."));
                    return;
                }
                else{
                    
                    options = $.extend({}, options);
                    //validate options:
                                  
                    //build GetEventsInRange Options
                    
                    var startDate = new Date(
                        Date.UTC(options.date.getUTCFullYear(),
                        options.date.getUTCMonth(),
                        1,
                        0,0,0
                    ));
                    var endDate = new Date(
                        Date.UTC(options.date.getUTCFullYear(),
                        options.date.getUTCMonth(),
                        (new Date(Date.UTC(options.date.getUTCFullYear(), options.date.getUTCMonth() + 1, 0))).getUTCDate(),
                        23,
                        59,
                        59,999
                    ));
                    
                    var ajaxOptions = {startDate: startDate, endDate: endDate };
                    if(options.eventParser){
                        ajaxOptions.eventParser = options.eventParser;
                    }
                    
                    var ajaxModel = new AjaxModel($this, data, ajaxOptions, callback);
                    ajaxModel.getEvents();
                    
                    
                }
            });
            
        },
        eventsInRange: function (options, callback) {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('unison');
                // If the plugin hasn't been initialized yet
                if(typeof(callback) =="undefined"){
                    return;
                }
                else if (!data) {
                    callback(null, new ErrorContainer("plugin has not been initialized yet."));
                    return;
                }
                else if(!util.isValidDate(options.startDate) || !util.isValidDate(options.endDate)){
                    callback(null, new ErrorContainer("invalid start or end date."));
                    return;
                }
                else{
                    
                    var ajaxOptions = $.extend({customRange: true}, options);
                    //validate options:
                                                    
                    var ajaxModel = new AjaxModel($this, data, ajaxOptions, callback);
                    ajaxModel.getEvents();
                    
                    
                }
            });
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
                    
                    //store calendarId information within each event.
                    var genericEventParser = function(event){
                        event._calID = _calId;
                        event._ajaxOptions = _ajaxOptions;
                        
                    };
                    
                    
                    if(!_ajaxOptions.customRange){
                        _data.eventStorage[_calId] = {};
                        _data.eventStorage[_calId][year] = {};
                        _data.eventStorage[_calId][year][month] = (typeof(calendar.items) =="undefined" || calendar.items == null) ? [] : calendar.items;
                    
                    
                        _data.eventStorage[_calId][year][month].map(genericEventParser);
                    
                        if(_ajaxOptions.eventParser){
                            _data.eventStorage[_calId][year][month].map(_ajaxOptions.eventParser);
                        }
                    }
                    else{
                        _ajaxModel.customData[_calId] = (typeof(calendar.items) =="undefined" || calendar.items == null) ? [] : calendar.items;
                        _ajaxModel.customData[_calId].map(genericEventParser);
                        
                        if(_ajaxOptions.eventParser){
                            _ajaxModel.customData[_calId].map(_ajaxOptions.eventParser);
                        }
                    }
                    
                    
                    
                    if(!_ajaxModel.counter.getCount()){
                        _ajaxModel.complete();
                    }
                };
            };
    var AjaxModel = function($ele, data, ajaxOptions, callback){
        
        var keys = [];
        for(var ndx in data.options.calendars){
            keys.push(data.options.calendars[ndx].id);
        }
        
        this.ajaxOptions = $.extend({},{keys:keys},ajaxOptions);
        this.callback = callback;
        this.$ele = $ele;
        this.data = data;
        this.customData = {}; //storage for custom ranges, not persistent. 
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
                
            };
            
        })();
    };
     
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
                    }).execute(successCallback(calId, this));
                    
                }
                
            }
    };
    
    AjaxModel.prototype.complete = function(){
        //no calendars left to parse. 
        //create the eventContainer and return to callback.
        var eventContainer = new EventsContainer();
        
        if(!this.ajaxOptions.customRange){
            var year = this.ajaxOptions.startDate.getUTCFullYear();
            var month = this.ajaxOptions.startDate.getUTCMonth();
            for(var ndx in this.ajaxOptions.keys){
                var key = this.ajaxOptions.keys[ndx].toLowerCase();
                eventContainer[key] = this.data.eventStorage[key][year][month];
            }
        }
        else{
            for(var ndx in this.ajaxOptions.keys){
                var key = this.ajaxOptions.keys[ndx].toLowerCase();
                eventContainer[key] = this.customData[key];
            }
        }
        
        
        
        this.callback(eventContainer, null);
        return;
    };




    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Unison Utilities
    //
    var util = {
        isValidDate: function(d) {
            if ( Object.prototype.toString.call(d) !== "[object Date]" )
                return false;
            return !isNaN(d.getTime());
        }
        
    };

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