<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_redirects_admin_to_admin_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_login_redirects_user_to_user_dashboard()
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
    }

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_cannot_access_admin_dashboard()
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_logout_invalidates_session_and_redirects_to_login()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/logout');

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_logout_terminates_all_sessions()
    {
        // This test requires SESSION_DRIVER=database
        config(['session.driver' => 'database']);
        
        // Manually create session table if it doesn't exist in memory sqlite (it should be migrated)
        // RefreshDatabase handles migrations.
        
        $user = User::factory()->create();
        
        // Simulate two sessions
        DB::table('sessions')->insert([
            ['id' => 'session1', 'user_id' => $user->id, 'ip_address' => '127.0.0.1', 'user_agent' => 'A', 'payload' => 'payload', 'last_activity' => time()],
            ['id' => 'session2', 'user_id' => $user->id, 'ip_address' => '127.0.0.1', 'user_agent' => 'B', 'payload' => 'payload', 'last_activity' => time()],
        ]);

        $this->actingAs($user);
        $this->post('/logout');

        $this->assertEquals(0, DB::table('sessions')->where('user_id', $user->id)->count());
    }
}
