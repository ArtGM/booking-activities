// Retrieve the events to show and fill the the booking system
function bookacti_fetch_events( booking_system ) {
	
	var booking_system_id	= booking_system.attr( 'id' );
	var attributes			= bookacti.booking_system[ booking_system_id ];
	
	bookacti_start_loading_booking_system( booking_system );
	
    $j.ajax({
        url: bookacti_localized.ajaxurl,
        type: 'POST',
        data: { 
			'action': 'bookactiFetchEvents', 
			'attributes': JSON.stringify( attributes ),
			'is_admin': bookacti_localized.is_admin, 
			'nonce': bookacti_localized.nonce_fetch_events 
		},
        dataType: 'json',
        success: function( response ){
			
			if( response.status === 'success' ) {
				
				// Update calendar content data
				bookacti.booking_system[ booking_system_id ][ 'events' ]				= response.events;
				bookacti.booking_system[ booking_system_id ][ 'events_data' ]			= response.events_data;
				bookacti.booking_system[ booking_system_id ][ 'exceptions' ]			= response.exceptions;
				bookacti.booking_system[ booking_system_id ][ 'bookings' ]				= response.bookings;
				bookacti.booking_system[ booking_system_id ][ 'activities_data' ]		= response.activities_data;
				bookacti.booking_system[ booking_system_id ][ 'groups_events' ]			= response.groups_events;
				bookacti.booking_system[ booking_system_id ][ 'groups_data' ]			= response.groups_data;
				bookacti.booking_system[ booking_system_id ][ 'group_categories_data' ]	= response.group_categories_data;
				
				if( response.events.length ) {
					// Fill events according to booking method
					bookacti_booking_method_fill_with_events( booking_system, attributes.method );
				} else {
					// If no events are bookable, display an error
					bookacti_add_error_message( booking_system, bookacti_localized.error_no_events_bookable );
				}
				
			} else {
				var error_message = bookacti_localized.error_display_event;
				if( response.error === 'not_allowed' ) {
					error_message += '\n' + bookacti_localized.error_not_allowed;
				}
				console.log( error_message );
				console.log( response );
			}
        },
        error: function( e ){
            console.log( 'AJAX ' + bookacti_localized.error_display_event );
            console.log( e );
        },
        complete: function() { 
			bookacti_stop_loading_booking_system( booking_system );
		}
    });
}


// Reload a booking system
function bookacti_reload_booking_system( booking_system ) {
	
	var booking_system_id	= booking_system.attr( 'id' );
	var attributes			= bookacti.booking_system[ booking_system_id ];
	
	bookacti_start_loading_booking_system( booking_system );
	
	$j.ajax({
        url: bookacti_localized.ajaxurl,
        type: 'POST',
        data: {	
			'action': 'bookactiReloadBookingSystem', 
			'attributes': JSON.stringify( attributes ),
			'is_admin': bookacti_localized.is_admin,
			'nonce': bookacti_localized.nonce_reload_booking_system
		},
        dataType: 'json',
        success: function( response ){
			
			if( response.status === 'success' ) {
				
				// Clear booking system
				booking_system.empty();
				bookacti_clear_booking_system_displayed_info( booking_system );
				
				// Update events and settings
				bookacti.booking_system[ booking_system_id ][ 'events' ]				= response.events;
				bookacti.booking_system[ booking_system_id ][ 'events_data' ]			= response.events_data;
				bookacti.booking_system[ booking_system_id ][ 'exceptions' ]			= response.exceptions;
				bookacti.booking_system[ booking_system_id ][ 'bookings' ]				= response.bookings;
				bookacti.booking_system[ booking_system_id ][ 'activities_data' ]		= response.activities_data;
				bookacti.booking_system[ booking_system_id ][ 'groups_events' ]			= response.groups_events;
				bookacti.booking_system[ booking_system_id ][ 'groups_data' ]			= response.groups_data;
				bookacti.booking_system[ booking_system_id ][ 'group_categories_data' ]	= response.group_categories_data;
				bookacti.booking_system[ booking_system_id ][ 'template_data' ]				= response.template_data;
				
				// Fill the booking method elements
				booking_system.append( response.html_elements );
				
				// Load the booking method
				bookacti_booking_method_set_up( booking_system );
				
				
			} else {
				var error_message = bookacti_localized.error_reload_booking_system;
				if( response.error === 'not_allowed' ) {
					error_message += '\n' + bookacti_localized.error_not_allowed;
				}
				console.log( error_message );
				console.log( response );
			}
        },
        error: function( e ){
            console.log( 'AJAX ' + bookacti_localized.error_reload_booking_system );
            console.log( e );
        },
        complete: function() { 
			bookacti_stop_loading_booking_system( booking_system );
		}
    });	
}


// Display events sources of both single and repeated events
function bookacti_display_events( booking_system, single_events, repeated_events ) {
	bookacti_display_single_events( booking_system, single_events );
	bookacti_display_repeated_events( booking_system, repeated_events );
}


// Display events sources of both single and repeated events
function bookacti_display_events_in_interval( booking_system, interval, single_events, repeated_events ) {
	
	interval = interval || false;
	
	bookacti_display_single_events( booking_system, single_events, interval );
	bookacti_display_repeated_events( booking_system, repeated_events, interval );
}


// Get single events sources by activities
function bookacti_display_single_events( booking_system, single_events, interval ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	single_events	= single_events || false;
	interval		= interval || false;
	
	// If booking system settings are not set or if there is no repeated event, return an empty array
	if( ! bookacti.booking_system[ booking_system_id ] || ! single_events ) { return []; }
	
	// The maximum browser loading time to keep it reponsive
	var maxTimePerChunk = 100;
	
	// Return current time
    function now() { return new Date().getTime(); }
	
	var calendar_start	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'start' ] );
	var calendar_end	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'end' ] ).add( 1, 'days' );
	var current_time	= moment( bookacti_localized.current_time );
	
	var event_ids		= Object.keys( single_events );
	var events_length	= event_ids.length;
	
	// Start loading
	if( booking_system_id === 'bookacti-template-calendar' ) {
		bookacti_start_template_loading();
	} else {
		bookacti_start_loading_booking_system( booking_system );
	}
	
	// Process each event one after another and let browser refresh between each to prevent a total freeze
	var index = 0;
	function do_events() {
	
		var startTime = now();
		
		while( index < events_length && (now() - startTime) <= maxTimePerChunk ) {

			// Init variables
			var event_id			= event_ids[ index ];
			var single_event		= single_events[ event_id ];
			var event_start_date	= single_event.start.substr( 0, 10 );
			
			// Check if the event is in the interval to be rendered
			if( interval ) {
				if( interval.start.isAfter( event_start_date ) || interval.end.isBefore( event_start_date ) ) { ++index; continue; }
			}
			
			// Make sure the event isn't past if not explicitly allowed
			if( ! bookacti.booking_system[ booking_system_id ][ 'past_events' ] ) {
				if( current_time.isAfter( single_event.start ) ) { 
					// If started event are allowed
					if( ! bookacti_localized.started_events_bookable || current_time.isAfter( single_event.end ) ) {
						++index; continue;
					}
				}
			}

			// Make sure events are not out of templates, else skip to next event
			if( calendar_start.isAfter( event_start_date ) || calendar_end.isBefore( event_start_date ) ) { ++index; continue; }

			// Create a source for each event
			var event_source = { 
				'id'				: 'event_' + single_event.id,
				'allDayDefault'		: false,
				'color'				: bookacti.booking_system[ booking_system_id ][ 'events_data' ][ single_event.id ][ 'color' ],
				'durationEditable'	: bookacti.booking_system[ booking_system_id ][ 'events_data' ][ single_event.id ][ 'is_resizable' ] && bookacti_localized.is_admin ? true : false,
				'events'			: [ single_event ]
			};
			
			// Display this event source
			if( event_source.events.length !== 0 ) {
				bookacti_booking_method_display_event_source( booking_system, event_source );
			}
		
			++index;
		}
		
		if( index < events_length ) {
			// set Timeout for "async" iteration
			setTimeout( do_events, 0 );
		} else {
			// End loading
			if( booking_system_id === 'bookacti-template-calendar' ) {
				bookacti_stop_template_loading();
			} else {
				bookacti_stop_loading_booking_system( booking_system );
			}
		}
	}
	do_events();
}


