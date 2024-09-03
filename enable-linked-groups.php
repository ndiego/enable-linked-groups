<?php
/**
 * Plugin Name:         Enable Linked Groups
 * Plugin URI:          https://www.nickdiego.com/
 * Description:         Easily add links to Group blocks.
 * Version:             0.1.0
 * Requires at least:   6.6
 * Requires PHP:        7.4
 * Author:              Nick Diego
 * Author URI:          https://www.nickdiego.com
 * License:             GPLv2
 * License URI:         https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain:         enable-linked-groups
 * Domain Path:         /languages
 *
 * @package enable-linked-groups
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue Editor scripts and styles.
 * 
 * @since 0.1.0
 */
function enable_linked_groups_enqueue_block_editor_assets() {
	$asset_file  = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_script(
		'enable-linked-groups-editor-scripts',
		plugin_dir_url( __FILE__ ) . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version']
	);

	wp_set_script_translations(
		'enable-linked-groups-editor-scripts',
		'enable-linked-groups',
		plugin_dir_path( __FILE__ ) . 'languages'
	);

	wp_enqueue_style(
		'enable-linked-groups-editor-styles',
		plugin_dir_url( __FILE__ ) . 'build/editor.css'
	);
}
add_action( 'enqueue_block_editor_assets', 'enable_linked_groups_enqueue_block_editor_assets' );

/**
 * Enqueue block styles 
 * (Applies to both frontend and Editor)
 * 
 * @since 0.1.0
 */
function enable_linked_groups_block_styles() {
	wp_enqueue_block_style(
		'core/group',
		array(
			'handle' => 'enable-linked-groups-block-styles',
			'src'    => plugin_dir_url( __FILE__ ) . 'build/style.css',
			'ver'    => wp_get_theme()->get( 'Version' ),
			'path'   => plugin_dir_path( __FILE__ ) . 'build/style.css',
		)
	);
}
add_action( 'init', 'enable_linked_groups_block_styles' );

/**
 * Render the linked group block on the frontend.
 *
 * @since 0.1.0
 *
 * @param string $block_content The block content about to be appended.
 * @param array  $block         The full block, including name and attributes.
 * @return string Modified block content.
 */
function enable_linked_groups_render_block_button( $block_content, $block ) {
	if ( ! isset( $block['attrs']['href'] ) && ! isset( $block['attrs']['linkDestination'] ) ) {
		return $block_content;
	}

	$href             = $block['attrs']['href'] ?? '';
	$link_destination = $block['attrs']['linkDestination'] ?? '';
	$link_target      = $block['attrs']['linkTarget'] ?? '_self';
	$link_rel         = '_blank' === $link_target ? 'noopener noreferrer' : 'follow';

	$link = '';

	if ( 'custom' === $link_destination && $href ) {
		$link = $href;
	} elseif ( 'post' === $link_destination ) {
		$link = get_permalink();
	}

	if ( ! $link ) {
		return $block_content;
	}

	// Add the is-linked class to the group block.
	$p = new WP_HTML_Tag_Processor( $block_content );
	if ( $p->next_tag() ) {
		$p->add_class( 'is-linked' );
	}
	$block_content = $p->get_updated_html();

	$link_markup = sprintf(
		'<a class="wp-block-group__link" href="%1$s" target="%2$s" rel="%3$s" aria-hidden="true" tabindex="-1">&nbsp;</a>',
		esc_url( $link ),
		esc_attr( $link_target ),
		esc_attr( $link_rel )
	);

	// Insert the link markup after the opening tag.
	$block_content = preg_replace(
		'/^\s*<(\w+)([^>]*)>/m',
		'<$1$2>' . $link_markup,
		$block_content,
		1
	);

	return $block_content;
}
add_filter( 'render_block_core/group', 'enable_linked_groups_render_block_button', 10, 2 );
