@extends('layouts.store')

@section('content')
        <section class="gt-hero-section-2 parallaxie gt-hero-2" style="background-image: url('{{ asset('assets/user/img/home-2/hero/hero-bg.jpg') }}');">
            <div class="container">
                <div class="row g-4 align-items-center">
                    <div class="col-xxl-4 col-xl-5 col-lg-5 order-2 order-lg-1">
                        <div class="gt-hero-image wow animated-image">
                            <img src="{{ asset('assets/user/img/home-2/hero/hero-01.png') }}" alt="img">
                        </div>
                    </div>
                    <div class="col-xxl-8 col-xl-7 col-lg-7 order-1 order-lg-2">
                        <div class="gt-hero-content">
                            <h6 class="subtitle tz-sub-tilte tz-sub-anim  text-uppercase tx-subTitle">your ultimate live gaming world . . .</h6>
                            <h1 class="tx-title sec_title  tz-itm-title tz-itm-anim">
                                FASTEST & SECURE <br>
                                <span>GAME TOPUP</span> STORE
                            </h1>
                            <p class="wow fadeInUp" data-wow-delay=".3s">
                                Get your game credits instantly. We support PUBG, Free Fire, Mobile Legends and more with the most reliable manual bank transfer system.
                            </p>
                            <div class="gt-hero-button wow fadeInUp" data-wow-delay=".5s">
                                <a href="#games" class="gt-theme-btn">
                                    TOPUP NOW
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- GT Brand Section Start -->
       <div class="gt-brand-section section-padding fix">
            <div class="container">
                <div class="swiper gt-brand-slider">
                    <div class="swiper-wrapper">
                        @foreach(['b-1.png', 'b-2.png', 'b-3.png', 'b-4.png', 'b-5.png', 'b-6.png'] as $brand)
                        <div class="swiper-slide">
                            <div class="gt-brand-box">
                                <div class="gt-brand-image text-center">
                                    <img src="{{ asset('assets/user/img/home-1/brand/' . $brand) }}" alt="img">
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
        
        <section id="games" class="gt-popular-game-section section-padding pt-0">
            <div class="bg-shape">
                <img src="{{ asset('assets/user/img/home-2/popular-game/bg-shape.png') }}" alt="img">
            </div>
            <div class="container">
                <div class="gt-section-title-2 text-center">
                    <h6 class="subtitle tz-sub-tilte tz-sub-anim  text-uppercase tx-subTitle">Available Games</h6>
                    <h2 class="tx-title sec_title  tz-itm-title tz-itm-anim">
                        SELECT YOUR GAME
                    </h2>
                </div>
                <div class="row g-4 mt-5">
                    @foreach($games as $game)
                        <div class="col-xl-4 col-lg-6 col-md-6">
                            <div class="gt-popular-game-items cursor-pointer" onclick="window.location.href='{{ route('games.show', $game) }}'">
                                <div class="gt-thumb">
                                    @php
                                        $gameSlug = strtolower(str_replace(' ', '-', $game->name));
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
                                    <img src="{{ ($folder && file_exists(public_path($gameImage))) || file_exists(public_path($gameImage)) ? asset($gameImage) : asset($fallbackImage) }}" alt="{{ $game->name }}" style="height: 400px; object-fit: cover;">
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

        <!-- GT Trending Game Section Start -->
        <section class="gt-trending-match section-padding" style="position: relative;">
            <div style="position: absolute; inset: 0; background: rgba(9, 5, 20, 0.85); backdrop-filter: blur(5px); z-index: 10; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <h2 style="color: #ff00ff; font-size: 3rem; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 20px rgba(255,0,255,0.5);">Coming Soon</h2>
                <p style="color: #fff; font-size: 1.2rem; margin-top: 10px;">Our trending matches feature is currently under development.</p>
            </div>
            <div class="gt-left-shape">
                <img src="{{ asset('assets/user/img/home-2/match/left-shape.png') }}" alt="img">
            </div>
            <div class="container">
                <div class="gt-section-title-area">
                    <div class="gt-section-title-2 mb-0">
                        <h6 class="subtitle tz-sub-tilte tz-sub-anim  text-uppercase tx-subTitle">big bang matched</h6>
                        <h2 class="tx-title sec_title  tz-itm-title tz-itm-anim">
                            TRENDING MATCHES
                        </h2>
                    </div>
                </div>
                <div class="tab-content">
                    <div id="all" class="tab-pane fade show active">
                        @foreach([['01','02'], ['03','04'], ['05','06'], ['07','08']] as $match)
                        <div class="gt-trending-match-items top_view_2 item-hover">
                            <div class="gt-match-logo">
                                <img src="{{ asset('assets/user/img/home-2/match/match-' . $match[0] . '.jpg') }}" alt="img" class="gt-match-thumb">
                                <img src="{{ asset('assets/user/img/home-2/match/vs.png') }}" alt="img">
                                <img src="{{ asset('assets/user/img/home-2/match/match-' . $match[1] . '.jpg') }}" alt="img" class="gt-match-thumb">
                            </div>
                            <div class="gt-match-content">
                                <ul class="gt-date-list">
                                    <li><i class="fa-light fa-calendar"></i>30 May, 2025</li>
                                    <li><i class="fa-regular fa-clock"></i>10:00 am - 12:30 pm</li>
                                </ul>
                                <h3><a href="#">Aggressive & War-Themed</a></h3>
                                <p>A game studio crafting exciting, high-quality video immersive gameplay and mechanics.</p>
                            </div>
                            <div class="gt-watch-now-items">
                                <span>Watch live on</span>
                                <ul class="gt-watch-now-list">
                                    <li><a href="#"><i class="fa-brands fa-youtube"></i> you tube</a></li>
                                    <li><a href="#"><i class="fa-brands fa-twitch"></i> twitch</a></li>
                                </ul>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </section>

        <!-- Legendary Teams Section Start -->
        <section class="gt-team-section-3 section-padding pt-0" style="position: relative;">
            <div style="position: absolute; inset: 0; background: rgba(9, 5, 20, 0.85); backdrop-filter: blur(5px); z-index: 10; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <h2 style="color: #8b5cf6; font-size: 3rem; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 0 20px rgba(139,92,246,0.5);">Coming Soon</h2>
                <p style="color: #fff; font-size: 1.2rem; margin-top: 10px;">Our eSports teams feature is currently under development.</p>
            </div>
            <div class="container">
                <div class="gt-section-title-2 text-center">
                    <h6 class="subtitle tz-sub-tilte tz-sub-anim text-uppercase tx-subTitle">Our Legendary Teams</h6>
                    <h2 class="tx-title sec_title tz-itm-title tz-itm-anim">
                        CHAMPIONS OF SHADOW
                    </h2>
                </div>
                <div class="swiper gt-team-slider-3 mt-5">
                    <div class="swiper-wrapper">
                        @foreach([['team-1.jpg', 'Shadow Elite'], ['team-2.jpg', 'Midnight Warriors'], ['team-3.jpg', 'Phantom Strikers'], ['team-4.jpg', 'Legendary Kings'], ['team-5.jpg', 'Ghost Squad'], ['team-6.jpg', 'Titan Gamers']] as $team)
                        <div class="swiper-slide">
                            <div class="gt-team-card-item">
                                <div class="gt-team-image">
                                    <img src="{{ asset('assets/user/img/home-1/team/' . $team[0]) }}" alt="img">
                                    <div class="gt-team-content">
                                        <div class="gt-social-icon">
                                            <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                                            <a href="#"><i class="fa-brands fa-twitter"></i></a>
                                            <a href="#"><i class="fa-brands fa-instagram"></i></a>
                                        </div>
                                        <h3><a href="#">{{ $team[1] }}</a></h3>
                                        <span>Professional Team</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </section>
@endsection
