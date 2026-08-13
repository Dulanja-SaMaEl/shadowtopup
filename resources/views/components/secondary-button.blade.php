<button {{ $attributes->merge(['type' => 'button', 'class' => 'inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-25 transition-all duration-300']) }}>
    {{ $slot }}
</button>
