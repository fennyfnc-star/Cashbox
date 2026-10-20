<?php
/* Template Name: React Page */

$page_title = get_the_title();
$can_manage_prize_draws = function_exists('cashbox_can_manage_prize_draws')
    && cashbox_can_manage_prize_draws();

$manifest_path = get_stylesheet_directory() . '/react/build/.vite/manifest.json';
$manifest = $can_manage_prize_draws && file_exists($manifest_path)
    ? json_decode(file_get_contents($manifest_path), true)
    : [];

$js_file = $manifest['index.html']['file'] ?? '';
$css_files = $manifest['index.html']['css'] ?? [];

if (!$can_manage_prize_draws) {
    status_header(403);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($page_title); ?></title>
	<link rel="icon" href="<?php echo esc_url(get_site_icon_url(512)); ?>" sizes="512x512">
	<link rel="shortcut icon" href="<?php echo esc_url(get_site_icon_url(512)); ?>">

    <?php foreach ($css_files as $css): ?>
        <link rel="stylesheet" href="<?php echo esc_url(get_stylesheet_directory_uri() . '/react/build/' . $css); ?>">
    <?php endforeach; ?>
</head>
<body>
    <?php if (!$can_manage_prize_draws): ?>
        <main style="max-width: 640px; margin: 10vh auto; padding: 32px; font-family: sans-serif; text-align: center;">
            <h1>Not authorized</h1>
            <p>You must be logged in as an Administrator or Editor to manage prize draws.</p>
        </main>
    <?php else: ?>
        <div id="react-root"></div>

        <?php if ($js_file): ?>
            <script>
                window.cashboxAuth = <?php echo wp_json_encode([
                    'nonce' => wp_create_nonce('wp_rest'),
                    'userId' => get_current_user_id(),
                    'graphqlUrl' => home_url('/graphql'),
                    'restUrl' => rest_url(),
                ]); ?>;
            </script>
            <script type="module" src="<?php echo esc_url(get_stylesheet_directory_uri() . '/react/build/' . $js_file); ?>"></script>
        <?php endif; ?>
    <?php endif; ?>
</body>
</html>