// Get repeated events sources by event
function bookacti_display_repeated_events( booking_system, repeated_events, interval ) {

	var booking_system_id = booking_system.attr( 'id' );
	
	repeated_events	= repeated_events || false;
	interval		= interval || false;
	
	// If booking system settings are not set or if there is no repeated event, return an empty array
	if( ! bookacti.booking_system[ booking_system_id ] || ! repeated_events ) { return []; }
	
	// The maximum browser loading time to keep it reponsive
	var maxTimePerChunk = 50;
	
	// Return current time
    function now() { return new Date().getTime(); }

	var calendar_start	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'start' ] );
	var calendar_end	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'end' ] );
	var current_time	= moment( bookacti_localized.current_time );
	
	var event_ids		= Object.keys( repeated_events );
	var events_length	= event_ids.length;
	
	// Start loading
	if( booking_system_id === 'bookacti-template-calendar' ) {
		bookacti_start_template_loading();
	} else {
		bookacti_start_loading_booking_system( booking_system );
	}
	
	// Process each event one after another and let browser refresh between each to prevent a total freeze
	var index = 0;
	function do_events() {
		
		var startTime = now();
		
		while( index < events_length && (now() - startTime) <= maxTimePerChunk ) {
			
			// Init variables to compute occurences
			var event_id			= event_ids[ index ];
			var event_start			= moment( repeated_events[ event_id ].start );
			var event_end			= moment( repeated_events[ event_id ].end );
			var event_duration		= Math.abs( event_end.diff( event_start, 'seconds' ) );
			var event_start_time	= event_start.format( 'HH:mm:ss' );
			var event_monthday		= event_start.date();

			var repeat_from			= moment( repeated_events[ event_id ].repeat_from );
			var repeat_to			= moment( repeated_events[ event_id ].repeat_to );
			var repeat_interval		= {};

			// Make sure repeated events don't start in the past if not explicitly allowed
			if( ! bookacti.booking_system[ booking_system_id ][ 'past_events' ] ) {
				if( current_time.isAfter( repeat_from ) ) { 
					// If started event are allowed
					var current_date = bookacti_localized.current_time.substr( 0, 10 );
					var first_potential_event = moment( current_date + ' ' + event_start_time );
					first_potential_event.add( event_duration, 'seconds' );
					if( bookacti_localized.started_events_bookable && first_potential_event.isAfter( current_time ) ) {
						repeat_from = moment( current_date ); 
					} 

					// If started event are NOT allowed
					else {
						repeat_from = moment( current_date ).add( 1, 'days' ); 
					}
				}
			}

			// Make sure repeated events don't spread over templates dates
			if( calendar_start.isAfter( repeat_from ) )	{ repeat_from = calendar_start; }
			if( calendar_end.isBefore( repeat_to ) )	{ repeat_to = calendar_end; }

			// Check if the repetition period is in the interval to be rendered
			if( interval ) {
				// If the repetition period is totally outside the desired interval, skip the event
				if( ( interval.start.isAfter( repeat_from ) && interval.start.isAfter( repeat_to ) )
				||  ( interval.end.isBefore( repeat_from ) && interval.end.isBefore( repeat_to ) ) ) { ++index; continue; }
				// Else, restrict the repetition period
				if( interval.start.isAfter( repeat_from ) )	{ repeat_from = interval.start.clone(); }
				if( interval.end.isBefore( repeat_to ) )	{ repeat_to = interval.end.clone(); }
			}
			
			switch( repeated_events[ event_id ].repeat_freq ) {
				case 'daily':
					repeat_interval	= { 'days': 1 };
					break;
				case 'weekly':
					repeat_interval	= { 'days': 7 };
					// We need to make sure the repetition start from the week day of the event
					var event_weekday = event_start.isoWeekday();
					if( repeat_from.isoWeekday() <= event_weekday ) { repeat_from.isoWeekday( event_weekday ); }
					else { repeat_from.add( 1, 'weeks' ).isoWeekday( event_weekday ); }
					break;
				case 'monthly':
					// We need to make sure the repetition starts on the event month day
					if( repeat_from.date() <= event_monthday ) { repeat_from.date( event_monthday ); }
					else { 
						repeat_from.add( 1, 'months' ).date( event_monthday ); 

						// If the event_monthday is 31 (or 29, 30 or 31 in January), it could have jumped the next month
						// Make sure it doesn't happen
						if( repeat_from.date() !== event_monthday ) {
							repeat_from.subtract( 1, 'months' );
							if( event_monthday > repeat_from.daysInMonth() ) { repeat_from.endOf( 'month' ); }
						}
					}

					// The repeat_interval will be computed directly in the loop
					break;
				default:
					repeat_interval	= { 'days': 1 }; // Default to daily to avoid unexpected behavior such as infinite loop
			}
			
			// Event sources don't support custom properties. We must include them in each events
			var shared_properties = {
				'id'				: repeated_events[ event_id ].id,
				'title'				: repeated_events[ event_id ].title
			};

			// Common properties (same as shared_properties, but these are supported by FullCalendar eventSource object)
			var event_source = { 
				'id'				: 'event_' + repeated_events[ event_id ].id,
				'allDayDefault'		: false,
				'color'				: repeated_events[ event_id ].color,
				'durationEditable'	: repeated_events[ event_id ].is_resizable && bookacti_localized.is_admin ? true : false,
				'events'			: []
			};
			
			// Start loading
			if( booking_system_id === 'bookacti-template-calendar' ) { bookacti_start_template_loading(); } 
			else { bookacti_start_loading_booking_system( booking_system ); }
			
			// Compute occurences
			var loop = repeat_from;
			var chunk_nb = 0;
			var end_loop = repeat_to.unix();
			
			function do_occurrences() {
				
				var startTime2 = now();
				
				event_source.id += '_' + chunk_nb;

				// Split the event rendering into chunks of a variable size
				// Render as many event as possible in maxTimePerChunk milliseconds
				while( loop.unix() < end_loop && ( now() - startTime2 ) <= maxTimePerChunk ) {

					var occurence_start = moment( loop.format( 'YYYY-MM-DD' ) + ' ' + event_start_time );
					var occurence_end = occurence_start.clone().add( event_duration, 'seconds' );
					
					// Check if the event is in the interval to be rendered
					if( interval ) {
						if( interval.start.isAfter( occurence_start ) || interval.end.isBefore( occurence_start ) ) { loop.add( repeat_interval ); continue; }
					}
					
					// Compute start and end dates
					var event_occurence = {
						'start'	: occurence_start,
						'end'	: occurence_end
					};

					// Merge shared and specific properties
					event_occurence = $j.extend( event_occurence, shared_properties );

					// Add this occurrence to events array
					event_source.events.push( event_occurence );

					// Alter repeat_interval to make sure it matches the last day of next month
					if( repeated_events[ event_id ].repeat_freq === 'monthly' ) {
						var next_month = loop.clone().add( 1, 'months' ).date( event_monthday );
						if( next_month.date() !== event_monthday ) {
							next_month.subtract( 1, 'months' );
							if( event_monthday > next_month.daysInMonth() ) { next_month.endOf( 'month' ); }
						}
						var days_to_next_month	= Math.abs( next_month.diff( loop, 'days' ) );		
						repeat_interval = { 'days': days_to_next_month };
					}

					// Increase loop
					loop.add( repeat_interval );
				}

				// Display this event source
				if( event_source.events.length !== 0 ) {
					bookacti_booking_method_display_event_source( booking_system, event_source );
				}
				
				if( loop.unix() < end_loop ) {
					// set Timeout for "async" iteration
					++chunk_nb;
					setTimeout( do_occurrences, 0 );
				}  else {
					// End loading
					if( booking_system_id === 'bookacti-template-calendar' ) {
						bookacti_stop_template_loading();
					} else {
						bookacti_stop_loading_booking_system( booking_system );
					}
				}
			}    
			do_occurrences();
			
			++index;
		}
		
		if( index < events_length ) {
			// set Timeout for "async" iteration
			setTimeout( do_events, 0 );
		} else {
			// End loading
			if( booking_system_id === 'bookacti-template-calendar' ) {
				bookacti_stop_template_loading();
			} else {
				bookacti_stop_loading_booking_system( booking_system );
			}
		}
	}    
	do_events();
}


