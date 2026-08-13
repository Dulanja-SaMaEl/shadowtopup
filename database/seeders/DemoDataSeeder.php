<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin
        User::updateOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Demo123!'),
                'role' => 'admin',
            ]
        );

        // 2. Create Regular Users
        $users = [
            [
                'name' => 'User One',
                'email' => 'user1@demo.com',
                'orders_count' => 5,
                'active_count' => 2,
            ],
            [
                'name' => 'User Two',
                'email' => 'user2@demo.com',
                'orders_count' => 2,
                'active_count' => 0,
            ],
            [
                'name' => 'User Three',
                'email' => 'user3@demo.com',
                'orders_count' => 10,
                'active_count' => 5,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'role' => 'user',
                ]
            );

            // Delete existing orders and items for this user to ensure clean demo data
            $user->orders()->each(function($order) {
                $order->items()->delete();
                $order->delete();
            });

            // Create some orders for each user
            for ($i = 0; $i < $userData['orders_count']; $i++) {
                    $status = $i < $userData['active_count'] ? 'pending' : 'completed';
                    
                    // Get a random product to determine the price and name
                    $product = Product::inRandomOrder()->first();
                    $amount = $product ? $product->price : rand(10, 100);

                    $order = Order::create([
                        'user_id' => $user->id,
                        'total_amount' => $amount,
                        'status' => $status,
                        'created_at' => now()->subDays(rand(0, 30)),
                    ]);

                    if ($product) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'game_uid' => '123456789',
                            'price_at_time' => $product->price,
                            'product_name_snapshot' => $product->name,
                        ]);
                    }
            }
        }
    }
}
