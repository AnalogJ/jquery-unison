jquery-unison
=============

JQuery Plugin that aggregates multiple Google Calendars in javascript using the GData library


##inputs:#
*calendars* - array of calendar objects: {key:"calendarKey", id:"Google Calendar ID"}

##functions:#

**getEventsOnDate** - Retrieves all the events on the specific date, and passes that data to the 
callback in an EventsContainer 
    
    @param /*{Object}*/ options
    {
      date: /*Date*/,
      timezone: /*Int - timezone offset, 0 = utc (utc offset eg. -7, +3)*/
      
      keys: /*Array of Strings - Optional list of calendars to retrieve events from*/
    }
    @param *{Function}* callback(**EventsContainer**)

**getEventsInMonth** 
    
    @param /*{Object}*/ options
    {
      date: /*Date*/,
      timezone: /*Int - timezone offset, 0 = utc (utc offset eg. -7, +3)*/ 
      
      keys: /*Array of Strings - Optional list of calendars to retrieve events from*/
    }
    @param *{Function}* callback(**EventsContainer**)
    
**getEventsInRange**
 
    @param /*{Object}*/ options
    {
      startDate: /*Date*/,
      endDate: /*Date*/,
      timezone: /*Int - timezone offset, 0 = utc (utc offset eg. -7, +3)*/ 
      
      keys: /*Array of Strings - Optional list of calendars to retrieve events from*/
    }
    @param *{Function}* callback(**EventsContainer**)

###containers:###
**EventsContainer**: 

    {
      key: /*String - calendarKey,*/,
      events:/*Array of Event Objects*/
      
      flatten:/*Function - returns a sorted array of events contained within the container. (ordered by start date, title)*/
    }

**Event**: [https://developers.google.com/google-apps/calendar/v3/reference/events#resource](https://developers.google.com/google-apps/calendar/v3/reference/events#resource)



##features:#
 - given date range, load events across multiple calendars
 - allow for a custom function to execute on each event (parserFunction)
 - caches events, 

##limitations:#
