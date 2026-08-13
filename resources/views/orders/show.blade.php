@if(in_array($order->status, ['pending', 'payment_pending', 'verified']))
    @push('head')
        <meta http-equiv="refresh" content="30">
    @endpush
@endif

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
                    <h1 class="wow fadeInUp" data-wow-delay=".3s">ORDER DETAILS</h1>
                </div>
                <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                    <li>
                        <i class="fa-solid fa-house"></i>
                    </li>
                    <li>
                        <a href="{{ route('home') }}">home :</a>
                    </li>
                    <li>
                        <a href="{{ route('dashboard') }}">dashboard :</a>
                    </li>
                    <li class="color">#{{ $order->id }}</li>
                </ul>
            </div>
        </div>
    </div>

    <section class="checkout-section section-padding fix mb-4">
        <div class="container">
            <div class="checkout-single-wrapper">
                
                <!-- Header -->
                <div class="checkout-single boxshado-single mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div>
                        <h2 style="margin-bottom:5px; font-style: italic; font-weight: 900; text-transform: uppercase;">Order <span style="color:var(--theme);">#{{ $order->id }}</span></h2>
                        <p style="color:#aaa; font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing: 1px;">Placed on {{ $order->created_at->format('M d, Y H:i') }}</p>
                        @if(in_array($order->status, ['pending', 'payment_pending', 'verified']))
                            <p style="color:var(--theme); font-size:10px; text-transform:uppercase; font-weight:800; margin-top:5px;">Status updates live every 30s</p>
                        @endif
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span style="font-size:10px; text-transform:uppercase; color:#aaa; font-weight:800; letter-spacing:2px;">Status:</span>
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
                        <span class="badge" style="background:{{ $bg }}; color:{{ $text }}; padding:10px 20px; font-size:11px; text-transform:uppercase; letter-spacing:1px; border-radius: 30px;">
                            {{ str_replace('_', ' ', $order->status) }}
                        </span>
                    </div>
                </div>

                <div class="row g-4">
                    <!-- Left Column: Items -->
                    <div class="col-lg-8">
                        <div class="checkout-single boxshado-single mb-4">
                            <h4 style="margin-bottom:20px; font-style:italic; font-weight:900;">Items Ordered</h4>
                            
                            @foreach($order->items as $item)
                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 py-3" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <div class="d-flex align-items-center gap-4">
                                        <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.02); border-radius: 15px; display: flex; align-items: center; justify-content: center; padding: 10px; border: 1px solid rgba(255,255,255,0.05);">
                                            @php
                                                $productImage = $item->product->image_path ? asset('storage/' . $item->product->image_path) : asset('assets/user/img/home-2/diamond.svg');
                                            @endphp
                                            <img src="{{ $productImage }}" alt="product" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                        </div>
                                        <div>
                                            <h5 style="margin-bottom: 5px; font-weight: 900; text-transform: uppercase;">{{ $item->product_name_snapshot }}</h5>
                                            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">{{ $item->product->game->name ?? 'Game' }}</p>
                                            <span class="badge mt-2" style="background: rgba(139, 92, 246, 0.1); color: var(--theme); border: 1px solid rgba(139, 92, 246, 0.2); padding: 5px 10px;">UID: {{ $item->game_uid }}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-style: italic; color: #fff;">LKR {{ number_format($item->price_at_time, 2) }}</h4>
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        @if($order->admin_note)
                            <div class="checkout-single boxshado-single" style="border-left: 4px solid #dc3545; background: rgba(220, 53, 69, 0.05);">
                                <h6 style="color: #dc3545; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; font-weight: 900; margin-bottom: 10px;">Admin Note</h6>
                                <p style="color: #ccc; font-size: 14px; margin: 0; line-height: 1.6;">{{ $order->admin_note }}</p>
                            </div>
                        @endif
                    </div>

                    <!-- Right Column: Payment Details -->
                    <div class="col-lg-4">
                        <div class="checkout-single boxshado-single sticky-top" style="top: 100px;">
                            <h4 style="margin-bottom:20px; font-style:italic; font-weight:900;">Payment Details</h4>
                            
                            <div class="mb-4">
                                <p style="font-size:11px; color:#aaa; text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">Total Amount</p>
                                <h2 style="color:var(--theme); font-style:italic; font-weight:900; margin:0;">LKR {{ number_format($order->total_amount, 2) }}</h2>
                            </div>

                            @if($order->status === 'pending')
                                <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
                                    <h6 style="font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 15px;">Bank Transfer Info</h6>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span style="font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 700;">Bank:</span>
                                        <span style="font-size: 11px; color: #fff; text-transform: uppercase; font-weight: 900;">Shadow Bank</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span style="font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 700;">Account:</span>
                                        <span style="font-size: 11px; color: #fff; text-transform: uppercase; font-weight: 900;">1234-5678-9012</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span style="font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 700;">Name:</span>
                                        <span style="font-size: 11px; color: #fff; text-transform: uppercase; font-weight: 900;">Shadow Store Ltd</span>
                                    </div>
                                </div>

                                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                                    <h6 style="font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 15px;">Upload Receipt</h6>
                                    <form action="{{ route('orders.receipt', $order) }}" method="POST" enctype="multipart/form-data" id="upload-form">
                                        @csrf
                                        <div style="position: relative; margin-bottom: 15px;">
                                            <input type="file" name="receipt" id="receipt" accept=".pdf,.jpg,.jpeg,.png" onchange="validateFile(this)" required style="position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;">
                                            <div style="background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; text-align: center; transition: 0.3s;" onmouseover="this.style.borderColor='var(--theme)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                                                <i class="fa-light fa-cloud-arrow-up" style="font-size: 40px; color: #666; margin-bottom: 10px;"></i>
                                                <div id="file-name" style="font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">
                                                    Click to upload receipt<br>
                                                    <span style="font-size: 9px; color: #666; margin-top: 5px; display: block;">PDF, JPG, PNG (Max 5MB)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p id="file-error" style="color: #dc3545; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; display: none; margin-bottom: 15px; text-align: center;"></p>
                                        <button type="submit" class="gt-theme-btn w-100" style="letter-spacing: 2px;">Submit Receipt</button>
                                    </form>
                                </div>

                            @elseif($order->status === 'payment_pending')
                                <div class="text-center" style="background: rgba(13, 202, 240, 0.05); border: 1px solid rgba(13, 202, 240, 0.1); border-radius: 15px; padding: 30px;">
                                    <div style="width: 60px; height: 60px; background: rgba(13, 202, 240, 0.1); border: 1px solid rgba(13, 202, 240, 0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #0dcaf0;">
                                        <i class="fa-solid fa-hourglass-half fa-spin" style="font-size: 24px;"></i>
                                    </div>
                                    <h6 style="color: #fff; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px;">Awaiting Verification</h6>
                                    <p style="color: #aaa; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; line-height: 1.6; margin: 0;">We are currently reviewing your receipt. This usually takes 5-15 minutes.</p>
                                </div>

                            @elseif($order->status === 'verified')
                                <div class="text-center" style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.1); border-radius: 15px; padding: 30px;">
                                    <div style="width: 60px; height: 60px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--theme);">
                                        <i class="fa-solid fa-shield-check" style="font-size: 24px;"></i>
                                    </div>
                                    <h6 style="color: #fff; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px;">Payment Verified</h6>
                                    <p style="color: #aaa; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; line-height: 1.6; margin: 0;">Your payment has been verified! We are now processing your top-up.</p>
                                </div>

                            @elseif($order->status === 'completed')
                                <div class="text-center" style="background: rgba(25, 135, 84, 0.05); border: 1px solid rgba(25, 135, 84, 0.1); border-radius: 15px; padding: 30px;">
                                    <div style="width: 60px; height: 60px; background: rgba(25, 135, 84, 0.1); border: 1px solid rgba(25, 135, 84, 0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #198754;">
                                        <i class="fa-solid fa-circle-check" style="font-size: 24px;"></i>
                                    </div>
                                    <h6 style="color: #fff; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 1px; margin-bottom: 10px;">Order Completed</h6>
                                    <p style="color: #aaa; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; line-height: 1.6; margin: 0;">Top-up has been successfully delivered to your game account.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        function validateFile(input) {
            const fileName = document.getElementById('file-name');
            const fileError = document.getElementById('file-error');
            const file = input.files[0];
            
            if (!file) return;

            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                fileError.innerText = 'INVALID FILE TYPE. PLEASE UPLOAD PDF, JPG, OR PNG.';
                fileError.style.display = 'block';
                input.value = '';
                fileName.innerHTML = 'Click to upload receipt<br><span style="font-size: 9px; color: #666; margin-top: 5px; display: block;">PDF, JPG, PNG (Max 5MB)</span>';
                return;
            }

            if (file.size > maxSize) {
                fileError.innerText = 'FILE IS TOO LARGE. MAXIMUM SIZE IS 5MB.';
                fileError.style.display = 'block';
                input.value = '';
                fileName.innerHTML = 'Click to upload receipt<br><span style="font-size: 9px; color: #666; margin-top: 5px; display: block;">PDF, JPG, PNG (Max 5MB)</span>';
                return;
            }

            fileError.style.display = 'none';
            fileName.innerText = file.name;
        }
    </script>
@endsection
