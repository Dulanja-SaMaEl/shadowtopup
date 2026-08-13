<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'shells_1300_price',
        'markup_normal',
        'markup_silver',
        'markup_gold',
        'markup_type',
    ];

    protected $casts = [
        'shells_1300_price' => 'decimal:2',
        'markup_normal' => 'decimal:2',
        'markup_silver' => 'decimal:2',
        'markup_gold' => 'decimal:2',
    ];

    public static function calculatePrice(int $shellCost)
    {
        $setting = self::first();
        if (!$setting || $setting->shells_1300_price <= 0) {
            return [
                'normal' => 0,
                'silver' => 0,
                'gold' => 0,
            ];
        }

        $basePrice = ($shellCost / 1300) * $setting->shells_1300_price;

        $applyMarkup = function($markupValue) use ($basePrice, $setting) {
            if ($setting->markup_type === 'percent') {
                return $basePrice + ($basePrice * ($markupValue / 100));
            } else {
                return $basePrice + $markupValue;
            }
        };

        return [
            'normal' => round($applyMarkup($setting->markup_normal), 2),
            'silver' => round($applyMarkup($setting->markup_silver), 2),
            'gold' => round($applyMarkup($setting->markup_gold), 2),
        ];
    }
}
