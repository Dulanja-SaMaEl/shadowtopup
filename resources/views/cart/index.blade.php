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
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">SHOP CART</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li>
                        <i class="fa-solid fa-house"></i>
                    </li>
                    <li>
                        <a href="{{ route('home') }}">
                            home :
                        </a>
                    </li>
                    <li class="color">
                        Shop Cart
                    </li>
                </ul>
            </div>
        </div>
    </div>

    @if($cartItems->isEmpty())
    <div class="cart-section fix section-padding pb-0 mb-4">
        <div class="container">
            <div class="checkout-single boxshado-single text-center" style="padding: 100px 20px;">
                <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                    <i class="fa-light fa-shopping-cart" style="font-size: 50px; color: var(--theme);"></i>
                </div>
                <h3 style="margin-bottom: 20px; text-transform: uppercase;">Your cart is empty</h3>
                <p style="color: #aaa; margin-bottom: 40px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Looks like you haven't added any game packs yet.</p>
                <a href="{{ route('home') }}" class="gt-theme-btn">Browse Games</a>
            </div>
        </div>
    </div>
    @else
    <!-- GT Shop Cart Section Start -->
    <div class="cart-section fix section-padding pb-0">
        <div class="container">
            <div class="cart-list-area">
                <div class="table-responsive">
                    <table class="table common-table">
                        <thead data-aos="fade-down">
                            <tr>
                                <th class="text-center">Product</th>
                                <th class="text-center">Price</th>
                                <th class="text-center">Quantity</th>
                                <th class="text-center">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($cartItems as $item)
                            <tr class="align-items-center py-3">
                                <td>
                                    <div class="cart-item-thumb d-flex align-items-center gap-4">
                                        <form action="{{ route('cart.destroy', $item) }}" method="POST" class="d-inline mb-0">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="bg-transparent border-none p-0 text-white cursor-pointer hover:text-red-500 transition-colors">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </form>
                                        @php
                                            $productImage = $item->product->image_path ? asset('storage/' . $item->product->image_path) : asset('assets/user/img/home-2/diamond.svg');
                                        @endphp
                                        <img src="{{ $productImage }}" alt="product" style="width:60px; height:60px; object-fit:contain;">
                                        <span class="head text-nowrap d-flex flex-column text-start">
                                            <span class="d-block mb-1">{{ $item->product->name }}</span>
                                            <span class="text-[10px] text-purple-500 font-black uppercase tracking-widest">ID: {{ $item->game_uid }}</span>
                                        </span>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <span class="price-usd">
                                        LKR {{ number_format($item->product->price, 2) }}
                                    </span>
                                </td>
                                <td class="price-quantity text-center">
                                    <div class="quantity d-inline-flex align-items-center justify-content-center gap-1 py-2 px-4 border n50-border_20 text-sm">
                                        <!-- No quantity adjustment in our logic for now, so display it statically -->
                                        <input type="text" value="{{ $item->quantity }}" class="quantityValue bg-transparent text-white border-none text-center" readonly style="width: 30px;">
                                    </div>
                                </td>
                                <td class="text-center">
                                    <span class="price-usd">
                                        LKR {{ number_format($item->product->price * $item->quantity, 2) }}
                                    </span>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="coupon-items d-flex flex-md-nowrap flex-wrap justify-content-between align-items-center gap-4 pt-4">
                    <form action="#" class="d-flex flex-sm-nowrap flex-wrap align-items-center gap-3">
                        <input type="text" placeholder="Enter coupon code">
                        <button type="submit" class="gt-theme-btn">
                            Apply
                        </button>
                    </form>
                    <button type="button" class="gt-theme-btn" onclick="window.location.reload()">
                        Update Cart
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Cart Total section end -->
    <div class="cart-total-area pt-5 section-padding mb-4">
        <div class="container">
            <div class="cart-total-items">
                <h3>Cart totals</h3>
                <ul>
                    <li>
                        Subtotal <span class="subtotal">LKR {{ number_format($total, 2) }}</span>
                    </li>
                    <li>
                        Total <span class="price">LKR {{ number_format($total, 2) }}</span>
                    </li>
                </ul>
                <a href="{{ route('checkout') }}" class="gt-theme-btn">
                    Proceed to Checkout
                </a>
            </div>
        </div>
    </div>
    @endif
@endsection
