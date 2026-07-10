<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" type="image/webp" href="/uploads/lanyarddepok-favicon.webp">
        <link rel="shortcut icon" href="/uploads/lanyarddepok-favicon.webp">

        <script>
            (function () {
                var theme = localStorage.getItem('stisla-theme');
                if (theme === 'dark' || theme === 'light') {
                    document.documentElement.dataset.theme = theme;
                }
            })();
        </script>
        <link rel="stylesheet" href="/vendor/meridian/assets/css/style.css">

        <!-- Scripts -->
        @routes
        @vite(['resources/js/app.ts', "resources/js/Pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
