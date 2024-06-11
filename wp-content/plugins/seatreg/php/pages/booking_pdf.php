<?php
//===========
	/* Page that generates and displays booking PDF */
//===========

if ( !defined( 'ABSPATH' ) ) {
	exit(); 
}

if( empty( $_GET['id'] )  ) {
	exit('Missing data'); 
}

require_once( SEATREG_PLUGIN_FOLDER_DIR . 'php/bookings/SeatregBookingPDF.php' );

$bookings = SeatregBookingRepository::getBookingsById( $_GET['id'] );
$bookingData = SeatregBookingRepository::getDataRelatedToBooking( $_GET['id'] );

if( !$bookings || !SeatregOptionsRepository::shouldAllowPdfGeneration($bookings, $bookingData) ) {
	esc_html_e('Booking not found or feature disabled', 'seatreg');
} else {
	$pdf = new SeatregBookingPDF( $_GET['id'], $bookings, $bookingData );
	$pdf->printPDF();
}