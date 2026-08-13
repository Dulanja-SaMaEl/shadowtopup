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
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ORDER HISTORY</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li>
                        <i class="fa-solid fa-house"></i>
                    </li>
                    <li>
                        <a href="{{ route('home') }}">home :</a>
                    </li>
                    <li class="color">orders</li>
                </ul>
            </div>
        </div>
    </div>

    <section class="checkout-section section-padding fix mb-4">
        <div class="container">
            <div class="checkout-single-wrapper">
                <!-- Orders Table Section -->
                <div class="checkout-single boxshado-single">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <h4 style="margin:0; font-style: italic;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--theme); margin-right: 10px;"></i> All Orders</h4>
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
                                    <td class="text-center"><strong style="color:var(--theme); font-size:18px; font-style:italic;">${{ number_format($order->total_amount, 2) }}</strong></td>
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
                                        <p style="color:#aaa; margin:0; text-transform: uppercase; font-weight: 700; font-size: 12px; letter-spacing: 1px;">No orders found</p>
                                        <a href="{{ route('home') }}" class="gt-theme-btn mt-4">Start Shopping</a>
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                    @if($orders->hasPages())
                        <div class="mt-4">
                            {{ $orders->links() }}
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>
@endsection
