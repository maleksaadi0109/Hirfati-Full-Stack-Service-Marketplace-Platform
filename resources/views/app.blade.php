<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Critical inline styles to prevent FOUC and layout shift --}}
        <style>
            /* Background colors */
            html {
                background-color: oklch(1 0 0);
            }
            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Height inheritance chain - prevents layout shift */
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
            }

            /* Scrollbar stability - prevents CLS when scrollbar appears/disappears */
            html {
                overflow-y: scroll;
                scrollbar-gutter: stable;
            }

            /* Root app container */
            #app {
                min-height: 100%;
                display: flex;
                flex-direction: column;
            }

            body {
                overflow-x: hidden;
            }

            .boot-loading {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background:
                    radial-gradient(circle at top left, rgba(244, 122, 32, 0.24), transparent 34%),
                    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.18), transparent 30%),
                    linear-gradient(135deg, #fff7ed 0%, #ffffff 48%, #fff1e6 100%);
                transition: opacity 260ms ease, visibility 260ms ease;
            }

            html.dark .boot-loading {
                background:
                    radial-gradient(circle at top left, rgba(249, 115, 22, 0.24), transparent 34%),
                    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.14), transparent 30%),
                    linear-gradient(135deg, #111827 0%, #0f172a 52%, #1f2937 100%);
            }

            .boot-loading.is-hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }

            .boot-loading__card {
                position: relative;
                width: min(100%, 430px);
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.72);
                border-radius: 28px;
                padding: 32px 28px;
                color: #0f172a;
                background: rgba(255, 255, 255, 0.76);
                box-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);
                backdrop-filter: blur(18px);
            }

            html.dark .boot-loading__card {
                color: #f8fafc;
                border-color: rgba(255, 255, 255, 0.08);
                background: rgba(15, 23, 42, 0.78);
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
            }

            .boot-loading__badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 8px 14px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #c2410c;
                background: rgba(255, 237, 213, 0.92);
            }

            html.dark .boot-loading__badge {
                color: #fdba74;
                background: rgba(249, 115, 22, 0.14);
            }

            .boot-loading__dot {
                width: 10px;
                height: 10px;
                border-radius: 999px;
                background: linear-gradient(135deg, #f97316, #fb923c);
                box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.14);
                animation: boot-pulse 1.6s ease-in-out infinite;
            }

            .boot-loading__title {
                margin: 20px 0 10px;
                font-size: clamp(1.9rem, 4vw, 2.6rem);
                line-height: 1.05;
                font-weight: 800;
                letter-spacing: -0.04em;
            }

            .boot-loading__text {
                margin: 0;
                font-size: 15px;
                line-height: 1.7;
                color: #475569;
            }

            html.dark .boot-loading__text {
                color: #cbd5e1;
            }

            .boot-loading__progress {
                margin-top: 26px;
            }

            .boot-loading__track {
                position: relative;
                height: 10px;
                overflow: hidden;
                border-radius: 999px;
                background: rgba(148, 163, 184, 0.18);
            }

            .boot-loading__bar {
                position: absolute;
                inset: 0;
                width: 42%;
                border-radius: inherit;
                background: linear-gradient(90deg, #f97316, #fb923c, #fbbf24);
                animation: boot-slide 1.35s ease-in-out infinite;
            }

            .boot-loading__meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-top: 14px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #64748b;
            }

            html.dark .boot-loading__meta {
                color: #94a3b8;
            }

            .boot-loading__orbit,
            .boot-loading__glow {
                position: absolute;
                border-radius: 999px;
                pointer-events: none;
            }

            .boot-loading__orbit {
                top: -70px;
                right: -40px;
                width: 170px;
                height: 170px;
                border: 1px solid rgba(249, 115, 22, 0.22);
            }

            .boot-loading__glow {
                right: 30px;
                bottom: -60px;
                width: 160px;
                height: 160px;
                background: radial-gradient(circle, rgba(251, 191, 36, 0.24), transparent 68%);
            }

            @keyframes boot-slide {
                0% { transform: translateX(-120%); }
                55% { transform: translateX(155%); }
                100% { transform: translateX(155%); }
            }

            @keyframes boot-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.18); opacity: 0.72; }
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="{{ asset('images/hirfati-logo.jpg') }}" type="image/jpeg">
        <link rel="apple-touch-icon" href="{{ asset('images/hirfati-logo.jpg') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <div id="boot-loading" class="boot-loading" aria-live="polite" aria-busy="true">
            <div class="boot-loading__card">
                <div class="boot-loading__orbit"></div>
                <div class="boot-loading__glow"></div>

                <div class="boot-loading__badge">
                    <span class="boot-loading__dot"></span>
                    MALIEEK PLATFORM
                </div>

                <h1 class="boot-loading__title">Preparing your workspace</h1>
                <p class="boot-loading__text">
                    Loading tools, pages, and live updates so everything is ready when you arrive.
                </p>

                <div class="boot-loading__progress">
                    <div class="boot-loading__track">
                        <div class="boot-loading__bar"></div>
                    </div>
                    <div class="boot-loading__meta">
                        <span>Please wait</span>
                        <span>Starting up</span>
                    </div>
                </div>
            </div>
        </div>
        @inertia
    </body>
</html>
