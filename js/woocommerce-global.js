$j( document ).ready( function() {
	// Update booking row after coupon refund
	$j( 'body' ).on( 'bookacti_booking_refunded', function( e, booking_id, booking_type, refund_action, refund_message, refund_data, response ){
		if( refund_action === 'auto' ) {
			// Set a message to feedback refunds
			refund_data.message += bookacti_localized.advice_booking_refunded;
		
		} else if( refund_action === 'coupon' ) {
			
			// Set a message to feedback refunds
			refund_data.message += bookacti_localized.advice_booking_refunded;
			refund_data.message += '<br/>' + bookacti_localized.advice_coupon_created.replace( '%1$s', '<strong>' + response.coupon_amount + '</strong>' );
			refund_data.message += '<br/>' + bookacti_localized.advice_coupon_code.replace( '%1$s', '<strong>' + response.coupon_code + '</strong>' );
			
			// Update booking row on frontend only
			if( ! bookacti_localized.is_admin ) {
				
				if( booking_type === 'single' ) {
					var row = $j( '.bookacti-booking-actions[data-booking-id="' + booking_id + '"]' ).parents( 'tr' );
				} else {
					var row = $j( '.bookacti-booking-group-actions[data-booking-group-id="' + booking_id + '"]' ).parents( 'tr' );
				}
				
				// Add coupon code on order details
				if( row.length && response.coupon_code ) {

					var meta_list = row.find( 'ul.wc-item-meta' );
					if( meta_list.length ) {
						if( meta_list.find( '.wc-item-meta-value.wc-item-meta-bookacti_refund_coupon' ).length ) {
							meta_list.find( '.wc-item-meta-value.wc-item-meta-bookacti_refund_coupon' ).html( response.coupon_code );
						} else {
							var coupon_code_meta = 
								'<li>'
							+		'<strong class="wc-item-meta-label wc-item-meta-bookacti_refund_coupon">' + bookacti_localized.coupon_code + ':</strong>'
							+		'<span class="wc-item-meta-value wc-item-meta-bookacti_refund_coupon" >' + response.coupon_code + '</span>'
							+	'</li>';
							meta_list.append( coupon_code_meta );
						}
					}

					// WOOCOMMERCE 3.0.0 backward compatibility
					if( row.find( '.variation' ).length ) {
						if( $j( 'dd.variation-bookacti_refund_coupon' ).length ) {
							$j( 'dd.variation-bookacti_refund_coupon p' ).html( response.coupon_code );
						} else {
							var coupon_code_label = $j( '<dt />', {
								'class': 'variation-bookacti_refund_coupon',
								'text': bookacti_localized.coupon_code + ':'
							});
							var coupon_code_value = $j( '<dd />', {
								'class': 'variation-bookacti_refund_coupon'
							}).append( $j( '<p />', { 'text': response.coupon_code } ) );
							row.find( '.variation' ).append( coupon_code_label );
							row.find( '.variation' ).append( coupon_code_value );
						}
					}
				}
			}
			
		}
	});
	
	
	/**
	 * Init WC actions to perfoms when the user picks an event
	 * @since 1.7.0
	 */
	$j( 'body' ).on( 'bookacti_events_picked', '.bookacti-booking-system', function( e, group_id, event ){
		// Retrieve the info required to show the desired events
		var booking_system		= $j( this );
		var booking_system_id	= booking_system.attr( 'id' );
		var attributes			= bookacti.booking_system[ booking_system_id ];
		
		if( group_id === 'single' && attributes[ 'when_perform_form_action' ] === 'on_event_click' && attributes[ 'form_action' ] === 'redirect_to_product_page' ) {
			bookacti_redirect_to_activity_product_page( booking_system, event );
		}
	});
	
	
	/**
	 * Init WC actions to perfoms when the user picks a group of events
	 * @since 1.7.0
	 */
	$j( 'body' ).on( 'bookacti_group_of_events_chosen', '.bookacti-booking-system', function( e, group_id, event ) {
		// Retrieve the info required to show the desired events
		var booking_system		= $j( this );
		var booking_system_id	= booking_system.attr( 'id' );
		var attributes			= bookacti.booking_system[ booking_system_id ];
		
		if( attributes[ 'when_perform_form_action' ] === 'on_event_click' && attributes[ 'form_action' ] === 'redirect_to_product_page' ) {
			bookacti_redirect_to_group_category_product_page( booking_system, group_id );
		}
	});
});




// REDIRECT

/**
 * Redirect to activity product page
 * @since 1.7.0
 * @param {dom_element} booking_system
 * @param {object} event
 */
function bookacti_redirect_to_activity_product_page( booking_system, event ) {
	var booking_system_id	= booking_system.attr( 'id' );
	var attributes			= bookacti.booking_system[ booking_system_id ];
	
	if( typeof attributes[ 'events_data' ][ event.id ] === 'undefined' ) { return; }
	
	var activity_id = attributes[ 'events_data' ][ event.id ][ 'activity_id' ];
	if( typeof attributes[ 'product_by_activity' ][ activity_id ] === 'undefined' ) { return; }
	
	var product_id = attributes[ 'product_by_activity' ][ activity_id ];
	if( typeof attributes[ 'products_page_url' ][ product_id ] === 'undefined' ) { return; }

	var redirect_url = attributes[ 'products_page_url' ][ product_id ];
	
	bookacti_redirect_booking_system_to_url( booking_system, redirect_url );
}


/**
 * Redirect to group category product page
 * @since 1.7.0
 * @param {dom_element} booking_system
 * @param {int} group_id
 */
function bookacti_redirect_to_group_category_product_page( booking_system, group_id ) {
	var booking_system_id	= booking_system.attr( 'id' );
	var attributes			= bookacti.booking_system[ booking_system_id ];
	
	if( typeof attributes[ 'groups_data' ][ group_id ] === 'undefined' ) { return; }
	
	var category_id = attributes[ 'groups_data' ][ group_id ][ 'category_id' ];
	if( typeof attributes[ 'product_by_group_category' ][ category_id ] === 'undefined' ) { return; }
	
	var product_id = attributes[ 'product_by_group_category' ][ category_id ];
	if( typeof attributes[ 'products_page_url' ][ product_id ] === 'undefined' ) { return; }
	
	var redirect_url = attributes[ 'products_page_url' ][ product_id ];
	
	bookacti_redirect_booking_system_to_url( booking_system, redirect_url );
}