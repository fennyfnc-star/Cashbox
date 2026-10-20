<?php

// Used for prize search dropdown
add_action( 'elementor/query/prize_search_filter', function( $query ) {

    // 1️⃣ Always filter live Prize Draws
    $tax_query = [
        [
            'taxonomy' => 'visibility',
            'field'    => 'slug',
            'terms'    => 'live',
        ]
    ];

    // 2️⃣ Filter by most_popular if present
    if ( isset($_GET['most_popular']) && ! empty($_GET['most_popular']) ) {
        $tax_query[] = [
            'taxonomy' => 'most_popular',
            'field'    => 'slug',
            'terms'    => sanitize_text_field($_GET['most_popular']),
        ];
    }

    // 3️⃣ Set the relation
    if ( count($tax_query) > 1 ) {
        $tax_query['relation'] = 'AND';
    }

    // 4️⃣ Apply tax_query
    $query->set( 'tax_query', $tax_query );

    // 5️⃣ Search term from AJAX (optional)
    if ( isset( $_GET['search_prize'] ) && ! empty( $_GET['search_prize'] ) ) {
        $query->set( 's', sanitize_text_field( $_GET['search_prize'] ) );
    }

});



// Shortcode: [prize_count] — reads ?most_popular=term from URL
add_shortcode( 'prize_count', function() {

    // 1️⃣ Base query args
    $args = [
        'post_type'      => 'prize_draw',
        'posts_per_page' => -1, // get all posts to count
        'fields'         => 'ids', // faster
    ];

    // 2️⃣ Create a temporary WP_Query object to pass to the callback
    $temp_query = new WP_Query();
    $temp_query->query_vars = $args;

    // 3️⃣ Apply Elementor prize_search_filter callbacks
    if ( has_action( 'elementor/query/prize_search_filter' ) ) {
        $callbacks = $GLOBALS['wp_filter']['elementor/query/prize_search_filter']->callbacks ?? [];
        if ( $callbacks ) {
            foreach ( $callbacks as $priority => $functions ) {
                foreach ( $functions as $function ) {
                    $callback = $function['function'];
                    if ( is_callable( $callback ) ) {
                        call_user_func( $callback, $temp_query );
                    }
                }
            }
        }
    }

    // 4️⃣ Run the query with the modified args
    $count_query = new WP_Query( $temp_query->query_vars );
    $count = $count_query->found_posts;

    return '<span class="prize-count">Showing <strong>' . esc_html( $count ) . '</strong> results</span>';
});


/**
 * Shortcode: [prize_first_term]
 * Outputs the first prize_categories term of the current post in a Loop Grid
 */
add_shortcode( 'prize_first_term', function() {

    global $post;

    if ( ! $post ) {
        return '';
    }

    // Get terms for the current post
    $terms = get_the_terms( $post->ID, 'prize_category' );

    if ( ! $terms || is_wp_error( $terms ) ) {
        return '';
    }

    // Take only the first term
    $first_term = esc_html( $terms[0]->name );

    // Output as a span with a class for styling
    return '<span class="prize-category">' . $first_term . '</span>';

});


function cashbox_can_manage_prize_draws() {
    if (!is_user_logged_in()) {
        return false;
    }

    $user = wp_get_current_user();

    return (bool) array_intersect(['administrator', 'editor'], (array) $user->roles);
}

function enqueue_react_app() {
    // Only load on your specific page
    if (is_page('prize-draw-management')) {
        if (!cashbox_can_manage_prize_draws()) return;
        $build_path = get_stylesheet_directory() . '/react/build';
        $manifest_path = $build_path . '/.vite/manifest.json';

        if (!file_exists($manifest_path)) return;

        $manifest = json_decode(file_get_contents($manifest_path), true);
        $entry = $manifest['index.html'] ?? [];

        // Enqueue CSS
        foreach ($entry['css'] ?? [] as $index => $css_file) {
            wp_enqueue_style(
                'react-app-css-' . $index,
                get_stylesheet_directory_uri() . '/react/build/' . $css_file,
                [],
                null
            );
        }

        // Enqueue JS
        if (!empty($entry['file'])) {
            wp_enqueue_script(
                'react-app-js',
                get_stylesheet_directory_uri() . '/react/build/' . $entry['file'],
                [],
                null,
                true
            );
            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'react-app-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }

                return $tag;
            }, 10, 2);

            wp_add_inline_script('react-app-js', 'window.cashboxAuth = ' . wp_json_encode([
                'nonce' => wp_create_nonce('wp_rest'),
                'userId' => get_current_user_id(),
                'graphqlUrl' => home_url('/graphql'),
                'restUrl' => rest_url(),
            ]) . ';', 'before');
        }
    }
}
add_action('wp_enqueue_scripts', 'enqueue_react_app');


