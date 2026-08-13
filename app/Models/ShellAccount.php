<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShellAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_name',
        'account_username',
        'account_password',
        'session_cookie',
        'available_balance',
        'is_main',
        'last_synced_at',
    ];

    protected $casts = [
        'account_password' => 'encrypted',
        'available_balance' => 'integer',
        'is_main' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    public function shellTransactions(): HasMany
    {
        return $this->hasMany(ShellTransaction::class);
    }

    public function purchaseTransactions(): HasMany
    {
        return $this->hasMany(PurchaseTransaction::class);
    }
}
