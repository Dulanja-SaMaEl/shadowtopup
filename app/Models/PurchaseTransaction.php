<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PurchaseTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_id',
        'shell_account_id',
        'free_fire_player_id',
        'shells_deducted',
        'price_paid',
        'price_tier',
        'status',
        'payment_method',
        'receipt_path',
        'paypal_order_id',
    ];

    protected $casts = [
        'shells_deducted' => 'integer',
        'price_paid' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function shellAccount(): BelongsTo
    {
        return $this->belongsTo(ShellAccount::class);
    }

    public function shellTransaction(): HasOne
    {
        return $this->hasOne(ShellTransaction::class, 'related_purchase_id');
    }
}
