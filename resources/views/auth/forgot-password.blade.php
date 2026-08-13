<x-guest-layout>
    <div class="mb-6 text-center">
        <h2 class="text-2xl font-black text-white uppercase tracking-tight">Recover Access</h2>
        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Reset your forgotten password</p>
    </div>

    <div class="mb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
        {{ __('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.') }}
    </div>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}">
        @csrf

        <!-- Email Address -->
        <div class="mb-6">
            <label for="email" class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
            <input id="email" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-purple-500 transition-all outline-none" type="email" name="email" :value="old('email')" required autofocus />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div class="space-y-4">
            <button type="submit" class="gt-theme-btn w-full justify-center py-4 uppercase tracking-[0.2em]">
                {{ __('Send Reset Link') }}
            </button>

            <div class="text-center">
                <a class="text-[10px] font-black text-gray-400 hover:text-white transition uppercase tracking-[0.2em]" href="{{ route('login') }}">
                    {{ __('Back to login') }}
                </a>
            </div>
        </div>
    </form>
</x-guest-layout>
