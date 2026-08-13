@extends('layouts.store')

@section('content')
        <!-- GT Breadcrumb Section Start -->
        <div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('assets/user/img/breadcrumb.png') }}'); padding: 80px 0;">
            <div class="gt-left-shape">
                <img src="{{ asset('assets/user/img/shape-1.png') }}" alt="img" style="max-height: 200px;">
            </div>
            <div class="gt-right-shape">
                <img src="{{ asset('assets/user/img/shape-2.png') }}" alt="img" style="max-height: 200px;">
            </div>
            <div class="gt-blur-shape">
                <img src="{{ asset('assets/user/img/breadcrumb-shape.png') }}" alt="img">
            </div>
            <div class="container">
                <div class="gt-page-heading" style="margin-top: 0;">
                    <div class="gt-breadcrumb-sub-title">
                        <h1 class="wow fadeInUp" data-wow-delay=".3s" style="font-size: 40px; text-transform: uppercase;">{{ $game->name }} Shop</h1>
                    </div>
                    <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                        <li>
                            <i class="fa-solid fa-house"></i>
                        </li>
                        <li>
                            <a href="{{ route('home') }}">home :</a>
                        </li>
                        <li>
                            <a href="{{ route('games.index') }}">games :</a>
                        </li>
                        <li class="color">{{ $game->name }}</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Player ID Verification Section -->
        <section class="checkout-section section-padding pb-0 fix">
            <div class="container">
                <div class="checkout-single-wrapper">
                    <div class="checkout-single boxshado-single" style="position: relative; overflow: hidden; padding: 40px;">
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
                                default => null
                            };
                            $bgImage = $folder ? asset("assets/user/img/games/{$folder}/{$filename}") : null;
                        @endphp
                        
                        @if($bgImage)
                            <div style="position: absolute; top: 0; right: 0; width: 40%; height: 100%; opacity: 0.1; pointer-events: none; display: flex; justify-content: flex-end; align-items: center; padding-right: 20px;">
                                <img src="{{ $bgImage }}" alt="" style="max-height: 200px; object-fit: contain; object-position: right;">
                            </div>
                        @endif

                        <div class="row align-items-center g-4" style="position: relative; z-index: 10;">
                            <div class="col-lg-6" id="input_section">
                                <h4 style="color: #fff; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">1. ENTER PLAYER ID</h4>
                                <div class="d-flex flex-wrap gap-3">
                                    <input type="text" id="game_uid" placeholder="Enter your {{ $game->name }} ID" style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 15px 20px; color: #fff; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='var(--theme)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                                    <button id="verify_uid" class="gt-theme-btn" style="min-width: 160px;">
                                        <span class="btn-text">Verify Player</span>
                                        <span class="btn-spinner" style="display: none;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</span>
                                    </button>
                                </div>
                                <div id="verify_error" style="display: none; color: #dc3545; font-size: 14px; margin-top: 10px; font-weight: 600;"><i class="fa-solid fa-circle-exclamation"></i> <span>Error message</span></div>
                            </div>
                            <div class="col-lg-6">
                                <div id="verification_result" style="display: none; background: rgba(25, 135, 84, 0.1); border: 1px solid rgba(25, 135, 84, 0.2); border-radius: 10px; padding: 20px; align-items: center; gap: 15px;">
                                    <div style="width: 50px; height: 50px; background: #198754; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff;">
                                        <i class="fa-solid fa-check" style="font-size: 20px;"></i>
                                    </div>
                                    <div>
                                        <p style="font-size: 11px; color: #198754; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 5px 0;">Player Verified</p>
                                        <h4 id="player_nickname" style="color: #fff; font-weight: 900; text-transform: uppercase; margin: 0;">---</h4>
                                    </div>
                                </div>

                                <div id="confirmation_card" style="display: none; background: rgba(255,255,255,0.05); border: 1px solid var(--theme); border-radius: 10px; padding: 25px;">
                                    <h5 style="color: var(--theme); font-weight: 900; text-transform: uppercase; margin-bottom: 15px;"><i class="fa-solid fa-circle-question"></i> Is this your account?</h5>
                                    
                                    <div class="d-flex align-items-center gap-3 mb-4">
                                        <div id="confirm_avatar" style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                            <i class="fa-solid fa-user" style="font-size: 24px; color: rgba(255,255,255,0.5);"></i>
                                        </div>
                                        <div>
                                            <h4 id="confirm_name" style="color: #fff; font-weight: 900; text-transform: uppercase; margin: 0; font-size: 18px;">Player Name</h4>
                                            <div style="display: flex; gap: 15px; margin-top: 5px; font-size: 13px; color: #aaa;">
                                                <span><i class="fa-solid fa-star" style="color: #ffc107;"></i> Lvl: <span id="confirm_level" style="color: #fff;">--</span></span>
                                                <span><i class="fa-solid fa-earth-americas" style="color: #0dcaf0;"></i> <span id="confirm_region" style="color: #fff;">--</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-flex gap-2">
                                        <button id="btn_yes_proceed" class="gt-theme-btn" style="flex: 1; font-size: 12px; padding: 12px;">YES, PROCEED</button>
                                        <button id="btn_no_change" class="gt-theme-btn" style="flex: 1; font-size: 12px; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff;">NO, CHANGE ID</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- GT Shop Section Start -->
        <section class="gt-shop-section section-padding fix mb-4">
            <div class="container">
                <div class="gt-section-title-2 mb-5">
                    <h6 class="subtitle text-uppercase tx-subTitle">2. Select Topup Pack</h6>
                    <h2 class="tx-title sec_title" style="text-transform: uppercase;">Available Packages</h2>
                </div>
                <div class="row g-4">
                    @if(isset($packages) && count($packages) > 0)
                        @foreach($packages as $package)
                            <div class="col-xl-3 col-lg-4 col-md-6">
                                <div class="gt-shop-card-item gt-style-2 mt-0" style="border: 1px solid rgba(255,255,255,0.05); transition: 0.3s;" onmouseover="this.style.borderColor='var(--theme)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                                    <div class="gt-shop-image p-4 d-flex justify-content-center" style="position: relative;">
                                        <img src="{{ asset('assets/user/img/home-2/diamond.svg') }}" alt="{{ $package->package_name }}" style="width: 80px; height: 80px; object-fit: contain; transition: transform 0.3s;">
                                    </div>
                                    <div class="gt-shop-content text-center" style="padding: 20px;">
                                        <h5 style="text-transform: uppercase;">
                                            <a href="#">{{ $package->package_name }}</a>
                                        </h5>
                                        <p style="color: var(--theme); font-weight: 900; font-size: 22px; font-style: italic; margin-bottom: 20px;">LKR {{ number_format($package->getPriceForUser(), 2) }}</p>
                                        
                                        <form action="{{ route('freefire.checkout') }}" method="POST" class="paypal-checkout-form cart-form">
                                            @csrf
                                            <input type="hidden" name="free_fire_uid" class="product-game-uid">
                                            <input type="hidden" name="package_id" value="{{ $package->id }}">
                                            
                                            <div class="mb-3 text-start">
                                                <select name="payment_method" class="form-select w-100" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:11px; padding:10px; font-weight: bold; text-transform: uppercase;" required>
                                                    <option value="paypal" style="color:#000;">PayPal</option>
                                                    <option value="bank_transfer" style="color:#000;">Bank Transfer</option>
                                                </select>
                                            </div>

                                            <button type="submit" class="gt-theme-btn w-100 py-3" style="font-size: 11px; letter-spacing: 2px;">
                                                PAY NOW
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    @else
                        @forelse($products as $product)
                            <div class="col-xl-3 col-lg-4 col-md-6">
                                <div class="gt-shop-card-item gt-style-2 mt-0" style="border: 1px solid rgba(255,255,255,0.05); transition: 0.3s;" onmouseover="this.style.borderColor='var(--theme)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                                    <div class="gt-shop-image p-4 d-flex justify-content-center" style="position: relative;">
                                        @php
                                            $gameSlug = strtolower(str_replace(' ', '-', $game->name));
                                            $folder = match(true) {
                                                str_contains($gameSlug, 'free-fire') => 'ff',
                                                str_contains($gameSlug, 'pubg') => 'pubg',
                                                str_contains($gameSlug, 'mobile-legends') => 'ml',
                                                default => null
                                            };
                                            // Product specific image if available, else generic diamond
                                            $productImage = $product->image_path ? asset('storage/' . $product->image_path) : asset('assets/user/img/home-2/diamond.svg');
                                        @endphp
                                        <img src="{{ $productImage }}" alt="{{ $product->name }}" style="width: 80px; height: 80px; object-fit: contain; transition: transform 0.3s;">
                                        
                                        <ul class="gt-shop-icon d-grid justify-content-center align-items-center">
                                            <li>
                                                <form action="{{ route('cart.store', $product) }}" method="POST" class="cart-form">
                                                    @csrf
                                                    <input type="hidden" name="game_uid" class="product-game-uid">
                                                    <button type="submit" style="padding: 0; border: none; background: transparent;">
                                                        <i class="far fa-shopping-cart"></i>
                                                    </button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="gt-shop-content text-center" style="padding: 20px;">
                                        <h5 style="text-transform: uppercase;">
                                            <a href="#">{{ $product->name }}</a>
                                        </h5>
                                        <p style="color: var(--theme); font-weight: 900; font-size: 22px; font-style: italic; margin-bottom: 20px;">LKR {{ number_format($product->price, 2) }}</p>
                                        
                                        <form action="{{ route('cart.store', $product) }}" method="POST" class="cart-form">
                                            @csrf
                                            <input type="hidden" name="game_uid" class="product-game-uid">
                                            <button type="submit" class="gt-theme-btn w-100 py-3" style="font-size: 11px; letter-spacing: 2px;">
                                                ADD TO CART
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @empty
                            <div class="col-12 text-center py-5">
                                <h3 style="color: #666; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">No packages available for this game yet.</h3>
                            </div>
                        @endforelse
                    @endif
                </div>
            </div>
        </section>

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const uidInput = document.getElementById('game_uid');
        const verifyBtn = document.getElementById('verify_uid');
        const btnText = verifyBtn.querySelector('.btn-text');
        const btnSpinner = verifyBtn.querySelector('.btn-spinner');
        
        const inputSection = document.getElementById('input_section');
        const verifyError = document.getElementById('verify_error');
        const verifyErrorText = verifyError.querySelector('span');

        const resultDiv = document.getElementById('verification_result');
        const nicknameText = document.getElementById('player_nickname');
        
        const confirmCard = document.getElementById('confirmation_card');
        const confirmName = document.getElementById('confirm_name');
        const confirmLevel = document.getElementById('confirm_level');
        const confirmRegion = document.getElementById('confirm_region');
        const confirmAvatar = document.getElementById('confirm_avatar');
        
        const btnYes = document.getElementById('btn_yes_proceed');
        const btnNo = document.getElementById('btn_no_change');

        const productUidInputs = document.querySelectorAll('.product-game-uid');
        const cartForms = document.querySelectorAll('.cart-form');

        let isVerified = false;
        let verifiedUid = '';

        verifyBtn.addEventListener('click', async function() {
            const uid = uidInput.value.trim();
            verifyError.style.display = 'none';

            if (!uid) {
                verifyErrorText.innerText = 'Please enter your Player ID first';
                verifyError.style.display = 'block';
                return;
            }

            // Show loading
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
            verifyBtn.disabled = true;
            uidInput.disabled = true;

            try {
                const response = await fetch(`/api/verify-player/{{ $game->slug }}/${uid}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Player not found. Please check your ID');
                }

                // API Success, show confirmation card
                inputSection.style.display = 'none';
                
                confirmName.innerText = data.data.nickname;
                confirmLevel.innerText = data.data.level;
                confirmRegion.innerText = data.data.region;
                if (data.data.avatar) {
                    confirmAvatar.innerHTML = `<img src="${data.data.avatar}" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    confirmAvatar.innerHTML = `<i class="fa-solid fa-user" style="font-size: 24px; color: rgba(255,255,255,0.5);"></i>`;
                }

                verifiedUid = uid;
                confirmCard.style.display = 'block';

            } catch (error) {
                verifyErrorText.innerText = error.message;
                verifyError.style.display = 'block';
            } finally {
                // Restore loading
                btnText.style.display = 'inline-block';
                btnSpinner.style.display = 'none';
                verifyBtn.disabled = false;
                uidInput.disabled = false;
            }
        });

        btnNo.addEventListener('click', function() {
            confirmCard.style.display = 'none';
            inputSection.style.display = 'block';
            uidInput.value = '';
            uidInput.focus();
            isVerified = false;
            verifiedUid = '';
            productUidInputs.forEach(input => input.value = '');
        });

        btnYes.addEventListener('click', function() {
            confirmCard.style.display = 'none';
            resultDiv.style.display = 'flex';
            inputSection.style.display = 'block'; 
            
            // Lock input and hide verify button
            uidInput.disabled = true;
            verifyBtn.style.display = 'none';

            nicknameText.innerText = confirmName.innerText;
            
            isVerified = true;
            
            // Update hidden inputs in all product forms
            productUidInputs.forEach(input => {
                input.value = verifiedUid;
            });
        });

        // Prevent adding to cart if UID is not verified
        cartForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!isVerified) {
                    e.preventDefault();
                    alert('Please verify your Player ID before adding to cart!');
                    if (inputSection.style.display !== 'none') {
                        uidInput.focus();
                    }
                }
            });
        });

        // Sync UID if manually changed
        uidInput.addEventListener('input', function() {
            const val = this.value.trim();
            productUidInputs.forEach(input => {
                input.value = val;
            });
            
            if (isVerified && val !== verifiedUid) {
                // if they changed it after verified?
                // we disabled it, so they shouldn't be able to.
            }
        });
    });
</script>
@endpush
@endsection
