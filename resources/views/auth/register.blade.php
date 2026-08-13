<x-guest-layout>
    <div class="mb-12 text-center">
        <h2 class="text-3xl font-black uppercase tracking-tight glitch-text" data-text="CREATE ACCOUNT">Create Account</h2>
        <p class="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 drop-shadow">Join the elite gaming community</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-8">
        @csrf

        <!-- Name -->
        <div class="epic-input-wrapper">
            <input id="name" class="epic-input peer" type="text" name="name" :value="old('name')" placeholder=" " required autofocus autocomplete="name" />
            <div class="epic-input-line"></div>
            <label for="name" class="epic-label">Full Name</label>
            <x-input-error :messages="$errors->get('name')" class="mt-2 text-pink-500 text-xs font-bold" />
        </div>

        <!-- Email Address -->
        <div class="epic-input-wrapper">
            <input id="email" class="epic-input peer" type="email" name="email" :value="old('email')" placeholder=" " required autocomplete="username" />
            <div class="epic-input-line"></div>
            <label for="email" class="epic-label">Email Address</label>
            <x-input-error :messages="$errors->get('email')" class="mt-2 text-pink-500 text-xs font-bold" />
        </div>

        <!-- Password -->
        <div class="epic-input-wrapper">
            <input id="password" class="epic-input peer" type="password" name="password" placeholder=" " required autocomplete="new-password" />
            <div class="epic-input-line"></div>
            <label for="password" class="epic-label">Password</label>
            <x-input-error :messages="$errors->get('password')" class="mt-2 text-pink-500 text-xs font-bold" />
        </div>

        <!-- Confirm Password -->
        <div class="epic-input-wrapper">
            <input id="password_confirmation" class="epic-input peer" type="password" name="password_confirmation" placeholder=" " required autocomplete="new-password" />
            <div class="epic-input-line"></div>
            <label for="password_confirmation" class="epic-label">Confirm Password</label>
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2 text-pink-500 text-xs font-bold" />
        </div>

        <div class="pt-6 space-y-6">
            <button type="submit" class="epic-btn w-full justify-center py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em]">
                {{ __('Register Now') }}
            </button>

            <div class="text-center pt-4">
                <a class="text-[10px] font-black text-gray-500 hover:text-purple-400 transition uppercase tracking-[0.2em]" href="{{ route('login') }}">
                    &larr; {{ __('Already registered? Log in') }}
                </a>
            </div>
        </div>
    </form>
</x-guest-layout>
