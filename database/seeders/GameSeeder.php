<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            [
                'name' => 'Free Fire',
                'slug' => 'free-fire',
                'logo_path' => 'https://static-topup.freefiremobile.com/topup/static/images/hero/ff_logo.png',
                'is_active' => true,
            ],
            [
                'name' => 'PUBG Mobile',
                'slug' => 'pubg-mobile',
                'logo_path' => 'https://www.pubgmobile.com/common/images/icon_logo.png',
                'is_active' => true,
            ],
            [
                'name' => 'Mobile Legends',
                'slug' => 'mobile-legends',
                'logo_path' => 'https://m.mobilelegends.com/static/images/logo.png',
                'is_active' => true,
            ],
        ];

        foreach ($games as $gameData) {
            Game::updateOrCreate(
                ['slug' => $gameData['slug']],
                $gameData
            );
        }
    }
}
