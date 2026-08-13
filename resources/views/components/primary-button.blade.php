<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 border-0 rounded-xl font-bold text-sm text-white uppercase tracking-widest hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-300 shadow-lg shadow-purple-500/30']) }}>
    {{ $slot }}
</button>
