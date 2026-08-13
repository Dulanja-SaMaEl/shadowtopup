<x-admin-layout>
    <div class="mb-10">
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Reseller Management</h2>
        <p class="text-gray-400 text-sm mt-1">Review reseller tier applications and manage active Silver/Gold subscriptions.</p>
    </div>

    <!-- Pending Applications -->
    <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Pending Tier Applications
            </h3>
            <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[10px] font-mono font-bold">{{ $pendingApplications->count() }} Requests</span>
        </div>

        <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            @if($pendingApplications->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-amber-500/10 text-[11px] text-amber-300 font-bold uppercase tracking-widest border-b border-amber-500/20">
                        <tr>
                            <th class="px-6 py-4">Applicant</th>
                            <th class="px-6 py-4">Requested Tier</th>
                            <th class="px-6 py-4">Applied</th>
                            <th class="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                        @foreach($pendingApplications as $user)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                                        {{ strtoupper(substr($user->name, 0, 1)) }}
                                    </div>
                                    <div>
                                        <span class="font-bold text-white block">{{ $user->name }}</span>
                                        <span class="text-[10px] text-gray-400 font-mono">{{ $user->email }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {{ $user->requested_tier }} Tier
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs text-gray-400 font-mono">
                                {{ $user->updated_at->diffForHumans() }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <form action="{{ route('admin.resellers.approve', $user) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-emerald-600/20">Approve</button>
                                    </form>
                                    <form action="{{ route('admin.resellers.reject', $user) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="px-4 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition">Reject</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div class="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                No pending reseller applications at this time.
            </div>
            @endif
        </div>
    </div>

    <!-- Active Gold Resellers -->
    <div class="mb-10">
        <h3 class="text-sm font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a.75.75 0 01.673.418l2.13 4.316 4.764.692a.75.75 0 01.416 1.279l-3.447 3.36.814 4.746a.75.75 0 01-1.088.79l-4.262-2.24-4.262 2.24a.75.75 0 01-1.088-.79l.814-4.746-3.447-3.36a.75.75 0 01.416-1.279l4.764-.692 2.13-4.316A.75.75 0 0110 2z" clip-rule="evenodd"></path></svg>
            Gold Tier Resellers
        </h3>
        <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            @if($goldResellers->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th class="px-6 py-4">User</th>
                            <th class="px-6 py-4">Subscription Expires</th>
                            <th class="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                        @foreach($goldResellers as $user)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <span class="font-bold text-white block">{{ $user->name }}</span>
                                <span class="text-[10px] text-gray-400 font-mono">{{ $user->email }}</span>
                            </td>
                            <td class="px-6 py-4 font-mono font-bold text-amber-400">
                                {{ $user->reseller_expires_at ? $user->reseller_expires_at->format('M d, Y') : 'Lifetime' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <form action="{{ route('admin.resellers.demote', $user) }}" method="POST" onsubmit="return confirm('Demote this reseller to standard customer account?')">
                                    @csrf
                                    <button type="submit" class="px-4 py-2 bg-white/5 hover:bg-rose-600/20 text-gray-300 hover:text-rose-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition">Demote</button>
                                </form>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div class="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                No active Gold tier resellers found.
            </div>
            @endif
        </div>
    </div>

    <!-- Active Silver Resellers -->
    <div class="mb-10">
        <h3 class="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a.75.75 0 01.673.418l2.13 4.316 4.764.692a.75.75 0 01.416 1.279l-3.447 3.36.814 4.746a.75.75 0 01-1.088.79l-4.262-2.24-4.262 2.24a.75.75 0 01-1.088-.79l.814-4.746-3.447-3.36a.75.75 0 01.416-1.279l4.764-.692 2.13-4.316A.75.75 0 0110 2z" clip-rule="evenodd"></path></svg>
            Silver Tier Resellers
        </h3>
        <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            @if($silverResellers->count() > 0)
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th class="px-6 py-4">User</th>
                            <th class="px-6 py-4">Subscription Expires</th>
                            <th class="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                        @foreach($silverResellers as $user)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <span class="font-bold text-white block">{{ $user->name }}</span>
                                <span class="text-[10px] text-gray-400 font-mono">{{ $user->email }}</span>
                            </td>
                            <td class="px-6 py-4 font-mono font-bold text-cyan-400">
                                {{ $user->reseller_expires_at ? $user->reseller_expires_at->format('M d, Y') : 'Lifetime' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <form action="{{ route('admin.resellers.demote', $user) }}" method="POST" onsubmit="return confirm('Demote this reseller to standard customer account?')">
                                    @csrf
                                    <button type="submit" class="px-4 py-2 bg-white/5 hover:bg-rose-600/20 text-gray-300 hover:text-rose-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition">Demote</button>
                                </form>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div class="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                No active Silver tier resellers found.
            </div>
            @endif
        </div>
    </div>
</x-admin-layout>

