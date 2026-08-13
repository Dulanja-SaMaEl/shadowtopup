<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'name',
        'slug',
        'description',
        'normal_price',
        'silver_price',
        'gold_price',
        'image_path',
        'is_published',
    ];

    protected $casts = [
        'normal_price' => 'decimal:2',
        'silver_price' => 'decimal:2',
        'gold_price' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    public function getPriceAttribute()
    {
        $user = auth()->user();
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

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
