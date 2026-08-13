<x-guest-layout>
    <div class="mb-8 text-center">
        <h2 class="text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">Welcome Back</h2>
        <p class="text-cyan-400 text-[11px] font-bold uppercase tracking-[0.25em] mt-2">Authenticate to continue</p>
    </div>

    <x-auth-session-status class="mb-6" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-6">
        @csrf

        <!-- Email Address -->
        <div>
            <label for="email" class="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-2">Email Address</label>
            <input id="email" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder-gray-500 outline-none" type="email" name="email" value="{{ old('email') }}" placeholder="name@example.com" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2 text-rose-400 text-xs font-bold" />
        </div>

        <!-- Password -->
        <div>
            <label for="password" class="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-2">Password</label>
            <input id="password" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder-gray-500 outline-none" type="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2 text-rose-400 text-xs font-bold" />
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between pt-1">
            <label for="remember_me" class="flex items-center gap-2.5 cursor-pointer">
                <input id="remember_me" type="checkbox" class="w-4 h-4 rounded bg-white/5 border border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer" name="remember">
                <span class="text-xs font-bold text-gray-400 hover:text-gray-200 transition">Remember me</span>
            </label>
            
            @if (Route::has('password.request'))
                <a class="text-xs font-bold text-purple-400 hover:text-purple-300 transition" href="{{ route('password.request') }}">
                    Forgot password?
                </a>
            @endif
        </div>

        <div class="pt-4 space-y-4">
            <button type="submit" class="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                <span>Initialize System</span>
            </button>

            <div class="text-center pt-2">
                <a class="text-xs font-bold text-gray-400 hover:text-cyan-400 transition" href="{{ route('register') }}">
                    New User? <span class="text-cyan-400 underline">Create Account</span>
                </a>
            </div>
        </div>
    </form>
</x-guest-layout>

