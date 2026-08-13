@extends('layouts.store')

@section('content')
<div class="container py-5 mt-5">
    <div class="mb-5 text-center">
        <h2 class="text-3xl font-black text-white uppercase tracking-wider">Account Profile</h2>
        <p class="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">Manage your account details and security settings</p>
    </div>

    <div class="row g-4 justify-content-center">
        <div class="col-lg-6">
            <div class="p-4 p-md-5 rounded-4 border border-white/10 bg-[#0c0818] shadow-2xl">
                @include('profile.partials.update-profile-information-form')
            </div>
        </div>

        <div class="col-lg-6">
            <div class="p-4 p-md-5 rounded-4 border border-white/10 bg-[#0c0818] shadow-2xl">
                @include('profile.partials.update-password-form')
            </div>
        </div>

        <div class="col-lg-12">
            <div class="p-4 p-md-5 rounded-4 border border-rose-500/20 bg-rose-500/5 shadow-2xl">
                @include('profile.partials.delete-user-form')
            </div>
        </div>
    </div>
</div>
@endsection