// Retrieve events sources by group of events
function bookacti_display_group_events( booking_system, groups ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	groups = groups || bookacti.booking_system[ booking_system_id ][ 'groups_events' ];
	
	var group_categories	= bookacti.booking_system[ booking_system_id ][ 'group_categories' ];
	
	if( $j.isEmptyObject( groups ) || group_categories.length === 0 ) { return []; }
	
	var activities		= bookacti.booking_system[ booking_system_id ][ 'activities' ];
	var calendar_start	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'start' ] );
	var calendar_end	= moment( bookacti.booking_system[ booking_system_id ][ 'template_data' ][ 'end' ] );
	var current_time	= moment( bookacti_localized.current_time );
	
	// The maximum browser loading time to keep it reponsive
	var maxTimePerChunk = 100;
	
	// Return current time
    function now() { return new Date().getTime(); }
	
	var group_ids		= Object.keys( groups );
	var groups_length	= group_ids.length;
	
	// Start loading
	bookacti_start_loading_booking_system( booking_system );
	
	// Process each group of events event one after another and let browser refresh between each to prevent a total freeze
	var group_index = 0;
	function do_groups() {
		
		var startTime = now();
		
		while( group_index < groups_length && (now() - startTime) <= maxTimePerChunk ) {
			
			var group_id		= group_ids[ group_index ];
			var events			= groups[ group_id ];
			var events_length	= events.length;
			
			var event_index	= 0;
			var chunk_nb	= 0;
			function do_events() {
				
				var startTime = now();
				
				var event_source = { 
					'id'				: 'group_' + group_id + '_' + chunk_nb,
					'allDayDefault'		: false,
					'durationEditable'	: false,
					'events'			: []
				};
		
				while( event_index < events_length && (now() - startTime) <= maxTimePerChunk ) {
					
					var group_event = events[ event_index ];
					var event_start_date = group_event.start.substr( 0, 10 );

					// Check if the event is part of displayed activities
					var activity_id = bookacti.booking_system[ booking_system_id ][ 'events_data' ][ group_event.id ][ 'activity_id' ];
					if( activities.length && $j.inArray( activity_id, activities ) ) {
						return true;
					}

					// Make sure the event isn't past if not explicitly allowed
					if( ! bookacti.booking_system[ booking_system_id ][ 'past_events' ] ) {
						if( current_time.isAfter( group_event.start ) ) { 
							// If started event are allowed
							if( ! bookacti_localized.started_events_bookable || current_time.isAfter( group_event.end ) ) {
								return true;
							}
						}
					}

					// Make sure events are not out of templates, else skip to next event
					if( calendar_start.isAfter( event_start_date ) || calendar_end.isBefore( event_start_date ) ) { return true; }

					// Reconstitute a correct event
					var event = {
						'id'				: group_event.id,
						'title'				: group_event.title,
						'start'				: group_event.start,
						'end'				: group_event.end,
						'color'				: bookacti.booking_system[ booking_system_id ][ 'events_data' ][ group_event.id ][ 'color' ]
					};
					
					event_source.events.push( event );
					
					++event_index;
				}
				
				// Display this event source
				if( event_source.events.length !== 0 ) {
					bookacti_booking_method_display_event_source( booking_system, event_source );
				}
				
				if( event_index < events_length ) {
					// set Timeout for "async" iteration
					++chunk_nb;
					setTimeout( do_events, 10 );
				} else {
					// End loading
					bookacti_stop_loading_booking_system( booking_system );
				}
			}
			do_events();
			
			++group_index;
		}
		
		if( group_index < groups_length ) {
			// set Timeout for "async" iteration
			setTimeout( do_groups, 20 );
		} else {
			// End loading
			bookacti_stop_loading_booking_system( booking_system );
		}
	}
	do_groups();
}


// Switch a booking method
function bookacti_switch_booking_method( booking_system, method ) {
	
	// Sanitize parameters
	method = $j.inArray( method, bookacti_localized.available_booking_methods ) === -1 ? 'calendar' : method;
	
	// If no changes are made, do not perform the function
	if( method === bookacti.booking_system[ booking_system_id ][ 'method' ] ) {
		return false;
	}
	
	var booking_system_id	= booking_system.attr( 'id' );
	var attributes			= bookacti.booking_system[ booking_system_id ];
	
	bookacti_start_loading_booking_system( booking_system );
	
	$j.ajax({
        url: bookacti_localized.ajaxurl,
        type: 'POST',
        data: {	
			'action': 'bookactiSwitchBookingMethod', 
			'booking_system_id': booking_system_id,
			'attributes': JSON.stringify( attributes ),
			'method': method,
			'nonce': bookacti_localized.nonce_switch_booking_method
		},
        dataType: 'json',
        success: function( response ){
			
			if( response.status === 'success' ) {
				
				// Change the booking system attribute
				bookacti.booking_system[ booking_system_id ][ 'method' ] = method;
				
				// Fill the booking method elements
				booking_system.empty();
				booking_system.append( response.html_elements );
				
				// Load the booking method
				bookacti_booking_method_set_up( booking_system );
				
				
			} else {
				var error_message = bookacti_localized.error_switch_booking_method;
				if( response.error === 'not_allowed' ) {
					error_message += '\n' + bookacti_localized.error_not_allowed;
				}
				console.log( error_message );
				console.log( response );
			}
        },
        error: function( e ){
            console.log( 'AJAX ' + bookacti_localized.error_switch_booking_method );
            console.log( e );
        },
        complete: function() { 
			bookacti_stop_loading_booking_system( booking_system );
		}
    });	
}


