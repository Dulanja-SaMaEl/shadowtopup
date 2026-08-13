@if(Auth::check() && Auth::user()->orders()->whereIn('status', ['pending', 'payment_pending', 'verified'])->exists())
    @push('head')
        <meta http-equiv="refresh" content="30">
    @endpush
@endif

@extends('layouts.store')

@section('content')
    <!-- Breadcrumb Section -->
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
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">MY DASHBOARD</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li>
                        <i class="fa-solid fa-house"></i>
                    </li>
                    <li>
                        <a href="{{ route('home') }}">home :</a>
                    </li>
                    <li class="color">dashboard</li>
                </ul>
            </div>
        </div>
    </div>

    @auth
    <section class="checkout-section section-padding fix mb-4">
        <div class="container">
            <div class="checkout-single-wrapper">
                
                <!-- Profile Section -->
                <div class="checkout-single boxshado-single mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center gap-4">
                        <div style="width:80px; height:80px; border-radius:50%; background:var(--theme); color:#fff; display:flex; align-items:center; justify-content:center; font-size:30px; font-weight:900;">
                            {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                        </div>
                        <div>
                            <h3 style="margin-bottom:5px;">{{ Auth::user()->name }}</h3>
                            <p style="color:#aaa; margin-bottom:5px;">{{ Auth::user()->email }}</p>
                            <span class="badge" style="background:var(--theme); padding:5px 10px; font-size: 11px;">{{ strtoupper(Auth::user()->role ?? 'Customer') }}</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <a href="{{ route('profile.edit') }}" class="gt-theme-btn" style="background: #6c757d; border-color: #6c757d; padding: 12px 24px;">Edit Profile</a>
                        <form method="POST" action="{{ route('logout') }}" id="logout-form-dashboard" class="m-0">
                            @csrf
                            <button type="submit" class="gt-theme-btn" style="background: #dc3545; border-color: #dc3545; padding: 12px 24px;">Logout</button>
                        </form>
                    </div>
                </div>

                <!-- Metrics Section -->
                <div class="row g-4 mb-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="checkout-single checkout-single-bg text-center py-5">
                            <h5 style="color:#aaa; text-transform:uppercase; font-size:12px; margin-bottom:15px; letter-spacing: 2px;">Total Orders</h5>
                            <h2 id="metric-total-orders" style="font-size:40px; margin:0;">0</h2>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <div class="checkout-single checkout-single-bg text-center py-5">
                            <h5 style="color:#aaa; text-transform:uppercase; font-size:12px; margin-bottom:15px; letter-spacing: 2px;">Total Spent</h5>
                            <h2 id="metric-total-spent" style="color:var(--theme); font-size:40px; margin:0;">LKR 0</h2>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <div class="checkout-single checkout-single-bg text-center py-5">
                            <h5 style="color:#aaa; text-transform:uppercase; font-size:12px; margin-bottom:15px; letter-spacing: 2px;">Active Orders</h5>
                            <h2 id="metric-active-orders" style="color:#0dcaf0; font-size:40px; margin:0;">0</h2>
                        </div>
                    </div>
                </div>

                <!-- Account Details Section -->
                <div class="checkout-single boxshado-single mb-4">
                    <h4 style="margin-bottom:20px; font-style: italic;"><i class="fa-solid fa-address-card" style="color:var(--theme); margin-right: 10px;"></i> Account Details</h4>
                    <div class="row g-4">
                        <div class="col-lg-3 col-md-6">
                            <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:10px; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px; font-weight: 700; letter-spacing: 1px;">Full Name</p>
                                <h6 style="margin:0; font-weight: 800;">{{ Auth::user()->name }}</h6>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:10px; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px; font-weight: 700; letter-spacing: 1px;">Email Address</p>
                                <h6 style="margin:0; font-weight: 800; word-break:break-all;">{{ Auth::user()->email }}</h6>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:10px; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px; font-weight: 700; letter-spacing: 1px;">Account Role</p>
                                <h6 style="margin:0; color:var(--theme); font-weight: 800; text-transform: uppercase;">
                                    @if(Auth::user()->isReseller())
                                        <i class="fa-solid fa-medal" style="color: {{ Auth::user()->isGold() ? '#FFD700' : '#C0C0C0' }};"></i> 
                                    @endif
                                    {{ Auth::user()->role ?? 'Customer' }}
                                </h6>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:10px; border: 1px solid rgba(255,255,255,0.05);">
                                <p style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px; font-weight: 700; letter-spacing: 1px;">Member Since</p>
                                <h6 style="margin:0; font-weight: 800;">{{ Auth::user()->created_at->format('M d, Y') }}</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reseller Section -->
                <div class="checkout-single boxshado-single mb-4">
                    <h4 style="margin-bottom:20px; font-style: italic;"><i class="fa-solid fa-handshake" style="color:var(--theme); margin-right: 10px;"></i> Reseller Status</h4>
                    
                    @if(session('success'))
                        <div class="alert alert-success" style="background: #19875422; color: #198754; border: 1px solid #19875455; border-radius: 10px;">
                            {{ session('success') }}
                        </div>
                    @endif
                    
                    @if(session('error'))
                        <div class="alert alert-danger" style="background: #dc354522; color: #dc3545; border: 1px solid #dc354555; border-radius: 10px;">
                            {{ session('error') }}
                        </div>
                    @endif

                    @if(Auth::user()->isReseller())
                        <div style="background:rgba(255,255,255,0.02); padding:30px; border-radius:15px; border: 1px solid rgba(255,255,255,0.05);">
                            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <div>
                                    <h5 style="color: {{ Auth::user()->isGold() ? '#FFD700' : '#C0C0C0' }}; margin-bottom:5px; font-weight:800; display:flex; align-items:center; gap:10px;">
                                        <i class="fa-solid fa-crown"></i> {{ ucfirst(Auth::user()->role) }} Reseller
                                    </h5>
                                    <p style="color:#aaa; margin:0;">You are currently enjoying exclusive reseller pricing on all products.</p>
                                </div>
                                <div style="text-align:right;">
                                    <p style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px; font-weight: 700; letter-spacing: 1px;">Subscription Expires</p>
                                    <h6 style="margin:0; font-weight: 800;">
                                        {{ Auth::user()->reseller_expires_at ? Auth::user()->reseller_expires_at->format('M d, Y h:i A') : 'Never' }}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    @elseif(Auth::user()->reseller_status === 'pending')
                        <div style="background:rgba(255,255,255,0.02); padding:30px; border-radius:15px; border: 1px solid #ffc10755; text-align:center;">
                            <i class="fa-solid fa-hourglass-half" style="font-size:30px; color:#ffc107; margin-bottom:15px;"></i>
                            <h5 style="color:#ffc107; margin-bottom:5px; font-weight:800;">Application Pending</h5>
                            <p style="color:#aaa; margin:0;">Your application for {{ ucfirst(Auth::user()->requested_tier) }} Reseller is currently under review by our team.</p>
                        </div>
                    @else
                        <div style="background:rgba(255,255,255,0.02); padding:30px; border-radius:15px; border: 1px solid rgba(255,255,255,0.05);">
                            <h5 style="margin-bottom:10px; font-weight:800;">Become a Reseller</h5>
                            <p style="color:#aaa; margin-bottom:20px;">Get exclusive discounts on all top-up packages by becoming a reseller. Apply below.</p>
                            
                            <form action="{{ route('user.reseller.apply') }}" method="POST">
                                @csrf
                                <div class="row g-3 align-items-end">
                                    <div class="col-md-6">
                                        <label class="form-label" style="font-size:12px; color:#aaa; text-transform:uppercase; font-weight:700;">Select Tier</label>
                                        <select name="tier" class="form-select" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:12px 15px;" required>
                                            <option value="" disabled selected>Choose a reseller tier...</option>
                                            <option value="silver" style="color:#000;">Silver Reseller</option>
                                            <option value="gold" style="color:#000;">Gold Reseller</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <button type="submit" class="gt-theme-btn w-100" style="padding:12px 15px;">Submit Application</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    @endif
                </div>

                <!-- Charts Section -->
                <div class="row g-4 mb-4">
                    <!-- Spending History -->
                    <div class="col-lg-6">
                        <div class="checkout-single boxshado-single h-100">
                            <h4 style="margin-bottom:20px; font-style: italic;"><i class="fa-solid fa-chart-line" style="color:var(--theme); margin-right: 10px;"></i> Purchase History (30 Days)</h4>
                            <div style="height: 300px; position: relative;">
                                <canvas id="spendingChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <!-- Pricing Comparison -->
                    <div class="col-lg-6">
                        <div class="checkout-single boxshado-single h-100">
                            <h4 style="margin-bottom:20px; font-style: italic;"><i class="fa-solid fa-tags" style="color:var(--theme); margin-right: 10px;"></i> Package Pricing Tiers</h4>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pricingChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Orders Section -->
                <div class="checkout-single boxshado-single">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <h4 style="margin:0; font-style: italic;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--theme); margin-right: 10px;"></i> Recent Activity</h4>
                        <a href="{{ route('orders.index') }}" class="gt-theme-btn" style="padding: 10px 20px; font-size: 12px; border: none;">View All</a>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table common-table">
                            <thead>
                                <tr>
                                    <th>Order / Date</th>
                                    <th class="text-center">Items</th>
                                    <th class="text-center">Amount</th>
                                    <th class="text-center">Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($orders as $order)
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <div style="background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; text-align:center;">
                                                <span style="font-size:11px; color:#aaa; display:block; line-height:1; text-transform:uppercase; font-weight:800;">{{ $order->created_at->format('M') }}</span>
                                                <span style="font-size:20px; font-weight:900; line-height:1; margin-top:3px; display:block;">{{ $order->created_at->format('d') }}</span>
                                            </div>
                                            <div>
                                                <h6 style="margin-bottom:3px; font-weight:800;">Order #{{ $order->id }}</h6>
                                                <span style="font-size:11px; color:#aaa; font-weight:700;">{{ $order->created_at->format('h:i A') }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-center font-bold">{{ $order->items->count() }}x Items</td>
                                    <td class="text-center"><strong style="color:var(--theme); font-size:18px; font-style:italic;">LKR {{ number_format($order->total_amount, 2) }}</strong></td>
                                    <td class="text-center">
                                        @php
                                            $bg = match($order->status) {
                                                'completed' => '#198754',
                                                'pending' => '#ffc107',
                                                'rejected' => '#dc3545',
                                                default => 'var(--theme)',
                                            };
                                            $text = match($order->status) {
                                                'pending' => '#000',
                                                default => '#fff',
                                            };
                                        @endphp
                                        <span class="badge" style="background:{{ $bg }}; color:{{ $text }}; padding:8px 15px; font-size:10px; text-transform:uppercase; letter-spacing:1px; border-radius: 20px;">
                                            {{ str_replace('_', ' ', $order->status) }}
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <a href="{{ route('orders.show', $order) }}" style="width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); border-radius:10px; color:#fff; transition: 0.3s;" onmouseover="this.style.background='var(--theme)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                                            <i class="fa-solid fa-chevron-right"></i>
                                        </a>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="5" class="text-center py-5">
                                        <i class="fa-solid fa-box-open" style="font-size:40px; color:rgba(255,255,255,0.1); margin-bottom:15px; display:block;"></i>
                                        <p style="color:#aaa; margin:0; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: 1px;">No orders found yet</p>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Metrics Fetch Script -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            // Metrics fetch
            const displays = {
                'metric-total-orders': 'total_orders',
                'metric-total-spent': 'total_spent',
                'metric-active-orders': 'active_orders'
            };

            try {
                const response = await fetch('{{ route("api.user.metrics") }}', {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    Object.entries(displays).forEach(([id, key]) => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.textContent = key === 'total_spent' ? `LKR ${data[key]}` : data[key];
                        }
                    });
                }
            } catch (error) {
                console.error('Metrics fetch error:', error);
            }

            // Spending Line Chart
            const spendingCtx = document.getElementById('spendingChart');
            if (spendingCtx) {
                let gradient = spendingCtx.getContext('2d').createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.5)'); // purple-500
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                
                new Chart(spendingCtx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartDates ?? []) !!},
                        datasets: [{
                            label: 'Spending (LKR)',
                            data: {!! json_encode($chartSpentData ?? []) !!},
                            borderColor: '#8b5cf6',
                            backgroundColor: gradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#aaa' } },
                            x: { grid: { display: false }, ticks: { color: '#aaa', maxTicksLimit: 7 } }
                        }
                    }
                });
            }

            // Pricing Comparison Bar Chart
            const pricingCtx = document.getElementById('pricingChart');
            if (pricingCtx) {
                @php
                    $pkgNames = [];
                    $normalPrices = [];
                    $silverPrices = [];
                    $goldPrices = [];
                    if(isset($packages)) {
                        foreach($packages as $p) {
                            $pkgNames[] = $p->package_name;
                            $normalPrices[] = $p->normal_price;
                            $silverPrices[] = $p->silver_price;
                            $goldPrices[] = $p->gold_price;
                        }
                    }
                @endphp
                
                new Chart(pricingCtx, {
                    type: 'bar',
                    data: {
                        labels: {!! json_encode($pkgNames) !!},
                        datasets: [
                            {
                                label: 'Normal',
                                data: {!! json_encode($normalPrices) !!},
                                backgroundColor: '#6c757d',
                            },
                            {
                                label: 'Silver',
                                data: {!! json_encode($silverPrices) !!},
                                backgroundColor: '#C0C0C0',
                            },
                            {
                                label: 'Gold',
                                data: {!! json_encode($goldPrices) !!},
                                backgroundColor: '#FFD700',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { labels: { color: '#fff' } }
                        },
                        scales: {
                            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#aaa' } },
                            x: { grid: { display: false }, ticks: { color: '#aaa' } }
                        }
                    }
                });
            }
        });
    </script>
    @else
    <section class="checkout-section section-padding fix">
        <div class="container py-20 text-center">
            <div class="checkout-single boxshado-single" style="max-width: 500px; margin: auto;">
                <h2 class="text-2xl font-black text-white uppercase tracking-tight">Please Log In</h2>
                <p class="text-gray-500 mt-4 mb-4">You must be logged in to view your dashboard.</p>
                <a href="{{ route('login') }}" class="gt-theme-btn mt-4 inline-block">Login Now</a>
            </div>
        </div>
    </section>
    @endauth
@endsection