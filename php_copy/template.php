<?php
/* Template Name: React Page */


// Load WordPress environment (already included in page template)
wp_enqueue_media(); // loads media modal JS/CSS
wp_enqueue_script(
    'my-react-app',
    get_template_directory_uri() . '/dist/app.js',
    ['wp-element'],
    false,
    true
);

// Get the page title
$page_title = get_the_title();

// Correct path to manifest
$manifest_path = get_stylesheet_directory() . '/react/build/.vite/manifest.json';
$manifest = file_exists($manifest_path) ? json_decode(file_get_contents($manifest_path), true) : [];

// Get main JS and CSS from the manifest
$js_file = $manifest['index.html']['file'] ?? '';
$css_files = $manifest['index.html']['css'] ?? [];
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
    <div id="react-root"></div>

    <?php if ($js_file): ?>
        <script type="module" src="<?php echo esc_url(get_stylesheet_directory_uri() . '/react/build/' . $js_file); ?>"></script>
    <?php endif; ?>
</body>
</html>
