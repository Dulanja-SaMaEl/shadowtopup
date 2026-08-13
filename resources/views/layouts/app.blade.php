<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'ShadowTopUp') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800,900&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
        
        <style>
            :root {
                --bg-dark: #090514;
                --card-bg: #15102a;
                --accent-pink: #ff00ff;
                --accent-purple: #8b5cf6;
                --accent-cyan: #00ffff;
            }
            body {
                background-color: var(--bg-dark);
                color: #ffffff;
                font-family: 'Figtree', sans-serif;
                background-image: 
                    radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 90% 90%, rgba(255, 0, 255, 0.1) 0%, transparent 40%);
                background-attachment: fixed;
            }
            .glass-card {
                background: rgba(25, 20, 45, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                transition: all 0.3s ease;
            }
            .glass-card:hover {
                border-color: rgba(139, 92, 246, 0.4);
                background: rgba(25, 20, 45, 0.8);
            }
            .btn-pink-gradient {
                background: linear-gradient(90deg, #ff00ff 0%, #d400ff 100%);
                box-shadow: 0 0 25px rgba(255, 0, 255, 0.4);
                border: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .btn-pink-gradient:hover {
                box-shadow: 0 0 40px rgba(255, 0, 255, 0.6);
                transform: translateY(-2px);
            }
            .input-dark {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: white;
                transition: all 0.3s ease;
            }
            .input-dark:focus {
                border-color: var(--accent-purple);
                background: rgba(0, 0, 0, 0.5);
                box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
                outline: none;
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen">
            @include('layouts.navigation')

            @isset($header)
                <header class="bg-white/5 border-b border-white/10 backdrop-blur-sm">
                    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <main>
                {{ $slot }}
            </main>
        </div>
    </body>
</html>
