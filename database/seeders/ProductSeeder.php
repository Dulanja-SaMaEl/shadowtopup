<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $freeFire = Game::where('slug', 'free-fire')->first();
        if ($freeFire) {
            $packs = [
                ['name' => '100 Diamonds', 'price' => 1.00],
                ['name' => '210 Diamonds', 'price' => 2.00],
                ['name' => '530 Diamonds', 'price' => 5.00],
                ['name' => '1080 Diamonds', 'price' => 10.00],
                ['name' => 'Weekly Pass', 'price' => 2.50],
                ['name' => 'Monthly Pass', 'price' => 10.00],
            ];
            foreach ($packs as $pack) {
                Product::create([
                    'game_id' => $freeFire->id,
                    'name' => $pack['name'],
                    'slug' => 'ff-' . str_replace(' ', '-', strtolower($pack['name'])),
                    'price' => $pack['price'],
                    'description' => $pack['name'] . ' for Free Fire',
                    'is_published' => true,
                ]);
            }
        }

        $pubg = Game::where('slug', 'pubg-mobile')->first();
        if ($pubg) {
            $packs = [
                ['name' => '60 UC', 'price' => 1.00],
                ['name' => '325 UC', 'price' => 5.00],
                ['name' => '660 UC', 'price' => 10.00],
                ['name' => '1800 UC', 'price' => 25.00],
            ];
            foreach ($packs as $pack) {
                Product::create([
                    'game_id' => $pubg->id,
                    'name' => $pack['name'],
                    'slug' => 'pubg-' . str_replace(' ', '-', strtolower($pack['name'])),
                    'price' => $pack['price'],
                    'description' => $pack['name'] . ' for PUBG Mobile',
                    'is_published' => true,
                ]);
            }
        }

        $mlbb = Game::where('slug', 'mobile-legends')->first();
        if ($mlbb) {
            $packs = [
                ['name' => '86 Diamonds', 'price' => 2.00],
                ['name' => '172 Diamonds', 'price' => 4.00],
                ['name' => '257 Diamonds', 'price' => 6.00],
                ['name' => 'Weekly Elite Bundle', 'price' => 2.00],
            ];
            foreach ($packs as $pack) {
                Product::create([
                    'game_id' => $mlbb->id,
                    'name' => $pack['name'],
                    'slug' => 'mlbb-' . str_replace(' ', '-', strtolower($pack['name'])),
                    'price' => $pack['price'],
                    'description' => $pack['name'] . ' for Mobile Legends',
                    'is_published' => true,
                ]);
            }
        }
    }
}
