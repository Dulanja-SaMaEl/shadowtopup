<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShellTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'shell_account_id',
        'transaction_type',
        'amount',
        'description',
        'related_user_id',
        'related_purchase_id',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function shellAccount(): BelongsTo
    {
        return $this->belongsTo(ShellAccount::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    public function purchaseTransaction(): BelongsTo
    {
        return $this->belongsTo(PurchaseTransaction::class, 'related_purchase_id');
    }
}