// Display events of a specific view
function bookacti_fetch_view_events( booking_system, view ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	var interval		= bookacti.booking_system[ booking_system_id ][ 'events_interval' ];
	var settings		= bookacti.booking_system[ booking_system_id ][ 'template_data' ];
	
	var view_start		= view.start.clone();
	var view_end		= view.end.clone().subtract( 1, 'days' );
	
	var new_interval	= false;
	var event_window	= 92;
	var min_interval	= {
		'start' : view_start.clone(),
		'end' : view_end.clone()
	};
	
	// Compute the new interval of events to load
	// If no events has ever been loaded, compute the first interval to load
	if( $j.isEmptyObject( interval ) ) { 
		new_interval = bookacti_get_new_interval_of_events( booking_system, min_interval, event_window );
	} 

	// Else, check if the view contain unloaded days, and if so, load events for this new interval
	else { 

		var interval_start	= moment.utc( interval.start );
		var interval_end	= moment.utc( interval.end );

		if( view_start.isBefore( interval_start ) || view_end.isAfter( interval_end ) ) {

			var calendar_start	= moment.utc( settings.start );
			var calendar_end	= moment.utc( settings.end );

			var new_interval_start	= interval_start.clone();
			var new_interval_end	= interval_end.clone();

			// If the current view include the old interval or if they are not connected at all,
			// Remove the current events and fetch events of the new interval
			if( ( view_start.isBefore( interval_start ) && view_end.isAfter( interval_end ) ) 
			||  ( view_end.isBefore( interval_start ) )	
			||  ( view_start.isAfter( interval_end ) ) ) {
				console.log( 'clear' );
				// Remove events
				bookacti_booking_method_clear_events( $j( '#bookacti-template-calendar' ) );

				// Compute new interval
				var new_interval = bookacti_get_new_interval_of_events( booking_system, min_interval, event_window );
			}

			else {
				// If current view starts before current interval of events, loads previous bunch of events
				if( view_start.isBefore( interval_start ) ) {
					console.log( 'previous' );
					new_interval_start.subtract( event_window, 'days' );
					if( view_start.isBefore( new_interval_start ) ) {
						new_interval_start = view_start.clone();
					}
					if( new_interval_start.isBefore( calendar_start ) ) { 
						new_interval_start = calendar_start.clone();
					}
					new_interval_end = interval_start.clone().subtract( 1, 'days' );
				}

				// If current view ends after current interval of events, loads next bunch of events
				else if( view_end.isAfter( interval_end ) ) {
					console.log( 'next' );
					new_interval_end.add( event_window, 'days' );
					if( view_end.isAfter( new_interval_end ) ) {
						new_interval_end = view_end.clone();
					}
					if( new_interval_end.isAfter( calendar_end ) ) { 
						new_interval_end = calendar_end.clone();
					}
					new_interval_start = interval_end.clone().add( 1, 'days' );
				}

				new_interval = {
					'start': new_interval_start.format( 'YYYY-MM-DD' ),
					'end': new_interval_end.format( 'YYYY-MM-DD' )
				};
			}
		}
	}
	
	// Fetch events of the interval
	if( new_interval !== false ) {
		if( booking_system_id === 'bookacti-template-calendar' ) {
			bookacti_fetch_events_on_template( null, new_interval );
		} else {
			bookacti_fetch_events( booking_system, new_interval );
		}
	}
}


// Get the first events interval
function bookacti_get_new_interval_of_events( booking_system, min_interval, interval_duration ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	var template_interval = bookacti.booking_system[ booking_system_id ][ 'template_data' ];
	
	if( typeof template_interval.start === 'undefined' || typeof template_interval.end === 'undefined' ) { return {}; }
	
	var past_events		= bookacti.booking_system[ booking_system_id ][ 'past_events' ];
	var current_time	= moment( bookacti_localized.current_time );
	var current_date	= current_time.format( 'YYYY-MM-DD' );

	var calendar_start	= moment( template_interval.start );
	var calendar_end	= moment( template_interval.end ).add( 1, 'days' );
	
	if( ! past_events && calendar_end.isBefore( current_time ) ) { return []; }
	
	min_interval		= min_interval || { 'start' : current_date, 'end' : current_date };
	interval_duration	= parseInt( interval_duration ) || 92;
	
	var interval_start	= moment( min_interval.start );
	var interval_end	= moment( min_interval.end ).add( 1, 'days' );
	var min_interval_duration = parseInt( Math.abs( moment( min_interval.end ).diff( min_interval.start, 'days' ) ) );
	
	if( min_interval_duration > interval_duration ) { interval_duration = min_interval_duration; }
	
	var half_interval	= Math.round( ( interval_duration - min_interval_duration ) / 2 );
	var interval_end_days_to_add = half_interval;
	
	// Compute Interval start
	if( past_events ) {
		interval_start.subtract( half_interval, 'days' );
		if( calendar_start.isAfter( interval_start ) ) {
			interval_end_days_to_add += Math.abs( interval_start.diff( calendar_start, 'days' ) );
			interval_start = calendar_start.clone();
		}
	} else {
		interval_end_days_to_add += half_interval;
	}
	
	// Compute interval end
	interval_end.add( interval_end_days_to_add, 'days' );
	if( calendar_end.isBefore( interval_end ) ) {
		interval_end = calendar_end;
	}

	var interval = {
		'start'	: interval_start.format( 'YYYY-MM-DD' ), 
		'end'	: interval_end.subtract( 1, 'days' ).format( 'YYYY-MM-DD' ) 
	};

	return interval;
}


// Get the updated events interval based on the old one and one that has been added
function bookacti_get_extended_events_interval( booking_system, interval ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	var old_interval = bookacti.booking_system[ booking_system_id ][ 'events_interval' ];
	
	if( $j.isEmptyObject( interval ) ) { return old_interval; }
	
	var new_interval = [];
	if( $j.isEmptyObject( old_interval ) ) {
		new_interval = { 'start' : interval.start, 'end' : interval.end };
	} else {
		new_interval = {
			'start'	: moment( interval.start ).isBefore( old_interval.start ) ? interval.start : old_interval.start,
			'end'	: moment( interval.end ).isAfter( old_interval.end ) ? interval.end : old_interval.end
		};
	}
	
	return new_interval;
}


