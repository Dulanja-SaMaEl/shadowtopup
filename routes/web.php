<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PagesController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::get('/', [GameController::class, 'index'])->name('home');
Route::get('/games', [GameController::class, 'list'])->name('games.index');
Route::get('/games/{game:slug}', [GameController::class, 'show'])->name('games.show');
Route::get('/api/verify-player/{game:slug}/{uid}', [GameController::class, 'verifyPlayer'])->name('api.verify-player');

Route::get('/about', [PagesController::class, 'about'])->name('about');
Route::get('/contact', [PagesController::class, 'contact'])->name('contact');
Route::get('/privacy', [PagesController::class, 'privacy'])->name('privacy');
Route::get('/terms', [PagesController::class, 'terms'])->name('terms');

Route::middleware('auth')->group(function () {
    // User Dashboard & Metrics
    Route::get('/user/dashboard', function () {
        $user = Auth::user();
        $orders = $user->orders()->latest()->take(5)->get();
        
        $packages = \App\Models\Package::where('is_active', true)->get();
        
        $transactions = \App\Models\PurchaseTransaction::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('status', ['success', 'completed'])
            ->orderBy('created_at')
            ->get();
            
        $chartDates = [];
        $chartSpent = [];
        
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('M d');
            $chartDates[] = $date;
            $chartSpent[$date] = 0;
        }

        foreach ($transactions as $t) {
            $date = $t->created_at->format('M d');
            if (isset($chartSpent[$date])) {
                $chartSpent[$date] += $t->price_paid;
            }
        }
        
        $chartSpentData = array_values($chartSpent);
        
        return view('dashboard', compact('orders', 'packages', 'chartDates', 'chartSpentData'));
    })->middleware(['verified'])->name('dashboard');

    Route::post('/user/reseller/apply', [App\Http\Controllers\User\ResellerController::class, 'apply'])->name('user.reseller.apply');

    Route::get('/api/user/metrics', function () {
        $user = Auth::user();
        return response()->json([
            'total_orders' => $user->orders()->count(),
            'total_spent' => number_format($user->orders()->whereIn('status', ['verified', 'completed'])->sum('total_amount'), 2),
            'active_orders' => $user->orders()->whereNotIn('status', ['completed', 'rejected'])->count(),
        ]);
    })->name('api.user.metrics');

    Route::post('/api/user/preferences', function (Request $request) {
        $user = Auth::user();
        $user->update([
            'preferences' => array_merge($user->preferences ?? [], $request->all())
        ]);
        return response()->json(['success' => true]);
    })->name('api.user.preferences');

    // Shopping Cart
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add/{product}', [CartController::class, 'store'])->name('cart.store');
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    
    // Orders
    Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/receipt', [OrderController::class, 'uploadReceipt'])->name('orders.receipt');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Free Fire Top-up & PayPal
    Route::post('/free-fire/checkout', [\App\Http\Controllers\FreeFireTopupController::class, 'checkout'])->name('freefire.checkout');
    Route::get('/free-fire/paypal/success', [\App\Http\Controllers\FreeFireTopupController::class, 'paypalSuccess'])->name('freefire.paypal.success');
    Route::get('/free-fire/paypal/cancel', [\App\Http\Controllers\FreeFireTopupController::class, 'paypalCancel'])->name('freefire.paypal.cancel');
    Route::get('/free-fire/receipt', [\App\Http\Controllers\FreeFireTopupController::class, 'showReceiptUpload'])->name('freefire.receipt.upload');
    Route::post('/free-fire/receipt', [\App\Http\Controllers\FreeFireTopupController::class, 'uploadReceipt'])->name('freefire.receipt.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('games', App\Http\Controllers\Admin\GameController::class);
    Route::resource('products', App\Http\Controllers\Admin\ProductController::class);
    Route::resource('users', App\Http\Controllers\Admin\UserController::class);
    Route::post('users/{user}/toggle-ban', [App\Http\Controllers\Admin\UserController::class, 'toggleBan'])->name('users.toggle-ban');
    
    Route::get('/resellers', [App\Http\Controllers\Admin\ResellerController::class, 'index'])->name('resellers.index');
    Route::post('/resellers/{user}/approve', [App\Http\Controllers\Admin\ResellerController::class, 'approve'])->name('resellers.approve');
    Route::post('/resellers/{user}/reject', [App\Http\Controllers\Admin\ResellerController::class, 'reject'])->name('resellers.reject');
    Route::post('/resellers/{user}/demote', [App\Http\Controllers\Admin\ResellerController::class, 'demote'])->name('resellers.demote');
    
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/bulk-update', [App\Http\Controllers\Admin\OrderController::class, 'bulkUpdate'])->name('orders.bulk-update');
    Route::get('/orders/{order}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/verify', [App\Http\Controllers\Admin\OrderController::class, 'verify'])->name('orders.verify');
    Route::post('/orders/{order}/reject', [App\Http\Controllers\Admin\OrderController::class, 'reject'])->name('orders.reject');
    Route::post('/orders/{order}/complete', [App\Http\Controllers\Admin\OrderController::class, 'complete'])->name('orders.complete');

    // New Shell Accounts and Free Fire Features
    Route::resource('shell_accounts', App\Http\Controllers\Admin\ShellAccountController::class);
    Route::post('shell_accounts/{shell_account}/set-main', [App\Http\Controllers\Admin\ShellAccountController::class, 'setMain'])->name('shell_accounts.set-main');
    Route::post('shell_accounts/{shell_account}/redeem-pin', [App\Http\Controllers\Admin\ShellAccountController::class, 'redeemPin'])->name('shell_accounts.redeem-pin');
    Route::get('shell_accounts/{shell_account}/balance', [App\Http\Controllers\Admin\ShellAccountController::class, 'getBalance'])->name('shell_accounts.balance');
    Route::post('shell_accounts/{shell_account}/sync-balance', [App\Http\Controllers\Admin\ShellAccountController::class, 'syncBalance'])->name('shell_accounts.sync-balance');
    Route::post('shell_accounts/{shell_account}/manual-login', [App\Http\Controllers\Admin\ShellAccountController::class, 'manualLogin'])->name('shell_accounts.manual-login');

    Route::resource('packages', App\Http\Controllers\Admin\PackageController::class)->except(['show']);
    
    Route::get('/pricing', [App\Http\Controllers\Admin\PricingSettingController::class, 'index'])->name('pricing.index');
    Route::post('/pricing', [App\Http\Controllers\Admin\PricingSettingController::class, 'update'])->name('pricing.update');
    
    Route::get('/purchase-transactions', [App\Http\Controllers\Admin\PurchaseTransactionController::class, 'index'])->name('purchase_transactions.index');
    Route::post('/purchase-transactions/{transaction}/retry', [App\Http\Controllers\Admin\PurchaseTransactionController::class, 'retry'])->name('purchase_transactions.retry');
    Route::post('/purchase-transactions/{transaction}/verify', [App\Http\Controllers\Admin\PurchaseTransactionController::class, 'verify'])->name('purchase_transactions.verify');
    Route::post('/purchase-transactions/{transaction}/reject', [App\Http\Controllers\Admin\PurchaseTransactionController::class, 'reject'])->name('purchase_transactions.reject');
});

require __DIR__.'/auth.php';
