<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.products.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Products Inventory</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Edit Product: <span class="text-purple-400">{{ $product->name }}</span></h2>
        <p class="text-gray-400 text-sm mt-1">Update package pricing, images, and catalog visibility.</p>
    </div>

    <div class="max-w-4xl glass-card rounded-2xl border border-white/10 shadow-2xl p-8">
        <form action="{{ route('admin.products.update', $product) }}" method="POST" enctype="multipart/form-data" class="space-y-8">
            @csrf
            @method('PUT')
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <label for="game_id" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Game Title</label>
                        <select name="game_id" id="game_id" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                            <option value="" class="bg-gray-900 text-white">Select a game...</option>
                            @foreach($games as $game)
                                <option value="{{ $game->id }}" {{ old('game_id', $product->game_id) == $game->id ? 'selected' : '' }} class="bg-gray-900 text-white">{{ $game->name }}</option>
                            @endforeach
                        </select>
                        @error('game_id') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="name" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Package Name</label>
                        <input type="text" name="name" id="name" value="{{ old('name', $product->name) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        @error('name') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="normal_price" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Normal Tier Price</label>
                        <div class="relative">
                            <span class="absolute left-4 top-3 text-gray-400 font-mono font-bold">$</span>
                            <input type="number" step="0.01" name="normal_price" id="normal_price" value="{{ old('normal_price', $product->normal_price) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 pl-9 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        </div>
                        @error('normal_price') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="silver_price" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Silver Reseller Tier Price</label>
                        <div class="relative">
                            <span class="absolute left-4 top-3 text-slate-400 font-mono font-bold">$</span>
                            <input type="number" step="0.01" name="silver_price" id="silver_price" value="{{ old('silver_price', $product->silver_price) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 pl-9 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        </div>
                        @error('silver_price') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>

                    <div>
                        <label for="gold_price" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gold Reseller Tier Price</label>
                        <div class="relative">
                            <span class="absolute left-4 top-3 text-amber-400 font-mono font-bold">$</span>
                            <input type="number" step="0.01" name="gold_price" id="gold_price" value="{{ old('gold_price', $product->gold_price) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 pl-9 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        </div>
                        @error('gold_price') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Product Thumbnail Image</label>
                        <div class="relative group h-48 w-full">
                            <input type="file" name="image" id="image" class="hidden" onchange="previewImage(this, 'product-preview')">
                            <label for="image" class="w-full h-full border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition bg-white/5 overflow-hidden">
                                @php $imgUrl = $product->image_path ? asset('storage/' . $product->image_path) : null; @endphp
                                <img id="product-preview" src="{{ $imgUrl }}" class="{{ $imgUrl ? '' : 'hidden' }} w-full h-full object-contain p-2">
                                <div id="product-placeholder" class="{{ $imgUrl ? 'hidden' : '' }} text-center p-4">
                                    <svg class="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <span class="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">Upload Image</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input type="checkbox" name="is_published" id="is_published" value="1" {{ old('is_published', $product->is_published) ? 'checked' : '' }} class="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500">
                        <label for="is_published" class="text-xs font-bold text-gray-200 uppercase tracking-widest cursor-pointer">Published in Catalog</label>
                    </div>
                </div>
            </div>

            <div>
                <label for="description" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Package Description</label>
                <textarea name="description" id="description" rows="3" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">{{ old('description', $product->description) }}</textarea>
                @error('description') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div class="pt-6 border-t border-white/10 flex justify-end">
                <button type="submit" class="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Update Product Item
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

