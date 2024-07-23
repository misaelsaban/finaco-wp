<?php
/**
 * Storefront engine room
 *
 * @package storefront
 */

 define('RUTA_API','https://finaco-api.kloudlab.ar/api/v1');
 //define('RUTA_API','http://local.finacoapi.com/api/v1');
 

/**
 * Assign the Storefront version to a var
 */
$theme              = wp_get_theme( 'storefront' );
$storefront_version = $theme['Version'];

/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width ) ) {
	$content_width = 980; /* pixels */
}

$storefront = (object) array(
	'version'    => $storefront_version,

	/**
	 * Initialize all the things.
	 */
	'main'       => require 'inc/class-storefront.php',
	'customizer' => require 'inc/customizer/class-storefront-customizer.php',
);

require 'inc/storefront-functions.php';
require 'inc/storefront-template-hooks.php';
require 'inc/storefront-template-functions.php';
require 'inc/wordpress-shims.php';

if ( class_exists( 'Jetpack' ) ) {
	$storefront->jetpack = require 'inc/jetpack/class-storefront-jetpack.php';
}

if ( storefront_is_woocommerce_activated() ) {
	$storefront->woocommerce            = require 'inc/woocommerce/class-storefront-woocommerce.php';
	$storefront->woocommerce_customizer = require 'inc/woocommerce/class-storefront-woocommerce-customizer.php';

	require 'inc/woocommerce/class-storefront-woocommerce-adjacent-products.php';

	require 'inc/woocommerce/storefront-woocommerce-template-hooks.php';
	require 'inc/woocommerce/storefront-woocommerce-template-functions.php';
	require 'inc/woocommerce/storefront-woocommerce-functions.php';
}

if ( is_admin() ) {
	$storefront->admin = require 'inc/admin/class-storefront-admin.php';

	require 'inc/admin/class-storefront-plugin-install.php';
}

/**
 * NUX
 * Only load if wp version is 4.7.3 or above because of this issue;
 * https://core.trac.wordpress.org/ticket/39610?cversion=1&cnum_hist=2
 */
if ( version_compare( get_bloginfo( 'version' ), '4.7.3', '>=' ) && ( is_admin() || is_customize_preview() ) ) {
	require 'inc/nux/class-storefront-nux-admin.php';
	require 'inc/nux/class-storefront-nux-guided-tour.php';
	require 'inc/nux/class-storefront-nux-starter-content.php';
}

/**
 * Note: Do not add any custom code here. Please use a custom plugin so that your customizations aren't lost during updates.
 * https://github.com/woocommerce/theme-customisations
 */



 function restrict_cod_payment_gateway($available_gateways) {
    // Check if the current user is logged in
    if (is_user_logged_in()) {
        // Get the current user's data
        $current_user = wp_get_current_user();
        
        // Define roles that are allowed to use COD
        $allowed_roles = array('administrator', 'staff');

        // Check if the user has any of the allowed roles
        $has_allowed_role = false;
        foreach ($allowed_roles as $role) {
            if (in_array($role, $current_user->roles)) {
                $has_allowed_role = true;
                break;
            }
        }

        // If the user does not have an allowed role, remove COD
        if (!$has_allowed_role) {
            unset($available_gateways['cod']);
        }
    } else {
        // If the user is not logged in, remove COD
        unset($available_gateways['cod']);
    }

    return $available_gateways;
}
add_filter('woocommerce_available_payment_gateways', 'restrict_cod_payment_gateway');


// Autocompletamos Las Ordenes que lleguen por COD
add_action('woocommerce_thankyou_cod', 'auto_complete_cod_orders');

function auto_complete_cod_orders($order_id) {
    if (!$order_id) {
        return;
    }

    // Get the order
    $order = wc_get_order($order_id);

    // Ensure the order exists and is paid with COD
    if ($order && $order->get_payment_method() === 'cod') {
        // Change the order status to completed
        $order->update_status('completed');
	}
}







// Enviamos los datos a la API
 add_action('woocommerce_order_status_completed', 'send_custom_webhook_on_order_completion', 10, 1);

 function send_custom_webhook_on_order_completion($order_id) {
	 $order = wc_get_order($order_id);
 
	 if (!!$order) {
		 $webhook_url = RUTA_API.'/compras';
		 $data = $order->get_data();
		 $items = $order->get_items();
		 $meta_data = [];
 
		 foreach( $items as $item_id => $item ){
			 $object = new stdClass;
			 $object->product = $item->get_product_id();
			 $object->quantity = $item->get_quantity();
			 $object->zone = $item->get_meta('zone');
			 $object->row = $item->get_meta('row');
			 $object->seat = $item->get_meta('seat');
			 $object->days = $item->get_meta('days');
			 array_push($meta_data, $object);
		 }
		 
		 $payload = array(
			 'order_id' => $order->get_id(),
			 'total' => $order->get_total(),
			 'status' => $data['status'],
			 'customer_name' => $order->get_billing_first_name(),
			 'customer_lastname' => $order->get_billing_last_name(),
			 'customer_email' => $order->get_billing_email(),
			 'customer_dni' => $order->get_meta( '_billing_dni'),
			 'customer_provincia' => $order->get_meta('billing_state'),
			 'customer_ciudad' => $order->get_meta('billing_city'),
			 'meta_data' => $meta_data,
		 );
 
		 $response = wp_remote_post($webhook_url, array(
			 'method' => 'POST',
			 'headers' => array(
				 'Content-Type' => 'application/json',
				 'Authorization' => 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJJc3N1ZXIgb2YgdGhlIEpXVCIsImF1ZCI6IkF1ZGllbmNlIHRoYXQgdGhlIEpXVCIsInN1YiI6IlN1YmplY3Qgb2YgdGhlIEpXVCIsImlhdCI6MTcyMDc5OTcwMiwiZXhwIjo0MzEyNzk5NzAyLCJpZF91c2VyIjoiMSIsImVtYWlsIjoibWlzYUBtaXNhLmNvbSJ9.batG7RymfWx3Kljd247f5_Aju_OwrEEYiStej6qi9ds'
			 ),
			 'body' => json_encode($payload),
		 ));
 
		 $response_body = wp_remote_retrieve_body($response);
		 $formatted_response = json_decode($response_body);
		 update_post_meta($order_id, 'response', $formatted_response);

		 //wp_redirect(home_url('/thankyou'));
		 // Uncomment the following lines for debugging purposes
		 // if (is_wp_error($response)) {
		 //     $error_message = $response->get_error_message();
		 //     error_log("Failed to send webhook: $error_message");
		 // } else {
		 //     $response_body = wp_remote_retrieve_body($response);
		 //     error_log("Webhook response: $response_body");
		 // }
	 }    
 }
 
 // Add custom meta box to display API response data on order edit screen
 add_action('woocommerce_admin_order_data_after_billing_address', 'display_api_response_data_on_order_edit');
 function display_api_response_data_on_order_edit($order){
	 // Get API response data from order meta
	 
	 $api_response = get_post_meta($order->get_id(), 'response');
 
	 // Output the API response data
	 if (!empty($api_response)) {
		 echo '<div class="order_data_column">';
		 echo '<h4>API Response Data</h4>';
		 echo '<p><strong>Response:</strong> ' . esc_html(json_encode($api_response[0])) . '</p>';
		 echo '</div>';
	 }
 }

 function custom_redirect_after_purchase($order_id) {

    $order = wc_get_order($order_id);

	$thankyou_page_url = site_url('/thankyou');

	$order->update_status('completed');

	wp_redirect($thankyou_page_url);
	exit;

}
add_action('woocommerce_thankyou', 'custom_redirect_after_purchase');