// An event is clicked
function bookacti_event_click( booking_system, event ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	// Get the group id of an event or open a dialog to choose a group
	var group_ids = bookacti_get_event_group_ids( booking_system, event );
	
	// Open a dialog to choose the group of events 
	// if there are several groups, or if users can choose between the single event and at least one group
	if( ( $j.isArray( group_ids ) && group_ids.length > 1 )
	||  ( $j.isArray( group_ids ) && group_ids.length === 1 && bookacti.booking_system[ booking_system_id ][ 'groups_single_events' ] ) ) {
		bookacti_dialog_choose_group_of_events( booking_system, group_ids, event );
	} else {
		// Pick events (single or whole group)
		bookacti_pick_events_of_group( booking_system, group_ids, event );
	}
	
	// If there is only one event in the array, extract it
	group_ids = $j.isArray( group_ids ) && group_ids.length === 1 ? group_ids[ 0 ] : group_ids;
	
	// Yell the event has been clicked
	booking_system.trigger( 'bookacti_event_click', [ event, group_ids ] );
}


// Return groups ids of an event
function bookacti_get_event_group_ids( booking_system, event ) {
	// Check required data
	if( typeof event !== 'object' ) {
		return false;
	} else if( typeof event.id === 'undefined' || typeof event.start === 'undefined' || typeof event.end === 'undefined' ) {
		return false;
	}
	
	var booking_system_id = booking_system.attr( 'id' );
	
	// Format data
	var event_id	= event.id;
	var event_start = event.start instanceof moment ? event.start.format( 'YYYY-MM-DD HH:mm:ss' ) : event.start;
	var event_end	= event.end instanceof moment ? event.end.format( 'YYYY-MM-DD HH:mm:ss' ) : event.end;
	
	var group_ids = [];
	
	$j.each( bookacti.booking_system[ booking_system_id ][ 'groups_events' ], function( group_id, group_events ){
		$j.each( group_events, function( i, group_event ){
			if( group_event[ 'id' ] == event_id
			&&  group_event[ 'start' ] === event_start
			&&  group_event[ 'end' ] === event_end ) {
				group_ids.push( group_id );
				return false; // Break the loop
			}
		});
	});
	
	// If event is single
	if( ! group_ids.length ) {
		group_ids = 'single';
	}
	
	return group_ids;
}


// Fill form fields
function bookacti_fill_form_fields( booking_system, event, group_id ) {
	
	group_id = $j.isArray( group_id ) && group_id.length === 1 ? group_id[ 0 ] : group_id;
	group_id = $j.isNumeric( group_id ) || group_id === 'single' ? group_id : false;
	
	var start	= event.start instanceof moment ? event.start.format( 'YYYY-MM-DD HH:mm:ss' ) : event.start;
	var end		= event.end instanceof moment ?  event.end.format( 'YYYY-MM-DD HH:mm:ss' ) : event.end;
	
	// Fill the form fields
	if( group_id !== false ) {
		booking_system.siblings( '.bookacti-booking-system-inputs' ).find( 'input[name="bookacti_group_id"]' ).val( group_id );
	}
	booking_system.siblings( '.bookacti-booking-system-inputs' ).find( 'input[name="bookacti_event_id"]' ).val( event.id );
	booking_system.siblings( '.bookacti-booking-system-inputs' ).find( 'input[name="bookacti_event_start"]' ).val( start );
	booking_system.siblings( '.bookacti-booking-system-inputs' ).find( 'input[name="bookacti_event_end"]' ).val( end );
}


// Pick all events of a group onto the calendar
function bookacti_pick_events_of_group( booking_system, group_id, event ) {
	
	group_id = $j.isArray( group_id ) && group_id.length === 1 ? group_id[ 0 ] : group_id;
	group_id = $j.isNumeric( group_id ) || group_id === 'single' ? group_id : false;
	
	// Sanitize inputs
	if(   group_id === 'single'	&& typeof event !== 'object' ) { return false; }
	if( ! group_id				&& typeof event !== 'object' ) { return false; }
	if( ! group_id				&& typeof event === 'object' ) { group_id = 'single'; }
	
	var booking_system_id = booking_system.attr( 'id' );
	
	// Empty the picked events and refresh them
	bookacti_unpick_all_events( booking_system );
	
	// Pick a single event or the whol group
	if( group_id === 'single' ) {
		bookacti_pick_event( booking_system, event );
	} else {
		// Pick the events of the group
		$j.each( bookacti.booking_system[ booking_system_id ][ 'groups_events' ][ group_id ], function( i, grouped_event ){
			bookacti_pick_event( booking_system, grouped_event );
		});
	}
	
	booking_system.trigger( 'bookacti_events_picked', [ group_id, event ] );
}


// Pick an event
function bookacti_pick_event( booking_system, event ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	// Return false if we don't have both event id and event start
	if( ( typeof event !== 'object' )
	||  ( typeof event === 'object' && ( typeof event.id === 'undefined' || typeof event.start === 'undefined' ) ) ) {
		return false;
	}
	
	// Format event object
	var picked_event = {
		'id':			event.id,
		'title':		event.title,
		'start':		event.start instanceof moment ? event.start.format( 'YYYY-MM-DD HH:mm:ss' ) : event.start,
		'end':			event.end instanceof moment ? event.end.format( 'YYYY-MM-DD HH:mm:ss' ) : event.end,
		'bookings':		event.bookings
	};
	
	// Keep picked events in memory 
	bookacti.booking_system[ booking_system_id ][ 'picked_events' ].push( picked_event );
	
	booking_system.trigger( 'bookacti_pick_event', [ event ] );
}


// Unpick an event
function bookacti_unpick_event( booking_system, event, start, all ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	// Determine if all event should be unpicked
	all = all ? true : false;
	start = typeof start !== 'undefined' ? start : false;
	
	// Return false if we don't have both event id and event start
	if( ( typeof event !== 'object' && ! $j.isNumeric( event ) )
	||  ( typeof event === 'object' && ( typeof event.id === 'undefined' || typeof event.start === 'undefined' ) )
	||  ( $j.isNumeric( event ) && ! all && typeof start === 'undefined' ) ) {
		return false;
	}
	
	// If no start value and event is an object, take the event object start value
	if( ! start && typeof event === 'object' ) {
		start = all ? false : event.start;
	}
	
	// Format event object
	var event_to_unpick = {
		'id':	typeof event === 'object' ? event.id : event,
		'start':start instanceof moment ? start.format( 'YYYY-MM-DD HH:mm:ss' ) : start
	};
	
	// Remove picked event(s) from memory 
	var picked_events = $j.grep( bookacti.booking_system[ booking_system_id ][ 'picked_events' ], function( picked_event ){
		if( picked_event.id == event_to_unpick.id 
		&&  (  all 
			|| picked_event.start.substr( 0, 10 ) === event_to_unpick.start.substr( 0, 10 ) ) ) {

			// Remove the event from the picked_events array
			return false;
		}
		// Keep the event from the picked_events array
		return true;
	});
	
	bookacti.booking_system[ booking_system_id ][ 'picked_events' ] = picked_events;
	
	booking_system.trigger( 'bookacti_unpick_event', [ event, all ] );
}


