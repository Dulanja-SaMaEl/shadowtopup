<x-store-layout>
    <div class="space-y-24">
        <!-- Hero Section -->
        <div class="relative overflow-hidden rounded-[48px] bg-[#15102a] border border-white/10 shadow-2xl">
            <div class="hero-grid-pattern absolute inset-0 opacity-20"></div>
            
            <div class="relative z-10 px-8 py-16 md:px-16 md:py-24 flex flex-col lg:flex-row gap-12">
                <!-- Left Side: Content -->
                <div class="lg:w-2/3 flex flex-col justify-center">
                    <div class="flex flex-wrap gap-3 mb-8">
                        @foreach(['Instant Delivery', 'Trusted Shop', 'Secure Payments'] as $badge)
                            <span class="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400">
                                {{ $badge }}
                            </span>
                        @endforeach
                    </div>

                    <h1 class="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 uppercase tracking-tighter">
                        FREE FIRE <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">TOP-UP STORE</span>
                    </h1>

                    <p class="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed font-medium">
                        Premium gaming top-ups with fast delivery, secure payments, and exclusive offers. Recreated with a modern dark neon aesthetic.
                    </p>

                    <div class="flex flex-wrap gap-6 mb-12">
                        <a href="#games" class="btn-pink-gradient px-12 py-5 rounded-3xl font-black text-white text-sm uppercase tracking-widest">
                            Top Up Now
                        </a>
                        <a href="#games" class="px-12 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-white text-sm uppercase tracking-widest hover:bg-white/10 transition">
                            View Packages
                        </a>
                    </div>

                    <div class="flex flex-wrap items-center gap-6 pt-10 border-t border-white/5">
                        <span class="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">We Accept</span>
                        <div class="flex flex-wrap gap-4">
                            @foreach(['Mastercard', 'Visa', 'Amex', 'Bank Transfer', 'LankaQR'] as $method)
                                <span class="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {{ $method }}
                                </span>
                            @endforeach
                        </div>
                    </div>
                </div>

                <!-- Right Side: Info Cards -->
                <div class="lg:w-1/3 flex flex-col gap-6">
                    <div class="glass-card rounded-[32px] p-8 flex-1 border-l-4 border-l-purple-500">
                        <h3 class="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-8">Contact Us</h3>
                        <div class="space-y-8">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </div>
                                <span class="text-sm font-bold text-white">WhatsApp 24/7</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.572-.445.764-.648.783-.447.041-.785-.295-1.218-.579-.678-.444-1.061-.72-1.718-1.152-.76-.499-.267-.774.165-1.223.113-.117 2.079-1.907 2.117-2.071.005-.021.01-.099-.037-.14-.047-.041-.117-.027-.168-.016-.072.016-1.214.772-3.419 2.262-.323.222-.616.331-.877.325-.288-.006-.843-.162-1.256-.296-.506-.164-.909-.251-.874-.53.018-.146.21-.296.574-.45 2.247-.979 3.745-1.625 4.494-1.938 2.138-.894 2.581-1.05 2.871-1.056.064-.001.206.015.298.09.077.063.102.149.111.211.009.066.012.21.006.273z"/></svg>
                                </div>
                                <span class="text-sm font-bold text-white">Telegram Channel</span>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card rounded-[32px] p-8 flex-1 border-l-4 border-l-pink-500">
                        <h3 class="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] mb-6">Hot Promo</h3>
                        <h4 class="text-3xl font-black text-white mb-4 tracking-tighter uppercase leading-none italic">UP TO 15% <br> BONUS</h4>
                        <p class="text-gray-500 text-xs font-medium leading-relaxed">
                            Buy selected Free Fire packs and enjoy premium discounts.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Games Grid Section -->
        <div id="games" class="space-y-16">
            <div class="text-center">
                <h2 class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                    Select your <span class="text-purple-500 italic">Game to Top up</span>
                </h2>
                <div class="w-24 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                @foreach($games as $game)
                    <a href="{{ route('games.show', $game) }}" class="group">
                        <div class="relative overflow-hidden rounded-[40px] bg-[#15102a] border border-white/5 aspect-[3/4] transition-all duration-500 group-hover:-translate-y-4 group-hover:border-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-600/20">
                            <div class="absolute inset-0">
                                @if(Str::startsWith($game->logo_path, 'http'))
                                    <img src="{{ $game->logo_path }}" alt="{{ $game->name }}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                                @elseif($game->logo_path)
                                    <img src="{{ asset('storage/' . $game->logo_path) }}" alt="{{ $game->name }}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                                @else
                                    <div class="w-full h-full flex items-center justify-center text-gray-800 font-black text-6xl uppercase italic">
                                        {{ $game->name[0] }}
                                    </div>
                                @endif
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-[#090514] via-[#090514]/40 to-transparent opacity-90 group-hover:opacity-60 transition duration-500"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-8 text-center">
                                <h3 class="text-white font-black text-lg uppercase tracking-tight group-hover:text-purple-400 transition">
                                    {{ $game->name }}
                                </h3>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>

        <!-- Features Section -->
        <div class="py-24 rounded-[64px] bg-[#15102a] border border-white/5 relative overflow-hidden">
            <div class="hero-grid-pattern absolute inset-0 opacity-10"></div>
            <div class="relative z-10 px-10">
                <div class="text-center mb-20">
                    <h2 class="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Why Choose <span class="text-pink-500 italic">Shadow Store</span>
                    </h2>
                    <p class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">The ultimate gaming companion</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
                    @foreach([
                        ['icon' => 'M13 10V3L4 14h7v7l9-11h-7z', 'title' => 'Instant Delivery', 'desc' => 'Your top-ups are delivered to your account within seconds of verification.'],
                        ['icon' => 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c0 4.835 1.353 9.364 3.682 13.157a11.911 11.911 0 007.936 5.852 11.911 11.911 0 007.936-5.852c2.329-3.793 3.682-8.322 3.682-13.157z', 'title' => '100% Secure', 'desc' => 'We use the highest security standards to ensure your data and payments are safe.'],
                        ['icon' => 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 'title' => 'Best Prices', 'desc' => 'Get the most value for your money with our competitive pricing and bonuses.']
                    ] as $feature)
                        <div class="text-center space-y-6">
                            <div class="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-purple-500 mx-auto shadow-xl">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $feature['icon'] }}"></path></svg>
                            </div>
                            <h3 class="text-2xl font-black text-white uppercase tracking-tight">{{ $feature['title'] }}</h3>
                            <p class="text-gray-500 text-sm leading-relaxed font-medium px-6">{{ $feature['desc'] }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</x-store-layout>
