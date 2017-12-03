<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Send one notification per booking to admin and customer when an order contining bookings is made
 *
 * @since 1.2.2
 * @param int $order_id
 * @param string $new_status
 * @param array $args
 */
function bookacti_send_notification_when_order_status_changes( $order_id, $new_status, $args = array() ) {

	if( ! $order_id ) { return; }
	
	// Check if the administrator must be notified
	// If the booking status is pending or booked, notify administrator, unless HE originated this change
	$notify_admin = 0;
	if(	 in_array( $new_status, array( 'booked', 'pending' ) )
	&& ! in_array( $_REQUEST[ 'action' ], array( 'woocommerce_mark_order_status', 'editpost' ) ) ) {
		$admin_notification	= bookacti_get_notification_settings( 'admin_new_booking' );
		$notify_admin		= $admin_notification[ 'active_with_wc' ] ? 1 : 0;
	}
	
	// Check if the customer must be notified
	$customer_notification	= bookacti_get_notification_settings( 'customer_' . $new_status . '_booking' );
	$notify_customer		= $customer_notification[ 'active_with_wc' ] ? 1 : 0;
	
	// If nobody needs to be notified, return
	if( ! $notify_admin && ! $notify_customer ) { return; }
	
	$order = wc_get_order( $order_id );
	if( ! $order ) { return; }

	// Do not send notifications at all for specific order status 
	$order_status = $order->get_status();
	if( in_array( $order_status, array( 'pending', 'on-hold', 'failed' ) ) ) { return; }

	$order_items = $order->get_items();
	if( ! $order_items ) { return; }

	foreach( $order_items as $order_item_id => $item ) {
		
		// Check if the order item is a booking, or skip it
		if( ! $item || ( ! isset( $item[ 'bookacti_booking_id' ] ) && ! isset( $item[ 'bookacti_booking_group_id' ] ) ) ) { continue; }
		
		// If the state hasn't changed, do not send the notifications, unless it is a new order
		$old_status = $args[ 'old_status' ] ? $args[ 'old_status' ] : wc_get_order_item_meta( $order_item_id, 'bookacti_state', true );
		if( $old_status === $new_status && ! $args[ 'is_new_order' ] ) { continue; }
		
		// Get booking ID and booking type ('single' or 'group')
		if( isset( $item[ 'bookacti_booking_id' ] ) ) {
			$booking_id		= $item[ 'bookacti_booking_id' ];
			$booking_type	= 'single';
		}
		else if( isset( $item[ 'bookacti_booking_group_id' ] ) ) {
			$booking_id		= $item[ 'bookacti_booking_group_id' ];
			$booking_type	= 'group';
		}
		
		// Send a booking confirmation to the customer
		if( $notify_customer ) {
			bookacti_send_notification( 'customer_' . $new_status . '_booking', $booking_id, $booking_type );
		}
		
		// Notify administrators that a new booking has been made
		if( $notify_admin ) {
			bookacti_send_notification( 'admin_new_booking', $booking_id, $booking_type );
		}
	}
}
add_action( 'bookacti_order_bookings_state_changed', 'bookacti_send_notification_when_order_status_changes', 10, 3 );


/**
 * Send notifications when a new order is made and becomes "Processing"
 * 
 * @since 1.2.2
 * @param int $order_id
 * @param WC_Order $order
 */
function bookacti_send_notification_when_new_order_is_processing( $order_id, $order ) {
	bookacti_send_notification_when_order_status_changes( $order_id, 'pending', array( 'is_new_order' => true ) );
}
add_action( 'woocommerce_order_status_pending_to_processing', 'bookacti_send_notification_when_new_order_is_processing', 20, 2 );


/**
 * Add a mention to notifications
 * 
 * @since 1.2.2 (was bookacti_add_wc_mention_to_notifications before)
 * @param array $notifications
 * @return array
 */
function bookacti_add_admin_refunded_booking_notification( $notifications ) {
	
	if( ! isset( $notifications[ 'admin_refunded_booking' ] ) ) {
		$notifications[ 'admin_refunded_booking' ] = array(
			'id'			=> 'admin_refunded_booking',
			'active'		=> 1,
			'title'			=> __( 'Customer has been refunded', BOOKACTI_PLUGIN_NAME ),
			'description'	=> __( 'This notification is sent to the administrator when a customer is successfully reimbursed for a booking.', BOOKACTI_PLUGIN_NAME ),
			'email'			=> array(
				'active'	=> 1,
				'to'		=> array( get_bloginfo( 'admin_email' ) ),
				'subject'	=> __( 'Booking refunded', BOOKACTI_PLUGIN_NAME ),
				/* translators: Keep tags as is (this is a tag: {tag}), they will be replaced in code. This is the default email an administrator receive when a booking is refunded */
				'message'	=> __( '<p>A customer has been reimbursed for this booking:</p>
									<p>{booking_list}</p>
									<p>Contact him: {user_firstname} {user_lastname} ({user_email})</p>
									<p><a href="{booking_admin_url}">Click here</a> to edit this booking (ID: {booking_id}).</p>', BOOKACTI_PLUGIN_NAME ) )
		);
	}
	
	return $notifications;
}
add_filter( 'bookacti_notifications_default_settings', 'bookacti_add_admin_refunded_booking_notification', 10, 1 );


/**
 * Add WC-specific default notification settings
 * 
 * @since 1.2.2
 * @param array $notifications
 * @return array
 */
function bookacti_add_wc_default_notification_settings( $notifications ) {
	$add_settings_to = array( 
		'admin_new_booking', 
		'customer_pending_booking', 
		'customer_booked_booking', 
		'customer_cancelled_booking',
		'customer_refunded_booking'
	);
	
	foreach( $add_settings_to as $notification_id ) {
		if( isset( $notifications[ $notification_id ] ) ) {
			if( ! isset( $notifications[ $notification_id ][ 'active_with_wc' ] ) ) {
				$notifications[ $notification_id ][ 'active_with_wc' ] = 0;
			}
		}
	}
	
	return $notifications;
}
add_filter( 'bookacti_notifications_default_settings', 'bookacti_add_wc_default_notification_settings', 20, 1 );


/**
 * Sanitize WC-specific notifications settings
 * 
 * @since 1.2.2
 * @param array $notification
 * @param string $notification_id
 * @return array
 */
function bookacti_sanitize_wc_notification_settings( $notification, $notification_id ) {
	if( isset( $notification[ 'active_with_wc' ] ) ) {
		$notification[ 'active_with_wc' ] = intval( $notification[ 'active_with_wc' ] ) ? 1 : 0;
	}
	return $notification;
}
add_filter( 'bookacti_notification_sanitized_settings', 'bookacti_sanitize_wc_notification_settings', 20, 2 );