// Reset picked events
function bookacti_unpick_all_events( booking_system ) {
	var booking_system_id = booking_system.attr( 'id' );
	
	bookacti.booking_system[ booking_system_id ][ 'picked_events' ] = [];
	
	booking_system.trigger( 'bookacti_unpick_all_events' );
}


// Display a list of picked events
function bookacti_fill_picked_events_list( booking_system ) {
	
	var booking_system_id	= booking_system.attr( 'id' );
	var event_list_title	= booking_system.siblings( '.bookacti-picked-events' ).find( '.bookacti-picked-events-list-title' );
	var event_list			= booking_system.siblings( '.bookacti-picked-events' ).find( '.bookacti-picked-events-list' );
	
	event_list.empty();
	
	if( typeof bookacti.booking_system[ booking_system_id ][ 'picked_events' ] !== 'undefined' ) {
		if( bookacti.booking_system[ booking_system_id ][ 'picked_events' ].length > 0 ) {
		
			// Fill title with singular or plural
			if( bookacti.booking_system[ booking_system_id ][ 'picked_events' ].length > 1 ) {
				event_list_title.html( bookacti_localized.selected_events );
			} else {
				event_list_title.html( bookacti_localized.selected_event );
			}

			// Fill the picked events list
			$j.each( bookacti.booking_system[ booking_system_id ][ 'picked_events' ], function( i, event ) {
				
				var event_duration = bookacti_format_event_duration( event.start, event.end );
				
				var event_data = {
					'title': '<span class="bookacti-booking-event-title" >'  + event.title + '</span>',
					'duration': event_duration,
					'quantity': 1
				};

				booking_system.trigger( 'bookacti_picked_events_list_data', [ event_data ] );
				
				var activity_id = bookacti.booking_system[ booking_system_id ][ 'events_data' ][ event.id ][ 'activity_id' ];
				var unit = bookacti_get_activity_unit( booking_system, activity_id, event_data.quantity );

				if( unit !== '' ) {
					unit = '<span class="bookacti-booking-event-quantity-separator" > - </span>' 
						 + '<span class="bookacti-booking-event-quantity" >' + unit + '</span>';
				}

				var list_element = $j( '<li />', {
					'html': event_data.title + '<span class="bookacti-booking-event-title-separator" > - </span>' + event_duration + unit
				});

				event_list.append( list_element );
			});

			booking_system.siblings( '.bookacti-picked-events' ).show();

			booking_system.trigger( 'bookacti_picked_events_list_filled' );
		}
	}
}


// Format an event
function bookacti_format_event_duration( start, end ) {
	
	start	= start instanceof moment ? start.format( 'YYYY-MM-DD HH:mm:ss' ) : start;
	end		= end instanceof moment ? end.format( 'YYYY-MM-DD HH:mm:ss' ) : end;
	
	var start_and_end_same_day	= start.substr( 0, 10 ) === end.substr( 0, 10 );
	var class_same_day			= start_and_end_same_day ? 'bookacti-booking-event-end-same-day' : '';
	var end_format				= start_and_end_same_day ? 'LT' : bookacti_localized.date_format;
	
	var event_start = moment( start ).locale( bookacti_localized.current_lang_code );
	var event_end = moment( end ).locale( bookacti_localized.current_lang_code );
	
	var event_duration	= '<span class="bookacti-booking-event-start">' + event_start.format( bookacti_localized.date_format ) + '</span>' 
						+ '<span class="bookacti-booking-event-date-separator ' + class_same_day + '"> &rarr; ' + '</span>' 
						+ '<span class="bookacti-booking-event-end ' + class_same_day + '">' + event_end.format( end_format ) + '</span>';
	
	return event_duration;
}


// Get activity unit value
function bookacti_get_activity_unit( booking_system, activity_id, qty ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	var activity_data = bookacti.booking_system[ booking_system_id ][ 'activities_data' ][ activity_id ];
	
	qty	= $j.isNumeric( qty ) ? parseInt( qty ) : 1;
	var activity_val = '';
	
	if( ! activity_id || typeof activity_data === 'undefined' || qty === 0 ) {
		return '';
	}
	
	if( typeof activity_data !== 'undefined' ) {
		if( typeof activity_data[ 'settings' ] !== 'undefined' ) {
			if( typeof activity_data[ 'settings' ][ 'unit_name_plural' ] !== 'undefined'
			&&  typeof activity_data[ 'settings' ][ 'unit_name_singular' ] !== 'undefined' 
			&&  typeof activity_data[ 'settings' ][ 'places_number' ] !== 'undefined' ) {

				if( activity_data[ 'settings' ][ 'unit_name_plural' ] !== ''
				&&  activity_data[ 'settings' ][ 'unit_name_singular' ] !== '' ) { 
					activity_val += qty + ' ';
					if( qty > 1 ) {
						activity_val += activity_data[ 'settings' ][ 'unit_name_plural' ];
					} else {
						activity_val += activity_data[ 'settings' ][ 'unit_name_singular' ];
					}
				}
				if( activity_data[ 'settings' ][ 'places_number' ] !== '' 
				&&  parseInt( activity_data[ 'settings' ][ 'places_number' ] ) > 0 )
				{
					if( parseInt( activity_data[ 'settings' ][ 'places_number' ] ) > 1 ) {
						activity_val += ' ' + bookacti_localized.n_persons_per_booking.replace( '%1$s', activity_data[ 'settings' ][ 'places_number' ] );
					} else {
						activity_val += ' ' + bookacti_localized.one_person_per_booking;
					}
				}

				if((activity_data[ 'settings' ][ 'unit_name_plural' ] !== ''
				&&	activity_data[ 'settings' ][ 'unit_name_singular' ] !== '' )
				|| (activity_data[ 'settings' ][ 'places_number' ] !== ''
				&&	parseInt( activity_data[ 'settings' ][ 'places_number' ] ) !== 0 ) ) {
					activity_val += '<br/>';
				}
			}
		}
	}
	
	return activity_val;
}


// Clear booking system displayed info
function bookacti_clear_booking_system_displayed_info( booking_system ) {
	
	// Empty the picked events info
	booking_system.siblings( '.bookacti-booking-system-inputs' ).find( 'input' ).val('');
	booking_system.siblings( '.bookacti-picked-events' ).find( '.bookacti-picked-events-list' ).empty();
	booking_system.siblings( '.bookacti-picked-events' ).hide();
	bookacti_unpick_all_events( booking_system );
	
	// Clear errors
	booking_system.siblings( '.bookacti-notices' ).hide();
	booking_system.siblings( '.bookacti-notices' ).empty();
	booking_system.show();
	
	booking_system.trigger( 'bookacti_displayed_info_cleared' );
}


