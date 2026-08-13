@extends('layouts.store')

@section('content')
<div class="gt-breadcrumb-wrapper bg-cover" style="background-image: url('{{ asset('assets/user/img/breadcrumb.png') }}'); padding: 80px 0;">
    <div class="container">
        <div class="gt-page-heading" style="margin-top: 0;">
            <div class="gt-breadcrumb-sub-title">
                <h1 class="wow fadeInUp" data-wow-delay=".3s" style="font-size: 40px; text-transform: uppercase;">Upload Receipt</h1>
            </div>
            <ul class="gt-breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                <li><a href="{{ route('home') }}">home :</a></li>
                <li class="color">upload receipt</li>
            </ul>
        </div>
    </div>
</div>

<section class="checkout-section section-padding pb-20 fix">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-6">
                <div class="checkout-single boxshado-single" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 15px;">
                    <h4 style="color: #fff; font-weight: 900; text-transform: uppercase; margin-bottom: 20px;">Bank Transfer Details</h4>
                    
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                        <p style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Please transfer <strong style="color: var(--theme); font-size: 18px;">LKR {{ number_format($transaction->price_paid, 2) }}</strong> to the following bank account:</p>
                        
                        <div style="color: #fff; font-weight: bold;">
                            <p class="mb-1">Bank Name: <span style="color: #0dcaf0;">Sample Bank</span></p>
                            <p class="mb-1">Account Name: <span style="color: #0dcaf0;">Shadow TopUp</span></p>
                            <p class="mb-1">Account Number: <span style="color: #0dcaf0;">1234 5678 9012</span></p>
                            <p class="mb-0">Branch: <span style="color: #0dcaf0;">Main Branch</span></p>
                        </div>
                    </div>

                    <form action="{{ route('freefire.receipt.store', ['transaction' => $transaction->id]) }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="mb-4">
                            <label style="color: #aaa; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: block;">Upload Payment Receipt</label>
                            <input type="file" name="receipt" required accept="image/*" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; color: #fff;">
                            @error('receipt')
                                <span style="color: #dc3545; font-size: 12px; margin-top: 5px; display: block;">{{ $message }}</span>
                            @enderror
                        </div>

                        <button type="submit" class="gt-theme-btn w-100 py-3" style="font-weight: 900; letter-spacing: 2px;">
                            SUBMIT RECEIPT
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
