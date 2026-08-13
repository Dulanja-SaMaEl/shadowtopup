<x-guest-layout>
    <div class="mb-6 text-sm text-gray-400">
        {{ __('Thanks for signing up! Before getting started, verify your email address by clicking the link we just emailed to you.') }}
    </div>

    @if (session('status') == 'verification-link-sent')
        <div class="mb-4 font-medium text-sm text-green-400">
            {{ __('A new verification link has been sent to your email.') }}
        </div>
    @endif

    <div class="mt-6 flex items-center justify-between">
        <form method="POST" action="{{ route('verification.send') }}">
            @csrf
            <x-primary-button>
                {{ __('Resend Email') }}
            </x-primary-button>
        </form>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="text-sm text-purple-400 hover:text-pink-400 transition">
                {{ __('Log Out') }}
            </button>
        </form>
    </div>
</x-guest-layout>
