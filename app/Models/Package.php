<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_name',
        'package_type',
        'diamond_amount',
        'shell_cost',
        'normal_price',
        'silver_price',
        'gold_price',
        'is_active',
    ];

    protected $casts = [
        'diamond_amount' => 'integer',
        'shell_cost' => 'integer',
        'normal_price' => 'decimal:2',
        'silver_price' => 'decimal:2',
        'gold_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function getPriceForUser(?User $user = null): float
    {
        if (!$user) {
            $user = auth()->user();
        }

        if ($user) {
            if ($user->isGold() && $this->gold_price > 0) {
                return $this->gold_price;
            }
            if ($user->isSilver() && $this->silver_price > 0) {
                return $this->silver_price;
            }
        }
        
        return $this->normal_price;
    }

    public function purchaseTransactions(): HasMany
    {
        return $this->hasMany(PurchaseTransaction::class);
    }
}
