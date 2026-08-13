<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Game Catalog</h2>
            <p class="text-gray-400 text-sm mt-1">Manage supported games, categories, and top-up offerings.</p>
        </div>
        
        <a href="{{ route('admin.games.create') }}" class="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add New Game</span>
        </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @forelse($games as $game)
            <div class="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden group hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                    <div class="h-48 bg-white/5 relative overflow-hidden">
                        @if($game->banner_path)
                            <img src="{{ asset('storage/' . $game->banner_path) }}" alt="{{ $game->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        @else
                            <div class="w-full h-full flex items-center justify-center bg-white/5 text-purple-400">
                                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        @endif
                        <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
                        <div class="absolute bottom-4 left-6 flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl glass-card p-1 shadow-xl border border-white/20 shrink-0 bg-gray-900/80">
                                <img src="{{ $game->logo_path ? (str_starts_with($game->logo_path, 'http') ? $game->logo_path : asset('storage/' . $game->logo_path)) : asset('images/placeholder-logo.png') }}" class="w-full h-full object-contain rounded-lg">
                            </div>
                            <div>
                                <h3 class="text-white font-black text-lg uppercase tracking-tight leading-tight">{{ $game->name }}</h3>
                                <span class="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest font-mono">{{ $game->category ?? 'Gaming' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div class="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                                {{ $game->products_count }} Products Listed
                            </div>
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest {{ $game->is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30' }}">
                                {{ $game->is_active ? 'Active Catalog' : 'Inactive' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="p-6 pt-0 flex items-center gap-2">
                    <a href="{{ route('admin.games.edit', $game) }}" class="flex-1 text-center py-2.5 bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-purple-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition">Edit</a>
                    <a href="{{ route('admin.products.index', ['game_id' => $game->id]) }}" class="flex-1 text-center py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-600/20">Products</a>
                    <form action="{{ route('admin.games.destroy', $game) }}" method="POST" onsubmit="return confirm('Are you sure? This will delete all products under this game.')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="p-2.5 text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition" title="Delete Game">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        @empty
            <div class="col-span-full glass-card p-12 text-center text-gray-400 text-sm rounded-2xl border border-white/10">
                No games added to catalog yet.
            </div>
        @endforelse
    </div>
</x-admin-layout>

