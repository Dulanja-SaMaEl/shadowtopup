<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'ShadowTopUp') }} - Authenticate</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <style>
        :root {
            --bg-dark: #05030a;
            --accent-pink: #ff00ff;
            --accent-purple: #8b5cf6;
            --accent-cyan: #00ffff;
        }
        body {
            background-color: var(--bg-dark);
            color: #ffffff;
            font-family: 'Figtree', sans-serif;
            background-image: url('{{ asset('assets/user/img/home-2/hero/hero-bg.jpg') }}');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            position: relative;
            overflow-x: hidden;
            min-height: 100vh;
        }
        body::before {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(5, 3, 10, 0.90);
            z-index: -2;
        }
        
        /* Interactive Mouse Glow Spotlight */
        #cursor-glow {
            position: fixed;
            top: 0;
            left: 0;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(255, 0, 255, 0.05) 40%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
            transition: opacity 0.3s ease;
            opacity: 0;
        }

        /* Glassmorphic Neon Card */
        .epic-card-wrapper {
            position: relative;
            padding: 1px;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(255, 0, 255, 0.2), rgba(6, 182, 212, 0.3));
            z-index: 10;
            animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(40px);
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.15);
        }

        .epic-card-inner {
            background: #0c0818;
            border-radius: 23px;
            padding: 2.5rem 2rem;
            height: 100%;
            position: relative;
            z-index: 2;
        }

        @keyframes spin {
            100% { transform: rotate(360deg); }
        }
        @keyframes slideUpFade {
            to { opacity: 1; transform: translateY(0); }
        }

        /* Glitch Typography */
        .glitch-text {
            position: relative;
            color: white;
        }
        .glitch-text::before, .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 0.8;
        }
        .glitch-text::before {
            left: 2px;
            text-shadow: -2px 0 #ff00ff;
            clip: rect(24px, 550px, 90px, 0);
            animation: glitch-anim 3s infinite linear alternate-reverse;
        }
        .glitch-text::after {
            left: -2px;
            text-shadow: -2px 0 #00ffff;
            clip: rect(85px, 550px, 140px, 0);
            animation: glitch-anim 2s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
            0% { clip: rect(10px, 9999px, 44px, 0); }
            20% { clip: rect(80px, 9999px, 90px, 0); }
            40% { clip: rect(20px, 9999px, 12px, 0); }
            60% { clip: rect(100px, 9999px, 70px, 0); }
            80% { clip: rect(40px, 9999px, 33px, 0); }
            100% { clip: rect(60px, 9999px, 80px, 0); }
        }

        /* Borderless Animated Inputs */
        .epic-input-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 2rem;
        }
        .epic-input {
            width: 100%;
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.2) !important;
            color: white !important;
            padding: 12px 0 !important;
            font-size: 16px;
            font-weight: 700;
            border-radius: 0 !important;
            outline: none !important;
            box-shadow: none !important;
        }
        /* Animated Bottom Line */
        .epic-input-line {
            position: absolute;
            bottom: 0; left: 50%;
            width: 0; height: 2px;
            background: linear-gradient(90deg, #ff00ff, #00ffff);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(-50%);
        }
        .epic-input:focus ~ .epic-input-line {
            width: 100%;
        }

        /* Floating Label */
        .epic-label {
            position: absolute;
            left: 0; top: 12px;
            color: rgba(255,255,255,0.4);
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .epic-input:focus ~ .epic-label,
        .epic-input:not(:placeholder-shown) ~ .epic-label {
            top: -16px;
            font-size: 10px;
            color: #00ffff;
            text-shadow: 0 0 10px rgba(0,255,255,0.5);
        }

        /* Magnetic Button Glow */
        .epic-btn {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.5);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
        }
        .epic-btn:hover {
            background: rgba(139, 92, 246, 0.3);
            border-color: #ff00ff;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.4), inset 0 0 15px rgba(139, 92, 246, 0.4);
            transform: translateY(-2px);
        }
    </style>
    </head>
    <body class="font-sans antialiased selection:bg-cyan-500 selection:text-black">
        
        <div id="cursor-glow"></div>

        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-10 sm:pt-0 relative z-10 px-4">
            
            <div class="mb-12 text-center" style="animation: slideUpFade 0.6s forwards;">
                <a href="/" class="inline-block group">
                    <div class="w-20 h-20 mx-auto bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:border-cyan-400 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <span class="text-white font-black italic text-4xl relative z-10">S</span>
                    </div>
                </a>
            </div>

            <div class="w-full sm:max-w-md epic-card-wrapper">
                <div class="epic-card-inner">
                    {{ $slot }}
                </div>
            </div>
            
            <div class="mt-12 text-center opacity-0" style="animation: slideUpFade 0.8s 0.3s forwards;">
                <p class="text-[10px] text-gray-600 font-black uppercase tracking-widest">&copy; {{ date('Y') }} SHADOW SYSTEM INIT.</p>
            </div>
        </div>

        <script>
            // Interactive Mouse Spotlight
            document.addEventListener('DOMContentLoaded', () => {
                const glow = document.getElementById('cursor-glow');
                let isMouseMoving = false;
                let mouseTimeout;

                document.addEventListener('mousemove', (e) => {
                    // Make it visible
                    if(!isMouseMoving) {
                        glow.style.opacity = '1';
                        isMouseMoving = true;
                    }
                    
                    // Position it
                    glow.style.left = e.clientX + 'px';
                    glow.style.top = e.clientY + 'px';

                    // Hide after stopping
                    clearTimeout(mouseTimeout);
                    mouseTimeout = setTimeout(() => {
                        glow.style.opacity = '0';
                        isMouseMoving = false;
                    }, 2000);
                });
            });
        </script>
    </body>
</html>