// Update booking system settings
function bookacti_update_settings_from_database( booking_system, template_ids ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	if( booking_system_id === 'bookacti-template-calendar' ) {
		bookacti_start_template_loading();
	} else {
		bookacti_start_loading_booking_system( booking_system );
	}
	
    // Retrieve template data
    $j.ajax({
        url: bookacti_localized.ajaxurl, 
        data: { 'action': 'bookactiGetBookingSystemData', 
                'template_ids': template_ids,
                'is_admin': bookacti_localized.is_admin,
                'nonce': bookacti_localized.nonce_get_booking_system_data
			}, 
        type: 'POST',
        dataType: 'json',
        success: function( response ){
			
            // If success
            if( response.status === 'success' && response.template_data ) {
				
				bookacti.booking_system[ booking_system_id ][ 'template_data' ] = response.template_data;
				
				// Update calendar settings
				if( booking_system.attr( 'id' ) === 'bookacti-template-calendar' ) {
					bookacti_update_calendar_settings( booking_system, response.template_data );
				} else {
					bookacti_booking_method_update_template_data( booking_system );
				}
				
				
            // If error
            } else {
				var message_error = bookacti_localized.error_retrieve_template_data;
				if( response.error === 'not_allowed' ) {
					message_error += '\n' + bookacti_localized.error_not_allowed;
				}
				console.log( message_error );
				console.log( response );
            }
        },
        error: function( e ){
            console.log( 'AJAX ' + bookacti_localized.error_retrieve_template_data );        
            console.log( e );
        },
        complete: function() { 
			if( booking_system_id === 'bookacti-template-calendar' ) {
				bookacti_stop_template_loading();
			} else {
				bookacti_stop_loading_booking_system( booking_system );
			}
		}
    });
}


// Get event booking numbers
function bookacti_get_event_number_of_bookings( event, booking_system_id ) {
	
	var bookings = bookacti.booking_system[ booking_system_id ][ 'bookings' ];
	
	if( ! bookings ) { return 0; }
	
	bookings = bookacti.booking_system[ booking_system_id ][ 'bookings' ][ event.id ];
	
	if( ! bookings ) { return 0; }
	
	var number_of_bookings = 0;
	$j.each( bookings, function( i, booking ) {
		if( event.start.format( 'YYYY-MM-DD HH:mm:ss' ) === booking.event_start
		&&  event.end.format( 'YYYY-MM-DD HH:mm:ss' ) === booking.event_end ) {
			number_of_bookings = parseInt( booking.quantity );
			return false; // Break the loop
		}
	});

	return number_of_bookings;
}


// Get event available places
function bookacti_get_event_availability( event ) {
	var event_availability = bookacti.booking_system[ booking_system_id ][ 'events_data' ][ event.id ][ 'availability' ];
	return parseInt( event_availability ) - parseInt( event.bookings );
}


// Get group available places
function bookacti_get_group_availability( group_events ) {
	
	if( ! $j.isArray( group_events ) || group_events.length <= 0 ) {
		return 0;
	}
	
	var min_availability = 999999999999; // Any big int
	$j.each( group_events, function( i, event ) {
		var event_availability = bookacti_get_event_availability( event );
		min_availability = event_availability < min_availability ? event_availability : min_availability;
	});
	
	return min_availability;
}


// Check if an event is event available
function bookacti_is_event_available( booking_system, event ) {
	
	var booking_system_id	= booking_system.attr( 'id' );
	var availability		= bookacti_get_event_availability( event );
	var is_available		= false;
	
	if( availability > 0 )  {
		is_available = true;
		// If grouped events can only be book with their whole group
		if( ! bookacti.booking_system[ booking_system_id ][ 'groups_single_events' ] ) {
			// Check if the event is part of a group
			var group_ids = bookacti_get_event_group_ids( booking_system, event );
			if( $j.isArray( group_ids ) && group_ids.length > 0 ) {
				// Check if the event is available in one group at least
				is_available = false;
				$j.each( group_ids, function( i, group_id ) {
					var group_availability = bookacti_get_group_availability( bookacti.booking_system[ booking_system_id ][ 'groups_events' ][ group_id ] );
					if( group_availability > 0 ) {
						is_available = true;
						return false; // Break the loop
					}
				});
			}
		}
	}
	
	return is_available;
}


// Get group available places
function bookacti_get_bookings_number_for_a_single_grouped_event( event, event_groups, all_groups ) {
	
	var start	= event.start instanceof moment ? event.start.format( 'YYYY-MM-DD HH:mm:ss' ) : event.start;
	var end		= event.end instanceof moment ?  event.end.format( 'YYYY-MM-DD HH:mm:ss' ) : event.end;
	
	var group_bookings = 0;
	$j.each( event_groups, function( i, group_id ){
		$j.each( all_groups[ group_id ], function( i, grouped_event ){
			if( event.id === grouped_event.id
			&&  start === grouped_event.start 
			&&  end === grouped_event.end ) {
				group_bookings += parseInt( grouped_event.group_bookings );
			}
		});
	});
	
	return parseInt( event.bookings ) - group_bookings;
}


// Get a div with event available places
function bookacti_get_event_availability_div( booking_system, event ) {
	
	var booking_system_id = booking_system.attr( 'id' );
	
	var available_places = bookacti_get_event_availability( event );
	
	var unit_name = '';
	var activity_id = bookacti.booking_system[ booking_system_id ][ 'events_data' ][ event.id ][ 'activity_id' ];
	if( activity_id ) {
		
		var activity_data = bookacti.booking_system[ booking_system_id ][ 'activities_data' ][ activity_id ];
		
		if( activity_data !== undefined ) {
			if( activity_data[ 'settings' ] !== undefined ) {
				if( activity_data[ 'settings' ][ 'unit_name_plural' ] !== undefined
				&&  activity_data[ 'settings' ][ 'unit_name_singular' ] !== undefined 
				&&  activity_data[ 'settings' ][ 'show_unit_in_availability' ] !== undefined ) {
					if( parseInt( activity_data[ 'settings' ][ 'show_unit_in_availability' ] ) ) {
						if( available_places > 1 ) {
							unit_name = activity_data[ 'settings' ][ 'unit_name_plural' ];
						} else {
							unit_name = activity_data[ 'settings' ][ 'unit_name_singular' ];
						}
					}
				}
			}
		}
	}
	
	var avail = available_places > 1 ? bookacti_localized.avails : bookacti_localized.avail;
	
	//Detect if the event is available or full, and if it is booked or not
	var availability = bookacti.booking_system[ booking_system_id ][ 'events_data' ][ event.id ][ 'availability' ];
	var class_booked = available_places < availability ? 'bookacti-booked' : 'bookacti-not-booked';
	var class_full = available_places <= 0 ? 'bookacti-full' : '';
	
	//Build a div with availability
	var div = '<div class="bookacti-availability-container" >' 
				+ '<span class="bookacti-available-places ' + class_booked + ' ' + class_full + '" >'
					+ '<span class="bookacti-available-places-number">' + available_places + '</span>' 
					+ '<span class="bookacti-available-places-unit-name"> ' + unit_name + '</span>' 
					+ '<span class="bookacti-available-places-avail-particle"> ' + avail + '</span>'
				+ '</span>'
			+ '</div>';
	
	return div;
}


