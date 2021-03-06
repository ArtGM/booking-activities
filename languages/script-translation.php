<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) { exit; }

// Don't localize strings here, please use .po file with poedit and submit the .mo generated file to the plugin author

$current_datetime_object = new DateTime( 'now', new DateTimeZone( bookacti_get_setting_value( 'bookacti_general_settings', 'timezone' ) ) );
$can_edit_bookings = current_user_can( 'bookacti_edit_bookings' );

$messages = bookacti_get_messages();

/**
 * Fill the translation array to use it in js 
 * @version 1.7.20
 */
$bookacti_translation_array = apply_filters( 'bookacti_translation_array', array(
	// BUTTONS
	'dialog_button_ok'                  => esc_html__( 'OK', 'booking-activities' ),
	'dialog_button_yes'					=> esc_html__( 'Yes', 'booking-activities' ),
	'dialog_button_no'					=> esc_html__( 'No', 'booking-activities' ),
	'dialog_button_reset'				=> esc_html__( 'Reset', 'booking-activities' ),
	'dialog_button_delete'				=> esc_html__( 'Delete', 'booking-activities' ),
	'dialog_button_cancel'				=> esc_html_x( 'Cancel', 'Close a dialog without doing anything', 'booking-activities' ),
	'dialog_button_create_activity'		=> esc_html__( 'Create Activity', 'booking-activities' ),
	'dialog_button_import_activity'		=> esc_html__( 'Import Activity', 'booking-activities' ),
	/* translators: 'unbind' is the process to isolate one (or several) event from a repeating event in order to edit it independently. 'Unbind selected' is a button that isolate the event the user clicked on. */
	'dialog_button_unbind_selected'		=> esc_html__( 'Unbind Selected', 'booking-activities' ),
	/* translators: 'unbind' is the process to isolate one (or several) event from a repeating event  in order to edit it independently. 'Unbind booked' is a button that split the repeating event in two : one repeating event holding all the booked events (restricted edition), and the other holding the events without bookings (fully editable). */
	'dialog_button_unbind_all_booked'	=> esc_html__( 'Unbind Booked', 'booking-activities' ),
	/* translators: 'unbind' is the process to isolate one (or several) event from a repeating event  in order to edit it independently. 'Unbind all' is a button that split the repeating event into multiple individual single events. */
	'dialog_button_unbind_all'			=> esc_html__( 'Unbind All', 'booking-activities' ),
	/* translators: 'unbind' is the process to isolate one (or several) event from a repeating event  in order to edit it independently. 'Unbind' is a button that open a dialog where the user can choose wether to unbind the selected event, all events or booked events. */
	'dialog_button_unbind'				=> esc_html__( 'Unbind', 'booking-activities' ),
	'dialog_button_cancel'				=> apply_filters( 'bookacti_translate_text', $messages[ 'cancel_dialog_button' ][ 'value' ] ),
	'dialog_button_cancel_booking'		=> apply_filters( 'bookacti_translate_text', $messages[ 'cancel_booking_dialog_button' ][ 'value' ] ),
	'dialog_button_reschedule'			=> apply_filters( 'bookacti_translate_text', $messages[ 'reschedule_dialog_button' ][ 'value' ] ),
	'dialog_button_refund'				=> $can_edit_bookings ? esc_html_x( 'Refund', 'Button label to trigger the refund action', 'booking-activities' ) : apply_filters( 'bookacti_translate_text', $messages[ 'refund_dialog_button' ][ 'value' ] ),
	'booking_form_new_booking_button'	=> apply_filters( 'bookacti_translate_text', $messages[ 'booking_form_new_booking_button' ][ 'value' ] ),
	'placeholder_select_customer'		=> esc_html__( 'Search for a customer', 'booking-activities' ),
	'show_all_customers'				=> esc_html__( 'Show all customers', 'booking-activities' ),
	'pick_an_event'						=> esc_html__( 'Pick an event', 'booking-activities' ),
	'hide_calendar'						=> esc_html__( 'Hide calendar', 'booking-activities' ),
	
	// ERRORS
	'error_retrieve_event_data'			=> esc_html__( 'Error occurs when trying to retrieve event parameters.', 'booking-activities' ),
	'error_retrieve_booking_numbers'	=> esc_html__( 'Error occurs when trying to retrieve booking numbers.', 'booking-activities' ),
	'error_update_event_param'          => esc_html__( 'Error occurs when trying to save event parameters.', 'booking-activities' ),
	'error_add_exception'               => esc_html__( 'Error occurs when trying to add repetition exceptions.', 'booking-activities' ),
	'error_delete_exception'            => esc_html__( 'Error occurs when trying to delete repetition exceptions.', 'booking-activities' ),
	'error_display_event'               => esc_html__( 'Error occurs when trying to display events.', 'booking-activities' ),
	'error_insert_event'		        => esc_html__( 'Error occurs when trying to add an activity on the calendar.', 'booking-activities' ),
	'error_resize_event'                => esc_html__( 'Error occurs when trying to resize the event on the calendar.', 'booking-activities' ),
	'error_move_event'                  => esc_html__( 'Error occurs when trying to move the event on the calendar.', 'booking-activities' ),
	'error_render_event'                => esc_html__( 'Error occurs when trying to render the event on the calendar.', 'booking-activities' ),
	'error_retrieve_exceptions'         => esc_html__( 'Error occurs when trying to retrieve the event exceptions.', 'booking-activities' ),
	'error_retrieve_bookings'           => esc_html__( 'Error occurs when trying to retrieve the bookings.', 'booking-activities' ),
	'error_event_out_of_template'       => esc_html__( 'Error: The event has been placed out of the calendar period.', 'booking-activities' ),
	'error_delete_event'                => esc_html__( 'Error occurs when trying to delete the event.', 'booking-activities' ),
	'error_no_template_selected'        => esc_html__( 'You must select a calendar first.', 'booking-activities' ),
	'error_create_template'             => esc_html__( 'Error occurs when trying to create the calendar.', 'booking-activities' ),
	'error_update_template'             => esc_html__( 'Error occurs when trying to update the calendar.', 'booking-activities' ),
	'error_delete_template'             => esc_html__( 'Error occurs when trying to delete the calendar.', 'booking-activities' ),
	'error_switch_template'             => esc_html__( 'Error occurs when trying to change the default calendar.', 'booking-activities' ),
	'error_retrieve_template_data'		=> esc_html__( 'Error occurs when trying to retrieve calendar settings.', 'booking-activities' ),
	'error_create_activity'             => esc_html__( 'Error occurs when trying to create the activity.', 'booking-activities' ),
	'error_update_activity'             => esc_html__( 'Error occurs when trying to update the activity.', 'booking-activities' ),
	'error_delete_activity'             => esc_html__( 'Error occurs when trying to delete the activity.', 'booking-activities' ),
	'error_import_activity'             => esc_html__( 'Error occurs when trying to import the activity.', 'booking-activities' ),
	'error_retrieve_activity_data'		=> esc_html__( 'Error occurs when trying to retrieve activity settings.', 'booking-activities' ),
	'error_retrieve_activity_bound'		=> esc_html__( 'Error occurs when trying to retrieve activities bound to calendars.', 'booking-activities' ),
	'error_no_avail_activity_bound'		=> esc_html__( 'No available activities found for this calendar.', 'booking-activities' ),
	'error_update_bound_events'         => esc_html__( 'Error occurs when trying to update events bound to the updated activity.', 'booking-activities' ),
	'error_edit_locked_event'           => esc_html__( 'This event is booked, you cannot move it nor change its duration.', 'booking-activities' ),
	'error_unbind_occurences'           => esc_html__( 'Error occurs when trying to unbind occurrences of the event.', 'booking-activities' ),
	/* translators: In the context, it is one of the message following 'There are bookings on at least one of the occurence of this event. You can't: ' */
	'error_move_locked_event'           => esc_html__( 'Move this occurence because it will affect the complete event.', 'booking-activities' ),
	/* translators: In the context, it is one of the message following 'There are bookings on at least one of the occurence of this event. You can't: ' */
	'error_resize_locked_event'         => esc_html__( 'Resize this occurence because it will affect the complete event.', 'booking-activities' ),
	/* translators: In the context, it is one of the message following 'There are bookings on at least one of the occurence of this event. You can't: ' */
	'error_delete_locked_event'         => esc_html__( 'Delete this occurence because it will affect the complete event.', 'booking-activities' ),
	'error_retrieve_group_category_data'	=> esc_html__( 'Error occurs when trying to retrieve the group category settings.', 'booking-activities' ),
	'error_retrieve_group_of_events_data'	=> esc_html__( 'Error occurs when trying to retrieve the group of events settings.', 'booking-activities' ),
	'error_create_group_of_events'		=> esc_html__( 'Error occurs when trying to create the group of events.', 'booking-activities' ),
	'error_update_group_of_events'		=> esc_html__( 'Error occurs when trying to update the group of events.', 'booking-activities' ),
	'error_delete_group_of_events'		=> esc_html__( 'Error occurs when trying to delete the group of events.', 'booking-activities' ),
	'error_create_group_category'		=> esc_html__( 'Error occurs when trying to create the group category.', 'booking-activities' ),
	'error_update_group_category'		=> esc_html__( 'Error occurs when trying to update the group category.', 'booking-activities' ),
	'error_delete_group_category'		=> esc_html__( 'Error occurs when trying to delete the group category.', 'booking-activities' ),
	'error_create_form'					=> esc_html__( 'An error occurs while trying to create the form.', 'booking-activities' ),
	'error_update_form'					=> esc_html__( 'An error occurs while trying to update the form.', 'booking-activities' ),
	'error_reset_form'					=> esc_html__( 'An error occurs while trying to reset the form.', 'booking-activities' ),
	'error_load_form'					=> esc_html__( 'An error occurs while trying to load the form.', 'booking-activities' ),
	'error_order_form_fields'			=> esc_html__( 'An error occurs while trying to reorder form fields.', 'booking-activities' ),
	'error_insert_form_field'			=> esc_html__( 'An error occurs while trying to insert a field to the form.', 'booking-activities' ),
	'error_remove_form_field'			=> esc_html__( 'An error occurs while trying to remove the field.', 'booking-activities' ),
	'error_update_form_field'			=> esc_html__( 'An error occurs while trying to update the field.', 'booking-activities' ),
	'error_reset_export_events_url'		=> esc_html__( 'An error occurs while trying to reset the event feed URL.', 'booking-activities' ),
	'error_reset_export_bookings_url'	=> esc_html__( 'An error occurs while trying to generate the bookings feed URL.', 'booking-activities' ),
	'error_send_email'					=> esc_html__( 'An error occurs while trying to send the email. Please try again.', 'booking-activities' ),
	
	'error_display_product_events'		=> esc_html__( 'Error occurs when trying to display product events. Please try later.', 'booking-activities' ),
	'error_book_temporary'				=> esc_html__( 'Error occurs when trying to temporarily book your event. Please try later.', 'booking-activities' ),
	'error_book'						=> esc_html__( 'Error occurs when trying to book your event. Please try again.', 'booking-activities' ),
	/* translators: It is the message displayed to users if no events bookable were found. */
	'error_no_events_bookable'			=> esc_html__( 'Sorry, no events are available.', 'booking-activities' ),
	/* translators: It is the message displayed to users if no events were found according to search criterias (filters). */
	'error_no_results'					=> esc_html__( 'No results.', 'booking-activities' ),
	/* translators: It is the message displayed to users if no bookings were found for a given event. */
	'error_no_bookings'					=> esc_html__( 'No bookings.', 'booking-activities' ),
	'error_retrieve_booking_system'		=> esc_html__( 'Error occurs while trying to retrieve booking system.', 'booking-activities' ),
	'error_reload_booking_system'		=> esc_html__( 'Error occurs while trying to reload booking system.', 'booking-activities' ),
	'error_update_settings'				=> esc_html__( 'Error occurs while trying to update settings.', 'booking-activities' ),
	'error_not_allowed'					=> esc_html__( 'You are not allowed to do that.', 'booking-activities' ),
	'error_cancel_booking'				=> esc_html__( 'Error occurs while trying to cancel booking.', 'booking-activities' ),
	'error_reschedule_booking'			=> esc_html__( 'Error occurs while trying to reschedule booking.', 'booking-activities' ),
	'error_delete_booking'				=> esc_html__( 'An error occurred while trying to delete the booking.', 'booking-activities' ),
	'error_change_booking_state'		=> esc_html__( 'Error occurs while trying to change booking state.', 'booking-activities' ),
	'error_change_booking_quantity'		=> esc_html__( 'Error occurs while trying to change booking quantity.', 'booking-activities' ),
	'error_get_refund_booking_actions'	=> esc_html__( 'Error occurs while trying to request available refund actions.  Please contact the administrator.', 'booking-activities' ),
	'error_refund_booking'				=> esc_html__( 'Error occurs while trying to request a refund. Please contact the administrator.', 'booking-activities' ),
	'error_user_not_logged_in'			=> esc_html__( 'You are not logged in. Please create an account and log in first.', 'booking-activities' ),
	'error_password_not_strong_enough'	=> esc_html__( 'Your password is not strong enough.', 'booking-activities' ),
	

	// FORMS CHECK
	'error_fill_field'                  => esc_html__( 'Please fill this field.', 'booking-activities' ),
	'error_invalid_value'               => esc_html__( 'Please select a valid value.', 'booking-activities' ),
	'error_template_end_before_begin'   => esc_html__( 'The calendar period cannot end before it started.', 'booking-activities' ),
	'error_day_end_before_begin'		=> esc_html__( 'Day end time must be after day start time.', 'booking-activities' ),
	'error_repeat_period_not_set'		=> esc_html__( 'The repetition period is not set.', 'booking-activities' ),
	'error_repeat_end_before_begin'     => esc_html__( 'The repetition period cannot end before it started.', 'booking-activities' ),
	'error_repeat_start_before_template'=> esc_html__( 'The repetition period should not start before the beginning date of the calendar.', 'booking-activities' ),
	'error_repeat_end_after_template'   => esc_html__( 'The repetition period should not end after the end date of the calendar.', 'booking-activities' ),
	'error_days_sup_to_365'             => esc_html__( 'The number of days should be between 0 and 365.', 'booking-activities' ),
	'error_hours_sup_to_23'             => esc_html__( 'The number of hours should be between 0 and 23.', 'booking-activities' ),
	'error_minutes_sup_to_59'           => esc_html__( 'The number of minutes should be between 0 and 59.', 'booking-activities' ),
	'error_time_format'			        => esc_html__( 'The time format should be HH:mm where "HH" represents hours and "mm" minutes.', 'booking-activities' ),
	'error_activity_duration_is_null'	=> esc_html__( 'The activity duration should not be null.', 'booking-activities' ),
	'error_availability_inf_to_0'       => esc_html__( 'The number of available bookings should be higher than or equal to 0.', 'booking-activities' ),
	'error_less_avail_than_bookings'    => esc_html__( "You can't set less available bookings than it has already on one of the occurrence of this event.", 'booking-activities' ),
	'error_booked_events_out_of_period' => esc_html__( 'The repetition period must include all booked occurences.', 'booking-activities' ),
	'error_event_not_btw_from_and_to'   => esc_html__( 'The selected event should be included in the period in which it will be repeated.', 'booking-activities' ),
	'error_freq_not_allowed'            => esc_html__( 'Error: The repetition frequency is not a valid value.', 'booking-activities' ),
	'error_excep_not_btw_from_and_to'   => esc_html__( 'Exception dates should be included in the repetition period.', 'booking-activities' ),
	'error_excep_duplicated'            => esc_html__( 'Exceptions should all have a different date.', 'booking-activities' ),
	'error_set_excep_on_booked_occur'   => esc_html__( 'Warning: this occurence is booked.', 'booking-activities' ),
	'error_select_schedule'				=> esc_html__( "You haven't selected any event. Please select an event.", 'booking-activities' ),
	'error_corrupted_schedule'			=> esc_html__( 'The event you selected is corrupted, please reselect an event and try again.', 'booking-activities' ),
	/* translators: %1$s is the quantity the user want. %2$s is the available quantity. */
	'error_less_avail_than_quantity'	=> esc_html__( 'You want to make %1$s bookings but only %2$s are available on this time slot. Please choose another event or decrease the quantity.', 'booking-activities' ),
	'error_quantity_inf_to_0'			=> esc_html__( 'The amount of desired bookings is less than or equal to 0. Please increase the quantity.', 'booking-activities' ),
	'error_no_templates_for_activity'	=> esc_html__( 'The activity must be bound to at least one calendar.', 'booking-activities' ),
	'error_no_activity_selected'		=> esc_html__( 'Select at least one activity.', 'booking-activities' ),
	'error_select_at_least_two_events'	=> esc_html__( 'You must select at least two events.', 'booking-activities' ),
	'error_missing_title'				=> esc_html__( 'You must type a title.', 'booking-activities' ),

	// ADVICE
	'advice_switch_to_maintenance'      => esc_html__( 'Please consider switching your website to maintenance mode when working on a published calendar.', 'booking-activities' ),
	'advice_booking_refunded'			=> esc_html__( 'Your booking has been successfully refunded.', 'booking-activities' ),
	'advice_refund_request_email_sent'	=> esc_html__( 'Your refund request has been sent. We will contact you soon.', 'booking-activities' ),
	'advice_archive_data'				=> esc_html__( 'The bookings and events data prior to {date} will be saved to a SQL file and deleted from your database. You will be able to restore your data afterwards.', 'booking-activities' ) . '\n\n/!\\ '  . esc_html__( 'We still strongly advise you to backup your database before proceeding.', 'booking-activities' ) . '\n\n' . esc_html__( 'Do you want to archive your data now?', 'booking-activities' ),
	'advice_archive_data_override'		=> esc_html__( 'An archive already exists for this date. The existing backup files will be removed and replaced with the new ones.', 'booking-activities' ) . '\n\n' . esc_html__( 'Do you want to archive your data now?', 'booking-activities' ),
	'advice_archive_restore_data'		=> esc_html__( 'The data contained in {filename} will be added to your database. You should do this only once.', 'booking-activities' ) . '\n\n' . esc_html__( 'Do you want to restore these data now?', 'booking-activities' ),
	'advice_archive_delete_file'		=> esc_html__( 'The backup file {filename} will be permanently deleted. This action cannot be undone.', 'booking-activities' ) . '\n\n' . esc_html__( 'Do you want to permanently delete this file?', 'booking-activities' ),
	

	// PARTICLES
	/* translators: In the context, 'Wednesday, March 2, 2016 9:30 AM to Thursday, March 3, 2016 1:30 PM' */
	'to_date'							=> esc_html_x( 'to', 'between two dates', 'booking-activities' ),
	/* translators: In the context, 'Wednesday, March 2, 2016 9:30 AM to 1:30 PM' */
	'to_hour'							=> esc_html_x( 'to', 'between two hours', 'booking-activities' ),
	'removed'							=> esc_html__( 'Removed', 'booking-activities' ),
	'cancelled'							=> esc_html__( 'Cancelled', 'booking-activities' ),
	'booked'							=> esc_html__( 'Booked', 'booking-activities' ),
	'pending_payment'					=> esc_html__( 'Pending payment', 'booking-activities' ),
	'loading'							=> esc_html__( 'Loading', 'booking-activities' ),
	'cancel'							=> esc_html_x( 'Cancel', 'action to cancel a booking', 'booking-activities' ),
	'refund'							=> esc_html_x( 'Refund', 'action to refund a booking', 'booking-activities' ),
	'refunded'							=> esc_html__( 'Refunded', 'booking-activities' ),
	'refund_requested'					=> esc_html__( 'Refund requested', 'booking-activities' ),
	'coupon_code'						=> esc_html__( 'Coupon code', 'booking-activities' ),
	'avail'								=> apply_filters( 'bookacti_translate_text', $messages[ 'avail' ][ 'value' ] ),
	'avails'							=> apply_filters( 'bookacti_translate_text', $messages[ 'avails' ][ 'value' ] ),
	/* translators: This particle is used right after the quantity of bookings. Put the singular here. E.g.: 1 booking . */
	'booking'							=> esc_html__( 'booking', 'booking-activities' ),
	/* translators: This particle is used right after the quantity of bookings. Put the plural here. E.g.: 2 bookings . . */
	'bookings'							=> esc_html__( 'bookings', 'booking-activities' ),
	'edit_id'							=> esc_html_x( 'id', 'An id is a unique identification number', 'booking-activities' ),
	'create_new'						=> esc_html__( 'Create new', 'booking-activities' ),

	// OTHERS
	'ask_for_reasons'					=> esc_html__( 'Tell us why? (Details, reasons, comments...)', 'booking-activities' ),
	'one_person_per_booking'			=> esc_html__( 'for one person', 'booking-activities' ),
	/* translators: %1$s is the number of people who can enjoy the activity with one booking */
	'n_people_per_booking'				=> esc_html__( 'for %1$s people', 'booking-activities' ),
	'product_price'						=> esc_html__( 'Product price', 'booking-activities' ),
	'create_first_calendar'				=> esc_html__( 'Create your first calendar', 'booking-activities' ),
	'create_first_activity'				=> esc_html__( 'Create your first activity', 'booking-activities' ),
	/* translators: When the user is asked whether to pick the single event or the whole group it is part of */
	'single_event'						=> esc_html__( 'Single event', 'booking-activities' ),
	'selected_event'					=> apply_filters( 'bookacti_translate_text', $messages[ 'selected_event' ][ 'value' ] ),
	'selected_events'					=> apply_filters( 'bookacti_translate_text', $messages[ 'selected_events' ][ 'value' ] ),


	// VARIABLES
	'ajaxurl'							=> admin_url( 'admin-ajax.php' ),
	
	'is_qtranslate'						=> bookacti_get_translation_plugin() === 'qtranslate',
	'fullcalendar_locale'				=> bookacti_convert_wp_locale_to_fc_locale( bookacti_get_current_lang_code( true ) ),
	'current_lang_code'					=> bookacti_get_current_lang_code(),
	'current_locale'					=> bookacti_get_current_lang_code( true ),
	
	'available_booking_methods'			=> array_keys( bookacti_get_available_booking_methods() ),
	
	'event_tiny_height'					=> apply_filters( 'bookacti_event_tiny_height', 30 ),
	'event_small_height'				=> apply_filters( 'bookacti_event_small_height', 75 ),
	'event_narrow_width'				=> apply_filters( 'bookacti_event_narrow_width', 70 ),
	'event_wide_width'					=> apply_filters( 'bookacti_event_wide_width', 250 ),

	'started_events_bookable'			=> bookacti_get_setting_value( 'bookacti_general_settings',	'started_events_bookable' ) ? true : false,
	'started_groups_bookable'			=> bookacti_get_setting_value( 'bookacti_general_settings',	'started_groups_bookable' ) ? true : false,
	'event_load_interval'				=> bookacti_get_setting_value( 'bookacti_general_settings', 'event_load_interval' ),
	'default_view_threshold'			=> bookacti_get_setting_value( 'bookacti_general_settings', 'default_calendar_view_threshold' ),
	
	'date_format'						=> apply_filters( 'bookacti_translate_text', $messages[ 'date_format_short' ][ 'value' ] ),
	'date_format_long'					=> apply_filters( 'bookacti_translate_text', $messages[ 'date_format_long' ][ 'value' ] ),
	'time_format'						=> apply_filters( 'bookacti_translate_text', $messages[ 'time_format' ][ 'value' ] ),
	'dates_separator'					=> apply_filters( 'bookacti_translate_text', $messages[ 'dates_separator' ][ 'value' ] ),
	'date_time_separator'				=> apply_filters( 'bookacti_translate_text', $messages[ 'date_time_separator' ][ 'value' ] ),

	'plugin_path'						=> plugins_url() . '/' . BOOKACTI_PLUGIN_NAME,
	'site_url'							=> get_site_url(),
	'admin_url'							=> admin_url(),
	'current_user_id'					=> get_current_user_id(),
	'is_admin'							=> is_admin(),
	'current_time'						=> $current_datetime_object->format( 'Y-m-d H:i:s' ),
	
	'calendar_localization'				=> bookacti_get_setting_value( 'bookacti_messages_settings', 'calendar_localization' ),
	'wp_time_format'					=> get_option( 'time_format' ),
	'wp_start_of_week'					=> get_option( 'start_of_week' ),

	
	// NONCES
	'nonce_selected_template_filter'	=> wp_create_nonce( 'bookacti_selected_template_filter' ),
	'nonce_get_booking_rows'			=> wp_create_nonce( 'bookacti_get_booking_rows' ),
	'nonce_get_refund_actions_html'		=> wp_create_nonce( 'bookacti_get_refund_actions_html' ),
	'nonce_get_booking_data'			=> wp_create_nonce( 'bookacti_get_booking_data' ),

	'nonce_cancel_booking'				=> wp_create_nonce( 'bookacti_cancel_booking' ),
	'nonce_reschedule_booking'			=> wp_create_nonce( 'bookacti_reschedule_booking' ),

	'nonce_fetch_template_events'		=> wp_create_nonce( 'bookacti_fetch_template_events' ),
	'nonce_get_exceptions'				=> wp_create_nonce( 'bookacti_get_exceptions' ),

	'nonce_insert_event'				=> wp_create_nonce( 'bookacti_insert_event' ),
	'nonce_move_or_resize_event'		=> wp_create_nonce( 'bookacti_move_or_resize_event' ),
	'nonce_delete_event'				=> wp_create_nonce( 'bookacti_delete_event' ),
	'nonce_delete_event_forced'			=> wp_create_nonce( 'bookacti_delete_event_forced' ),
	'nonce_unbind_occurences'			=> wp_create_nonce( 'bookacti_unbind_occurences' ),
	
	'nonce_delete_group_of_events'		=> wp_create_nonce( 'bookacti_delete_group_of_events' ),
	'nonce_delete_group_category'		=> wp_create_nonce( 'bookacti_delete_group_category' ),
	
	'nonce_switch_template'				=> wp_create_nonce( 'bookacti_switch_template' ),
	'nonce_deactivate_template'			=> wp_create_nonce( 'bookacti_deactivate_template' ),

	'nonce_get_activities_by_template'	=> wp_create_nonce( 'bookacti_get_activities_by_template' ),
	'nonce_import_activity'				=> wp_create_nonce( 'bookacti_import_activity' ),
	'nonce_deactivate_activity'			=> wp_create_nonce( 'bookacti_deactivate_activity' ),
	
	'nonce_query_select2_options'		=> wp_create_nonce( 'bookacti_query_select2_options' ),

	'nonce_dismiss_5stars_rating_notice'=> wp_create_nonce( 'bookacti_dismiss_5stars_rating_notice' ),
), $messages );