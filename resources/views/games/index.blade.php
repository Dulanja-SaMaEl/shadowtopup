@extends('layouts.store')

@section('content')
        <!-- GT Breadcrumb Section Start -->
        <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('assets/user/img/breadcrumb.png') }}');">
            <div class="gt-left-shape">
                <img src="{{ asset('assets/user/img/shape-1.png') }}" alt="img">
            </div>
            <div class="gt-right-shape">
                <img src="{{ asset('assets/user/img/shape-2.png') }}" alt="img">
            </div>
            <div class="gt-blur-shape">
                <img src="{{ asset('assets/user/img/breadcrumb-shape.png') }}" alt="img">
            </div>
            <div class="container">
                <div class="gt-page-heading">
                    <div class="gt-breadcrumb-sub-title">
                        <h1 class="wow fadeInUp" data-wow-delay=".3s">All Games</h1>
                    </div>
                    <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                        <li>
                            <i class="fa-solid fa-house"></i>
                        </li>
                        <li>
                            <a href="{{ route('home') }}">home :</a>
                        </li>
                        <li class="color">games</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Games List Section -->
        <section class="gt-popular-game-section section-padding">
            <div class="container">
                <div class="gt-section-title-2 text-center mb-5">
                    <h6 class="subtitle text-uppercase tx-subTitle">Available Titles</h6>
                    <h2 class="tx-title sec_title">CHOOSE YOUR FAVORITE GAME</h2>
                </div>
                <div class="row g-4">
                    @foreach($games as $game)
                        <div class="col-xl-4 col-lg-6 col-md-6">
                            <div class="gt-popular-game-items cursor-pointer" onclick="window.location.href='{{ route('games.show', $game) }}'">
                                <div class="gt-thumb">
                                    @php
                                        $gameSlug = strtolower(str_replace(' ', '-', $game->name));
                                        // User specified folders: ff, pubg, ml
                                        $folder = match(true) {
                                            str_contains($gameSlug, 'free-fire') => 'ff',
                                            str_contains($gameSlug, 'pubg') => 'pubg',
                                            str_contains($gameSlug, 'mobile-legends') => 'ml',
                                            default => null
                                        };
                                        $filename = match($folder) {
                                            'ff' => 'ff-1.jpg',
                                            'pubg' => 'pubg-1.jpg',
                                            'ml' => 'ml-1.png',
                                            default => 'logo.jpg'
                                        };
                                        $gameImage = $folder ? "assets/user/img/games/{$folder}/{$filename}" : "assets/user/img/games/{$gameSlug}.jpg";
                                        $fallbackImage = "storage/{$game->image}";
                                    @endphp
                                    <img src="{{ ($folder && file_exists(public_path($gameImage))) || file_exists(public_path($gameImage)) ? asset($gameImage) : asset($fallbackImage) }}" 
                                        alt="{{ $game->name }}" style="height: 400px; object-fit: cover;">
                                    <div class="gt-content">
                                        <a href="{{ route('games.show', $game) }}" class="post-cat">TOPUP NOW</a>
                                        <h3><a href="{{ route('games.show', $game) }}">{{ $game->name }}</a></h3>
                                    </div>
                                </div>
                                <div class="app-store">
                                    <a href="{{ route('games.show', $game) }}" class="gt-theme-btn w-100 text-center">
                                        SELECT GAME
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
@endsection
