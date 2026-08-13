<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="user-role" content="{{ Auth::check() ? Auth::user()->role : '' }}">

    <title>{{ config('app.name', 'ShadowTopUp') }}</title>

    <!--<< Favcion >>-->
    <link rel="shortcut icon" href="{{ asset('assets/user/img/favicon.svg') }}">
    <!--<< Bootstrap min.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/bootstrap.min.css') }}">
    <!--<< All Min Css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/all.min.css') }}">
    <!--<< Animate.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/animate.css') }}">
    <!--<< Magnific Popup.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/magnific-popup.css') }}">
    <!--<< MeanMenu.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/meanmenu.css') }}">
    <!--<< Swiper Bundle.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/swiper-bundle.min.css') }}">
    <!--<< Nice Select.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/nice-select.css') }}">
    <!--<< Main.css >>-->
    <link rel="stylesheet" href="{{ asset('assets/user/css/main.css') }}">

    <style>
        #header-sticky {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 999;
            background: rgba(7, 4, 15, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gt-breadcrumb-wrapper {
            padding-top: 140px !important;
        }
        .cursor-pointer {
            cursor: pointer;
        }
        .gt-popular-game-items .gt-thumb img {
            max-height: 220px;
            width: 100%;
            object-fit: cover;
        }
        .gt-shop-card-item .gt-shop-image img {
            max-height: 120px;
            object-fit: contain;
        }
    </style>

    @stack('styles')
</head>
<body>
    <!-- Preloader Start -->
    <div id="preloader" class="preloader">
        <div class="animation-preloader">
            <div class="spinner"></div>
            <div class="txt-loading">
                <span data-text-preloader="S" class="letters-loading">S</span>
                <span data-text-preloader="H" class="letters-loading">H</span>
                <span data-text-preloader="A" class="letters-loading">A</span>
                <span data-text-preloader="D" class="letters-loading">D</span>
                <span data-text-preloader="O" class="letters-loading">O</span>
                <span data-text-preloader="W" class="letters-loading">W</span>
            </div>
            <p class="text-center">Loading</p>
        </div>
        <div class="loader">
            <div class="row">
                <div class="col-3 loader-section section-left"><div class="bg"></div></div>
                <div class="col-3 loader-section section-left"><div class="bg"></div></div>
                <div class="col-3 loader-section section-right"><div class="bg"></div></div>
                <div class="col-3 loader-section section-right"><div class="bg"></div></div>
            </div>
        </div>
    </div>

    <!-- GT MouseCursor Start -->
    <div class="mouseCursor cursor-outer"></div>
    <div class="mouseCursor cursor-inner"></div>

    <!-- Offcanvas Area Start -->
    <div class="fix-area">
        <div class="offcanvas__info">
            <div class="offcanvas__wrapper">
                <div class="offcanvas__content">
                    <div class="offcanvas__top mb-5 d-flex justify-content-between align-items-center">
                        <div class="offcanvas__logo">
                            <a href="{{ route('home') }}">
                                <img src="{{ asset('assets/user/img/logo/logo.png') }}" alt="logo-img" style="max-height: 150px; width: auto; object-fit: contain;">
                            </a>
                        </div>
                        <div class="offcanvas__close">
                            <button>
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mobile-menu fix mb-3"></div>
                    @auth
                        <div class="offcanvas__contact mb-4">
                            <h4 class="text-purple-500 italic">User Session</h4>
                            <ul>
                                <li class="d-flex align-items-center">
                                    <div class="offcanvas__contact-icon">
                                        <i class="fal fa-user"></i>
                                    </div>
                                    <div class="offcanvas__contact-text">
                                        <a href="{{ route('dashboard') }}">{{ Auth::user()->name }}</a>
                                    </div>
                                </li>
                                <li class="d-flex align-items-center mt-2">
                                    <form method="POST" action="{{ route('logout') }}" id="logout-form-offcanvas">
                                        @csrf
                                        <button type="submit" class="text-red-500 font-black uppercase text-[10px] tracking-widest bg-transparent border-none p-0">
                                            <i class="fal fa-sign-out-alt mr-2"></i> Sign Out
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    @endauth
                    <div class="offcanvas__contact">
                        <h4>Contact Info</h4>
                        <ul>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon mr-15">
                                    <i class="fal fa-envelope"></i>
                                </div>
                                <div class="offcanvas__contact-text">
                                    <a href="mailto:support@shadowstore.com">support@shadowstore.com</a>
                                </div>
                            </li>
                            <li class="d-flex align-items-center">
                                <div class="offcanvas__contact-icon mr-15">
                                    <i class="fal fa-clock"></i>
                                </div>
                                <div class="offcanvas__contact-text">
                                    <a href="#">24/7 Support Available</a>
                                </div>
                            </li>
                        </ul>
                        <div class="social-icon d-flex align-items-center">
                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                            <a href="#"><i class="fab fa-twitter"></i></a>
                            <a href="#"><i class="fab fa-youtube"></i></a>
                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="offcanvas__overlay"></div>

    <!-- GT Search Start -->
    <div class="search-popup">
        <div class="search-popup__overlay search-toggler"></div>
        <div class="search-popup__content">
            <form role="search" method="get" class="search-popup__form" action="#">
                <input type="text" id="search" name="search" placeholder="Search Here...">
                <button type="submit" aria-label="search submit" class="search-btn">
                    <span><i class="fa-regular fa-magnifying-glass"></i></span>
                </button>
            </form>
        </div>
    </div>

    <!-- Header Section Start -->
    <header id="header-sticky" class="header-1 header-2">
        <div class="container-fluid">
            <div class="mega-menu-wrapper">
                <div class="header-main">
                    <div class="logo">
                        <a href="{{ route('home') }}" class="header-logo">
                            <img src="{{ asset('assets/user/img/logo/logo.png') }}" alt="logo-img" style="max-height: 150px; width: auto; object-fit: contain;">
                        </a>
                    </div>
                    <div class="header-right d-flex justify-content-end align-items-center mt-0">
                        <div class="mean__menu-wrapper">
                            <div class="main-menu">
                                <nav id="mobile-menu">
                                    <ul>
                                        <li><a href="{{ route('home') }}">Home</a></li>
                                        <li><a href="{{ route('games.index') }}">Games</a></li>
                                        @auth
                                            <li><a href="{{ route('dashboard') }}">My Dashboard</a></li>
                                            <li><a href="{{ route('cart.index') }}">Cart ({{ Auth::user()->cartItems()->count() ?? 0 }})</a></li>
                                        @else
                                            <li><a href="{{ route('login') }}">Login</a></li>
                                            <li><a href="{{ route('register') }}">Register</a></li>
                                        @endauth
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div class="header-right-icon">
                            <a href="#" class="main-header__search search-toggler">
                                <i class="fa-regular fa-magnifying-glass"></i>
                            </a>
                            <a href="{{ route('cart.index') }}">
                                <i class="far fa-shopping-cart"></i>
                            </a>
                        </div>
                        <div class="header-button">
                            @auth
                                <a href="{{ route('dashboard') }}" class="gt-theme-btn">Dashboard</a>
                            @else
                                <a href="{{ route('login') }}" class="gt-theme-btn">Join Now</a>
                            @endauth
                        </div>
                        <div class="header__hamburger d-block my-auto ml-4">
                            <div class="sidebar__toggle cursor-pointer p-2">
                                <i class="fas fa-bars text-white text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div id="smooth-wrapper">
        <div id="smooth-content">
            <div class="container mt-4 pt-4">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Success!</strong> {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Error!</strong> {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
            </div>
            @yield('content')

            <!-- GT Footer Section Start -->
            <footer class="gt-footer-section section-bg">
                <div class="container">
                    <div class="gt-footer-widget-wrapper">
                        <div class="row justify-content-between">
                            <div class="col-xl-4 col-lg-6 col-md-12">
                                <div class="gt-footer-widget-items">
                                    <div class="gt-widget-head">
                                        <a href="{{ route('home') }}" class="gt-footer-logo">
                                            <img src="{{ asset('assets/user/img/logo/logo.png') }}" alt="img" style="max-height: 150px; width: auto; object-fit: contain;">
                                        </a>
                                    </div>
                                    <div class="gt-footer-content">
                                        <p>Elevate your gaming experience with instant top-ups. Secure, fast, and reliable services.</p>
                                        <div class="gt-social-icon d-flex align-items-center">
                                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fa-brands fa-linkedin-in"></i></a>
                                            <a href="#"><i class="fa-brands fa-instagram"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <div class="footer-wrapper">
                            <p>© 2026 Shadow Store. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>

    <!--<< All JS Plugins >>-->
    <script src="{{ asset('assets/user/js/jquery-3.7.1.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/viewport.jquery.js') }}"></script>
    <script src="{{ asset('assets/user/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/jquery.nice-select.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/jquery.waypoints.js') }}"></script>
    <script src="{{ asset('assets/user/js/jquery.counterup.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/swiper-bundle.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/jquery.meanmenu.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/jquery.magnific-popup.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/gsap.js') }}"></script>
    <script src="{{ asset('assets/user/js/SplitText.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/gsap-scroll-to-plugin.js') }}"></script>
    <script src="{{ asset('assets/user/js/gsap-scroll-smoother.js') }}"></script>
    <script src="{{ asset('assets/user/js/gsap-scroll-trigger.js') }}"></script>
    <script src="{{ asset('assets/user/js/wow.min.js') }}"></script>
    <script src="{{ asset('assets/user/js/main.js') }}"></script>

    @stack('scripts')

    <script>
        // Debounce helper
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        // Profile icon redirection overhaul
        const profileBtn = document.getElementById('profile-icon-btn');
        if (profileBtn) {
            const handleProfileClick = debounce(function() {
                const role = document.querySelector('meta[name="user-role"]').content;
                if (role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/user/dashboard';
                }
            }, 250);

            profileBtn.addEventListener('click', function(e) {
                handleProfileClick();
            });
        }

        // Enhanced logout system
        const handleLogout = async function(e) {
            e.preventDefault();
            const form = e.target;
            const button = form.querySelector('button[type="submit"]');
            const spinner = form.querySelector('.animate-spin');
            
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (spinner) spinner.classList.remove('hidden');

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    },
                    body: new FormData(form)
                });

                if (response.ok) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { authenticated: false } }));
                    window.location.replace('/login');
                } else {
                    throw new Error('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Network failure or server error occurred during logout. Please try again.');
                
                if (button) {
                    button.disabled = false;
                    button.classList.remove('opacity-50', 'cursor-not-allowed');
                }
                if (spinner) spinner.classList.add('hidden');
            }
        };

        document.getElementById('logout-form')?.addEventListener('submit', handleLogout);
        document.getElementById('logout-form-nav')?.addEventListener('submit', handleLogout);
        document.getElementById('logout-form-offcanvas')?.addEventListener('submit', handleLogout);
        document.getElementById('logout-form-dashboard')?.addEventListener('submit', handleLogout);

        window.addEventListener('online', () => console.log('Back online'));
        window.addEventListener('offline', () => {
            alert('You are currently offline. Some features may not work correctly.');
        });
    </script>
</body>
</html>
