<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'finaco' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         ' ?AiIV-Z8ns;,/>)MLzD7(0]qW>KZ+]q`/YGd(%tbSHt~i52HIny1K4FI(f)m8;?' );
define( 'SECURE_AUTH_KEY',  'wvFyIo7@1k9,Gwrxcss08YAJe.L-[xhQH.c_]IM![U(e7y]R*mW+Inp?9/ZN$k$i' );
define( 'LOGGED_IN_KEY',    'GX$G-X+n.7h+DF?AXO)7@efxA/-X^n|V~PX*1~o]n^+L{SZ=X^/;O/A&3b&%;~eQ' );
define( 'NONCE_KEY',        'la2_;coGqePsMa8@1wGgl46YAm2&S)v0wp17*`px.4mrBwVvmH0-00~pa.Gwy/vx' );
define( 'AUTH_SALT',        'WR(OkOK^`Cat;xe$k_]+_aYBi)v51>i~-owCCG8!T7jnW^&R|r*t3_!xp*XgFbD+' );
define( 'SECURE_AUTH_SALT', '4n~(j>ZE!r3N%enn@V0;rzg$/iG-qy@aAh-#Pm7Vz}6F0>hGRXsWM~q5*OjQ6lVh' );
define( 'LOGGED_IN_SALT',   'OLv:OCt<=%VJL2=d:tp||&%.:;OkZPUK{I`+NZW(,cT(^o7?hE)jldwR2Oo{.K3s' );
define( 'NONCE_SALT',       'ybMrMWQD*R;+4*|kb801-K|XnB*u%jjd(Px7Z8J-</%HE3=#RP;kAEfoG^^AUls8' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
