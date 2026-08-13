<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.users.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Users Directory</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Create User Account</h2>
        <p class="text-gray-400 text-sm mt-1">Register a new user account with role permissions.</p>
    </div>

    <div class="max-w-2xl glass-card rounded-2xl border border-white/10 shadow-2xl p-8">
        <form action="{{ route('admin.users.store') }}" method="POST" class="space-y-6">
            @csrf
            
            <div>
                <label for="name" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" placeholder="e.g. John Doe" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                @error('name') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div>
                <label for="email" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" placeholder="name@domain.com" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                @error('email') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div>
                <label for="role" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Role & Privileges</label>
                <select name="role" id="role" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    <option value="user" {{ old('role') === 'user' ? 'selected' : '' }} class="bg-gray-900 text-white">Customer Account</option>
                    <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }} class="bg-gray-900 text-white">Administrator Account</option>
                </select>
                @error('role') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="password" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Password</label>
                    <input type="password" name="password" id="password" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    @error('password') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label for="password_confirmation" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                </div>
            </div>

            <div class="pt-6 border-t border-white/10">
                <button type="submit" class="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Create User Account
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>

