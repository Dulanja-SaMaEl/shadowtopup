<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex items-center px-4 py-2 bg-red-600/80 border border-red-500/50 rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-300']) }}>
    {{ $slot }}
</button>