// Display an error message if no availability was found
function bookacti_add_error_message( booking_system, message ) {
	
	message = message || bookacti_localized.error_no_events_bookable;
	
	booking_system.hide();
	booking_system.siblings( '.bookacti-notices' ).empty().append( "<ul class='bookacti-error-list'><li>" + message + "</li></ul>" ).show();
	
	booking_system.trigger( 'bookacti_error_displayed', [ message ] );
}


// Sort an array of events by dates
function bookacti_sort_events_array_by_dates( array, sort_by_end, desc, labels ) {
	
	sort_by_end = sort_by_end || false;
	desc = desc || false;
	labels = labels || { 'start': 'start', 'end': 'end' };
	
	array.sort( function( a, b ) {
		
		// Sort by start date ASC
		var sort = sort_by_end ? 0 : new Date( a[ labels.start ] ) - new Date( b[ labels.start ] );
		
		// If start date is the same, then sort by end date ASC
		if( sort === 0 ) {
			sort = new Date( a[ labels.end ] ) - new Date( b[ labels.end ] );
		}
		
		if( desc === true ) { sort = ! sort; }
		
		return sort;
	});
	
	return array;
}


// Booking system actions based on booking method

// Load the booking system according to booking method
function bookacti_booking_method_set_up( booking_system, reload_events, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	reload_events = reload_events ? 1 : 0;
	
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_set_calendar_up( booking_system, reload_events );
	} else {
		booking_system.trigger( 'bookacti_booking_method_set_up', [ booking_method, reload_events ] );
	}
}


// Fill the events in the booking method
function bookacti_booking_method_fill_with_events( booking_system, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_fill_calendar_with_events( booking_system );
	} else {
		booking_system.trigger( 'bookacti_booking_method_fill_with_events', [ booking_method ] );
	}
}


// Fill the events in the booking method
function bookacti_booking_method_display_event_source( booking_system, event_source, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_display_event_source_on_calendar( booking_system, event_source );
	} else {
		booking_system.trigger( 'bookacti_booking_method_display_event_source', [ booking_method, event_source ] );
	}
}


// Update the calendar settings according to booking method
function bookacti_booking_method_update_template_data( booking_system, template_data, booking_method ) {
	var booking_system_id	= booking_system.attr( 'id' );
	booking_method			= booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	template_data			= template_data || bookacti.booking_system[ booking_system_id ][ 'template_data' ];
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_update_calendar_settings( booking_system.find( '.bookacti-calendar:first' ), bookacti.booking_system[ booking_system_id ][ 'template_data' ] );
	} else {
		booking_system.trigger( 'bookacti_update_template_data', [ booking_method, template_data ] );
	}
}


// Refetch events according to booking method
function bookacti_booking_method_refetch_events( booking_system, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		booking_system.find( '.bookacti-calendar' ).fullCalendar( 'removeEvents' );
		bookacti_fetch_events( booking_system );
	} else {
		booking_system.trigger( 'bookacti_refetch_events', [ booking_method ] );
	}
}


// Rerender events according to booking method
function bookacti_booking_method_rerender_events( booking_system, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_refresh_calendar_view( booking_system );
		booking_system.fullCalendar( 'rerenderEvents' );
	} else {
		booking_system.trigger( 'bookacti_rerender_events', [ booking_method ] );
	}
}


// Clear events according to booking method
function bookacti_booking_method_clear_events( booking_system, event, booking_method ) {
	var booking_system_id = booking_system.attr( 'id' );
	booking_method = booking_method || bookacti.booking_system[ booking_system_id ][ 'method' ];
	event = event || null;
	
	// Reset global arrays
	if( ! event ) {
		bookacti.booking_system[ booking_system_id ][ 'events' ]			= [];
		bookacti.booking_system[ booking_system_id ][ 'events_data' ]		= [];
		bookacti.booking_system[ booking_system_id ][ 'events_interval' ]	= [];
	} else {
		delete bookacti.booking_system[ booking_system_id ][ 'events_data' ][ event.id ];
	}
	
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		bookacti_clear_events_on_calendar( booking_system, event );
	} else {
		booking_system.trigger( 'bookacti_clear_events', [ booking_method, event ] );
	}
}



// LOADING

// Start a loading (or keep on loading if already loading)
function bookacti_start_loading_booking_system( booking_system ) {
	
	var booking_system_id	= booking_system.attr( 'id' );
	var booking_method		= bookacti.booking_system[ booking_system_id ][ 'method' ];
	
	var loading_div = '<div class="bookacti-loading-alt">' 
					+	'<img class="bookacti-loader" src="' + bookacti_localized.plugin_path + '/img/ajax-loader.gif" title="' + bookacti_localized.loading + '" />'
					+	'<span class="bookacti-loading-alt-text" >' + bookacti_localized.loading + '</span>'
					+ '</div>';
	
	if( ! $j.isNumeric( bookacti.booking_system[ booking_system_id ][ 'loading_number' ] ) ) {
		bookacti.booking_system[ booking_system_id ][ 'loading_number' ] = 0;
	}
	
	if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {
		if( booking_system.find( '.bookacti-calendar.fc' ).length ) {
			if( bookacti.booking_system[ booking_system_id ][ 'loading_number' ] === 0 || ! booking_system.find( '.bookacti-loading-overlay' ).length ) {
				booking_system.find( '.bookacti-loading-alt' ).remove();
				bookacti_enter_calendar_loading_state( booking_system.find( '.bookacti-calendar' ) );
			}
		} else if( ! booking_system.find( '.bookacti-loading-alt' ).length ) {
			booking_system.append( loading_div );
		}
		
	} else {
		booking_system.trigger( 'bookacti_start_loading', [ booking_method, loading_div ] );
	}
	
	if( bookacti.booking_system[ booking_system_id ][ 'loading_number' ] === 0 ) {
		booking_system.trigger( 'bookacti_enter_loading_state' );
	}
	
	bookacti.booking_system[ booking_system_id ][ 'loading_number' ]++;
}


// Stop a loading (but keep on loading if there are other loadings )
function bookacti_stop_loading_booking_system( booking_system, force_exit ) {
	
	force_exit = force_exit || false;
	
	var booking_system_id	= booking_system.attr( 'id' );
	var booking_method		= bookacti.booking_system[ booking_system_id ][ 'method' ];
	
	bookacti.booking_system[ booking_system_id ][ 'loading_number' ]--;
	bookacti.booking_system[ booking_system_id ][ 'loading_number' ] = Math.max( bookacti.booking_system[ booking_system_id ][ 'loading_number' ], 0 );
	
	if( force_exit ) { bookacti.booking_system[ booking_system_id ][ 'loading_number' ] = 0; }
	
	// Action to do after everything has loaded
	if( bookacti.booking_system[ booking_system_id ][ 'loading_number' ] === 0 ) {
		
		if( booking_method === 'calendar' || $j.inArray( booking_method, bookacti_localized.available_booking_methods ) === -1 ) {		
			bookacti_exit_calendar_loading_state( booking_system.find( '.bookacti-calendar' ) );
		} else {
			booking_system.trigger( 'bookacti_stop_loading', [ booking_method ] );
		}
		
		booking_system.find( '.bookacti-loading-alt' ).remove();
		booking_system.trigger( 'bookacti_exit_loading_state' );
		
	}
}