use GraphQLRelay\Relay;

add_action('graphql_register_types', function() {
    register_graphql_mutation('updatePrizeItemStatus', [
        'inputFields' => [
            'id' => [
                'type' => 'ID',
                'description' => 'Prize Draw ID (Relay ID)',
            ],
            'itemStatus' => [
                'type' => 'Boolean',
                'description' => 'New status of the prize item',
            ],
        ],
        'outputFields' => [
            'prizeDraw' => [
                'type' => 'PrizeDraw',
                'resolve' => function($payload) {
                    return $payload['post']; // now this is a WP_Post object
                }
            ]
        ],		
		'mutateAndGetPayload' => function($input) {
			$relay_id = $input['id']; // e.g., "cG9zdDo4ODE2"
			$decoded = Relay::fromGlobalId($relay_id); // ['type' => 'PrizeDraw', 'id' => '8816']
			$post_id = $decoded['id'];

            if (
                !cashbox_can_manage_prize_draws() ||
                !current_user_can('edit_post', (int) $post_id)
            ) {
                throw new \GraphQL\Error\UserError('Not authorized to edit this prize draw.');
            }

			$is_live = (bool) $input['itemStatus'];
			$post_status = $is_live ? 'publish' : 'private';

			// Update the ACF field
			update_field('field_696586af9585a', $is_live, $post_id);

            $visibility_result = $is_live
                ? wp_set_object_terms($post_id, ['live'], 'visibility', true)
                : wp_remove_object_terms($post_id, 'live', 'visibility');
            if (is_wp_error($visibility_result)) {
                throw new \GraphQL\Error\UserError($visibility_result->get_error_message());
            }

			// Make sure the post is published
			$post = get_post($post_id);
			if ($post->post_status !== $post_status) {
				$updated_post = wp_update_post([
					'ID' => $post_id,
					'post_status' => $post_status,
				], true);
                if (is_wp_error($updated_post)) {
                    throw new \GraphQL\Error\UserError($updated_post->get_error_message());
                }
			}

			// Return the full WP_Post object for GraphQL
			$post = get_post($post_id);

			return ['post' => $post];
		}
    ]);
});

// ==== WPGRAPHQL
add_action('graphql_register_types', function() {

    register_graphql_input_type('PrizeItemsManagementInput', [
        'fields' => [
            'itemStatus' => [
                'type' => 'Boolean'
            ],
            'itemDescription' => [
                'type' => 'String'
            ],
            'price' => [
                'type' => 'Float'
            ],
            'tickets' => [
                'type' => 'Int'
            ],
        ],
    ]);

});

add_action('graphql_register_types', function() {

    register_graphql_field('CreatePrizeDrawInput', 'prizeItemsManagement', [
        'type' => 'PrizeItemsManagementInput',
        'description' => 'ACF fields for prize draw item management',
    ]);

});

add_action(
    'graphql_post_object_mutation_update_additional_data',
    function (
        $post_id,
        $input,
        $post_type_object,
        $mutation_name,
        $context,
        $info,
        $default_post_status,
        $intended_post_status
    ) {

        // Only run for Prize Draw mutations
        if ( $post_type_object->name !== 'prize_draw' ) {
            return;
        }

        if ( empty( $input['prizeItemsManagement'] ) ) {
            return;
        }

        $acf = $input['prizeItemsManagement'];

        // IMPORTANT: Use ACF FIELD KEYS
        if ( isset( $acf['itemStatus'] ) ) {
            update_field( 'field_696586af9585a', $acf['itemStatus'], $post_id );
        }

        if ( isset( $acf['itemDescription'] ) ) {
            update_field( 'field_69606bfd332ff', $acf['itemDescription'], $post_id );
        }

        if ( isset( $acf['price'] ) ) {
            update_field( 'field_69606c1333300', $acf['price'], $post_id );
        }

        if ( isset( $acf['tickets'] ) ) {
            update_field( 'field_69606c2233301', $acf['tickets'], $post_id );
        }

    },
    10,
    8
);


// Adding custom column for prize draw items
add_filter('manage_prize_draw_posts_columns', function($columns) {

    $new_columns = [];

    foreach ($columns as $key => $value) {
        $new_columns[$key] = $value;

        // Add after title
        if ($key === 'title') {
            $new_columns['item_number'] = 'Item Number';
        }
    }

    return $new_columns;
});

add_action('manage_prize_draw_posts_custom_column', function($column, $post_id) {

    if ($column === 'item_number') {

        $value = get_field('item_number', $post_id);

        if ($value) {
            echo esc_html($value);
        } else {
            echo '—';
        }
    }

}, 10, 2);
