@extends('layouts.store')

@section('content')
    <!-- GT Breadcrunb Section Start -->
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
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">CHECKOUT</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li>
                        <i class="fa-solid fa-house"></i>
                    </li>
                    <li>
                        <a href="{{ route('home') }}">home :</a>
                    </li>
                    <li class="color">Checkout</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Checkout Section Start -->
    <section class="checkout-section section-padding fix mb-4">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <form action="{{ route('orders.store') }}" method="POST">
                        @csrf
                        <div class="row g-4">
                            <!-- Left Column: Billing & Payment -->
                            <div class="col-lg-8">
                                <div class="checkout-single-wrapper">
                                    <div class="checkout-single boxshado-single mb-4">
                                        <h4>Billing address</h4>
                                        <div class="checkout-single-form">
                                            <div class="row g-4">
                                                <div class="col-lg-6">
                                                    <div class="input-single">
                                                        <label>Full Name</label>
                                                        <input type="text" name="name" value="{{ Auth::user()->name }}" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-lg-6">
                                                    <div class="input-single">
                                                        <label>Email Address</label>
                                                        <input type="email" name="email" value="{{ Auth::user()->email }}" readonly>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="checkout-single checkout-single-bg">
                                        <h4>Payment Method</h4>
                                        <div class="checkout-single-form">
                                            <p class="payment text-gray-400 mb-4">Manual Bank Transfer</p>
                                            <div class="row g-3">
                                                <div class="col-12">
                                                    <p class="text-white text-sm mb-4">Please transfer the total amount to the following bank account. You will need to upload your receipt in the dashboard after placing the order.</p>
                                                </div>
                                                <div class="col-lg-4">
                                                    <div class="input-single">
                                                        <label>Bank Name</label>
                                                        <input type="text" value="Shadow Bank" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4">
                                                    <div class="input-single">
                                                        <label>Account Number</label>
                                                        <input type="text" value="1234-5678-9012" readonly>
                                                    </div>
                                                </div>
                                                <div class="col-lg-4">
                                                    <div class="input-single">
                                                        <label>Account Name</label>
                                                        <input type="text" value="Shadow Store Ltd" readonly>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <button type="submit" class="gt-theme-btn border-none">
                                                <span>Place Order</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column: Order Summary -->
                            <div class="col-lg-4">
                                <div class="checkout-single-wrapper sticky top-24">
                                    <div class="checkout-single boxshado-single">
                                        <h4>Order Summary</h4>
                                        <div class="checkout-single-form">
                                            <div class="divide-y divide-white/5 mb-4">
                                                @foreach($cartItems as $item)
                                                    <div class="py-3 flex justify-content-between align-items-center">
                                                        <div>
                                                            <p class="text-white font-bold text-sm mb-1">{{ $item->product->name }}</p>
                                                            <p class="text-gray-400 text-[10px] uppercase mb-0">Qty: {{ $item->quantity }} | ID: {{ $item->game_uid }}</p>
                                                        </div>
                                                        <p class="text-white font-bold mb-0">LKR {{ number_format($item->product->price * $item->quantity, 2) }}</p>
                                                    </div>
                                                @endforeach
                                            </div>
                                            <div class="border-t border-white/10 pt-4">
                                                <div class="flex justify-content-between align-items-center mb-2">
                                                    <span class="text-gray-400 text-sm">Subtotal</span>
                                                    <span class="text-white font-bold">LKR {{ number_format($total, 2) }}</span>
                                                </div>
                                                <div class="flex justify-content-between align-items-center mt-3 pt-3 border-t border-white/5">
                                                    <span class="text-white text-lg font-bold">Total</span>
                                                    <span class="text-purple-500 text-2xl font-black">LKR {{ number_format($total, 2) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
@endsection