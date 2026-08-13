<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.users.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Users Directory</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Edit User: <span class="text-purple-400">{{ $user->name }}</span></h2>
        <p class="text-gray-400 text-sm mt-1">Update profile info, role permissions, and access credentials.</p>
    </div>

    <div class="max-w-2xl glass-card rounded-2xl border border-white/10 shadow-2xl p-8">
        <form action="{{ route('admin.users.update', $user) }}" method="POST" class="space-y-6">
            @csrf
            @method('PUT')
            
            <div>
                <label for="name" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $user->name) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                @error('name') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div>
                <label for="email" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input type="email" name="email" id="email" value="{{ old('email', $user->email) }}" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                @error('email') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div>
                <label for="role" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Role & Privileges</label>
                <select name="role" id="role" required class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    <option value="user" {{ old('role', $user->role) === 'user' ? 'selected' : '' }} class="bg-gray-900 text-white">Customer Account</option>
                    <option value="admin" {{ old('role', $user->role) === 'admin' ? 'selected' : '' }} class="bg-gray-900 text-white">Administrator Account</option>
                </select>
                @error('role') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
            </div>

            <div class="pt-6 border-t border-white/10">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Change Password <span class="text-gray-500 normal-case font-normal">(Leave blank to keep current)</span></h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="password" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                        <input type="password" name="password" id="password" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                        @error('password') <p class="mt-1.5 text-xs text-rose-400 font-bold">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label for="password_confirmation" class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                        <input type="password" name="password_confirmation" id="password_confirmation" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    </div>
                </div>
            </div>

            <div class="pt-4">
                <button type="submit" class="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Update Account Details
                </button>
            </div>
        </form>
        
        <form action="{{ route('admin.users.destroy', $user) }}" method="POST" class="mt-4" onsubmit="return confirm('Are you sure you want to delete this user? This action cannot be undone.')">
            @csrf
            @method('DELETE')
            <button type="submit" class="w-full py-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 hover:border-rose-500/40 transition">
                Delete User Permanently
            </button>
        </form>
    </div>
</x-admin-layout>

