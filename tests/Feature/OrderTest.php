<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_order_history()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get(route('orders.index'));

        $response->assertStatus(200);
        $response->assertSee('Order History');
    }

    public function test_admin_can_view_all_orders()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($admin)->get(route('admin.orders.index'));

        $response->assertStatus(200);
        $response->assertSee('Order Management');
    }

    public function test_non_admin_cannot_access_admin_orders()
    {
        $user = User::factory()->create(['role' => 'user']);
        
        $response = $this->actingAs($user)->get(route('admin.orders.index'));

        $response->assertStatus(302); // Redirect back or to home
    }
}
