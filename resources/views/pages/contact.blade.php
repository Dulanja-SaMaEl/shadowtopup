<x-store-layout>
    <div class="max-w-4xl mx-auto py-20 px-6">
        <h1 class="text-5xl font-black text-white uppercase tracking-tighter mb-12">Contact <span class="text-purple-500">Us</span></h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="glass-card p-10 space-y-8">
                <div>
                    <h3 class="text-white font-bold text-lg mb-2">Get in touch</h3>
                    <p class="text-gray-400 text-sm">Have any questions? We'd love to hear from you.</p>
                </div>

                <div class="space-y-6">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Email</p>
                            <p class="text-white font-bold">support@shadowstore.com</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">WhatsApp</p>
                            <p class="text-white font-bold">+1 234 567 890</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card p-10">
                <form action="#" class="space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Name</label>
                        <input type="text" class="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white focus:ring-purple-500 focus:border-purple-500 transition" placeholder="John Doe">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Email</label>
                        <input type="email" class="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white focus:ring-purple-500 focus:border-purple-500 transition" placeholder="john@example.com">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Message</label>
                        <textarea rows="4" class="w-full bg-white/5 border-white/10 rounded-2xl py-4 px-6 text-white focus:ring-purple-500 focus:border-purple-500 transition" placeholder="How can we help?"></textarea>
                    </div>
                    <button type="button" class="w-full py-4 bg-purple-600 rounded-2xl font-bold text-white hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 uppercase tracking-widest">Send Message</button>
                </form>
            </div>
        </div>
    </div>
</x-store-layout>
