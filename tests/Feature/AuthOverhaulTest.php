<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Auth;

class AuthOverhaulTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test role detection logic.
     */
    public function test_user_role_detection()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($user->isAdmin());
    }

    /**
     * Test login redirection to correct dashboard based on role.
     */
    public function test_login_redirection_to_correct_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        // Admin login
        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $response->assertRedirect('/admin/dashboard');

        Auth::logout();

        // Regular user login
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        $response->assertRedirect('/user/dashboard');
    }

    /**
     * Test profile icon redirection.
     * Note: This is mostly JS logic, but we can verify the routes exist and are protected.
     */
    public function test_dashboard_routes_protection()
    {
        // Unauthenticated access
        $this->get('/user/dashboard')->assertRedirect('/login');
        $this->get('/admin/dashboard')->assertRedirect('/login');

        // User access to admin dashboard
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->get('/admin/dashboard')->assertRedirect('/login');
    }

    /**
     * Test logout mechanism.
     */
    public function test_secure_logout()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/logout');

        // Backend should redirect to /login
        $response->assertRedirect('/login');
        
        // Session should be cleared
        $this->assertGuest();
    }

    /**
     * Test metrics API.
     */
    public function test_user_metrics_api()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->getJson(route('api.user.metrics'));
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total_orders',
                     'total_spent',
                     'active_orders'
                 ]);
    }
}
