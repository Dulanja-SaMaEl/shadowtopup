<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Admin - {{ config('app.name', 'ShadowTopUp') }}</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800,900&display=swap" rel="stylesheet" />

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <style>
        :root {
            --bg-dark: #07040f;
            --card-bg: rgba(21, 16, 42, 0.65);
            --accent-pink: #ff00ff;
            --accent-purple: #8b5cf6;
            --accent-cyan: #06b6d4;
        }
        
        body {
            background-color: var(--bg-dark);
            color: #f3f4f6;
            font-family: 'Figtree', sans-serif;
            background-image: 
                radial-gradient(circle at 5% 5%, rgba(139, 92, 246, 0.18) 0%, transparent 45%),
                radial-gradient(circle at 95% 95%, rgba(255, 0, 255, 0.12) 0%, transparent 45%),
                radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%);
            background-attachment: fixed;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 10, 25, 0.6);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.6);
        }

        /* Dark mode select dropdown styling */
        select option {
            background-color: #120c24;
            color: #ffffff;
        }

        .admin-sidebar {
            width: 16rem;
            background: rgba(12, 8, 24, 0.92);
            backdrop-filter: blur(24px);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            color: rgba(255, 255, 255, 0.65);
            border: 1px solid transparent;
        }

        .nav-item:hover {
            background: rgba(139, 92, 246, 0.15);
            color: #ffffff;
            border-color: rgba(139, 92, 246, 0.2);
            transform: translateX(2px);
        }

        .nav-item.active {
            background: linear-gradient(90deg, rgba(139, 92, 246, 0.25) 0%, rgba(255, 0, 255, 0.15) 100%);
            color: #ffffff;
            border-color: rgba(139, 92, 246, 0.4);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.25);
        }

        .nav-item.active svg {
            color: #a855f7;
            filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6));
        }

        .glass-card {
            background: var(--card-bg);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
        }

        .glass-card-hover {
            transition: all 0.3s ease;
        }

        .glass-card-hover:hover {
            border-color: rgba(139, 92, 246, 0.3);
            box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.2);
            transform: translateY(-2px);
        }
        
        .badge-neon {
            border: 1px solid currentColor;
            box-shadow: 0 0 10px currentColor;
        }

        @media (min-width: 768px) {
            .mobile-header { display: none !important; }
            .desktop-content { margin-left: 16rem !important; }
        }
        @media (max-width: 767px) {
            .desktop-content { margin-left: 0 !important; }
        }
    </style>
</head>
<body class="font-sans antialiased bg-[#07040f]" x-data="{ sidebarOpen: false }">

    <!-- Mobile Header -->
    <div class="mobile-header flex items-center justify-between p-4 bg-[rgba(12,8,24,0.95)] border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-500/30">⚡</div>
            <h1 class="text-base font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Admin Panel</h1>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 focus:outline-none transition">
            <svg x-show="!sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg x-show="sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>

    <!-- Sidebar Overlay -->
    <div x-show="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" style="display: none;"></div>

    <!-- Fixed Sidebar -->
    <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'" class="admin-sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:translate-x-0 overflow-y-auto flex flex-col text-white">
        <!-- Sidebar Header / Logo -->
        <div class="p-6 hidden md:flex items-center gap-3 border-b border-white/5">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/20">
                <div class="w-full h-full bg-[#0d081f] rounded-[15px] flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
            </div>
            <div>
                <h1 class="text-base font-black uppercase tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">ShadowTopUp</h1>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control Hub</p>
            </div>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="mt-4 px-4 space-y-1.5 flex-1">
            <div class="px-3 py-2 text-[10px] font-black text-purple-400/80 uppercase tracking-[0.2em]">Core Overview</div>
            
            <a href="{{ route('admin.dashboard') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span>Dashboard</span>
            </a>
            
            <a href="{{ route('admin.orders.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.orders.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>Orders</span>
            </a>

            <a href="{{ route('admin.games.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.games.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Games</span>
            </a>

            <a href="{{ route('admin.products.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.products.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span>Products</span>
            </a>

            <a href="{{ route('admin.resellers.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.resellers.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                <span>Resellers</span>
            </a>

            <a href="{{ route('admin.users.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <span>Users</span>
            </a>

            <div class="mt-6 px-3 py-2 text-[10px] font-black text-pink-400/80 uppercase tracking-[0.2em]">Free Fire Top-Up</div>
            
            <a href="{{ route('admin.shell_accounts.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.shell_accounts.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span>Shell Accounts</span>
            </a>

            <a href="{{ route('admin.packages.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.packages.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                <span>Packages</span>
            </a>

            <a href="{{ route('admin.pricing.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.pricing.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                <span>Pricing Rules</span>
            </a>

            <a href="{{ route('admin.purchase_transactions.index') }}" @click="sidebarOpen = false" class="nav-item {{ request()->routeIs('admin.purchase_transactions.*') ? 'active' : '' }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path></svg>
                <span>Transactions</span>
            </a>
        </nav>

        
        <!-- Sidebar Footer / Logout -->
        <div class="p-4 mt-auto border-t border-white/5 space-y-3">
            <div class="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
                    {{ strtoupper(substr(Auth::user()->name ?? 'A', 0, 1)) }}
                </div>
                <div class="overflow-hidden">
                    <p class="text-xs font-bold text-white truncate">{{ Auth::user()->name ?? 'Admin' }}</p>
                    <p class="text-[10px] text-gray-400 truncate">{{ Auth::user()->email ?? 'admin@shadowtopup.com' }}</p>
                </div>
            </div>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition flex items-center justify-center gap-2 border border-rose-500/20">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Sign Out</span>
                </button>
            </form>
        </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="desktop-content flex flex-col min-h-screen">
        <!-- Top Navigation Bar -->
        <header class="hidden md:flex items-center justify-between px-8 py-4 bg-[rgba(12,8,24,0.4)] backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
            <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-gray-400">Admin</span>
                <span class="text-gray-600">/</span>
                <span class="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    {{ str_replace('.', ' › ', request()->route()->getName() ?? 'Dashboard') }}
                </span>
            </div>

            <div class="flex items-center gap-4">
                <!-- System Status Indicator -->
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>System Online</span>
                </div>

                <a href="{{ route('home') }}" target="_blank" class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600 text-gray-300 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-white/10 shadow-sm">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    <span>View Store</span>
                </a>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 p-6 lg:p-10">
            @if(session('success'))
                <div class="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-between shadow-lg shadow-emerald-500/5">
                    <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{{ session('success') }}</span>
                    </div>
                </div>
            @endif

            @if(session('error'))
                <div class="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm flex items-center justify-between shadow-lg shadow-rose-500/5">
                    <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{{ session('error') }}</span>
                    </div>
                </div>
            @endif

            {{ $slot }}
        </main>
    </div>

</body>
</html>

