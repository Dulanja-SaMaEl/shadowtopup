<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.games.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Game Catalog</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Edit Game: <span class="text-purple-400">{{ $game->name }}</span></h2>
        <p class="text-gray-400 text-sm mt-1">Update game catalog settings, categories, and cover banners.</p>
    </div>

    <div class="max-w-4xl glass-card rounded-2xl border border-white/10 shadow-2xl p-8">
        <form action="{{ route('admin.games.update', $game) }}" method="POST" enctype="multipart/form-data" class="space-y-8">
            @csrf
            @method('PUT')
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <label for="name" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Game Title</label>
                        <input type="text" name="name" id="name" value="{{ old('name', $game->name) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        @error('name') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="category" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category Tag</label>
                        <input type="text" name="category" id="category" value="{{ old('category', $game->category) }}" placeholder="e.g. Mobile Legends, Battle Royale" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        @error('category') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="description" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea name="description" id="description" rows="4" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">{{ old('description', $game->description) }}</textarea>
                        @error('description') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Game Logo (Square)</label>
                        <div class="relative group h-40 w-40">
                            <input type="file" name="logo" id="logo" class="hidden" onchange="previewImage(this, 'logo-preview')">
                            <label for="logo" class="w-full h-full border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition bg-white/5 overflow-hidden">
                                @php $logoUrl = $game->logo_path ? (str_starts_with($game->logo_path, 'http') ? $game->logo_path : asset('storage/' . $game->logo_path)) : null; @endphp
                                <img id="logo-preview" src="{{ $logoUrl }}" class="{{ $logoUrl ? '' : 'hidden' }} w-full h-full object-contain p-2">
                                <div id="logo-placeholder" class="{{ $logoUrl ? 'hidden' : '' }} text-center p-4">
                                    <svg class="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    <span class="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">Upload Logo</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Game Hero Banner</label>
                        <div class="relative group h-40 w-full">
                            <input type="file" name="banner" id="banner" class="hidden" onchange="previewImage(this, 'banner-preview')">
                            <label for="banner" class="w-full h-full border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition bg-white/5 overflow-hidden">
                                @php $bannerUrl = $game->banner_path ? asset('storage/' . $game->banner_path) : null; @endphp
                                <img id="banner-preview" src="{{ $bannerUrl }}" class="{{ $bannerUrl ? '' : 'hidden' }} w-full h-full object-cover">
                                <div id="banner-placeholder" class="{{ $bannerUrl ? 'hidden' : '' }} text-center p-4">
                                    <svg class="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span class="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">Upload Banner</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-white/10 flex justify-end">
                <button type="submit" class="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Update Game Title
                </button>
            </div>
        </form>
    </div>

    <script>
        function previewImage(input, previewId) {
            const preview = document.getElementById(previewId);
            const placeholder = document.getElementById(previewId.replace('preview', 'placeholder'));
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
    </script>
</x-admin-layout>

