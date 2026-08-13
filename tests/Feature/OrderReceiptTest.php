<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_upload_valid_receipt()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $order = Order::create(['user_id' => $user->id, 'total_amount' => 100, 'status' => 'pending']);

        $this->actingAs($user);

        $file = UploadedFile::fake()->create('receipt.pdf', 1024, 'application/pdf');

        $response = $this->post("/orders/{$order->id}/receipt", [
            'receipt' => $file,
        ]);

        $response->assertRedirect();
        $order->refresh();
        $this->assertEquals('payment_pending', $order->status);
        $this->assertNotNull($order->receipt_path);
        Storage::disk('public')->assertExists($order->receipt_path);
    }

    public function test_user_cannot_upload_invalid_file_type()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $order = Order::create(['user_id' => $user->id, 'total_amount' => 100, 'status' => 'pending']);

        $this->actingAs($user);

        $file = UploadedFile::fake()->create('receipt.txt', 1024, 'text/plain');

        $response = $this->post("/orders/{$order->id}/receipt", [
            'receipt' => $file,
        ]);

        $response->assertSessionHasErrors('receipt');
        $order->refresh();
        $this->assertEquals('pending', $order->status);
    }

    public function test_user_cannot_upload_file_larger_than_5mb()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $order = Order::create(['user_id' => $user->id, 'total_amount' => 100, 'status' => 'pending']);

        $this->actingAs($user);

        $file = UploadedFile::fake()->create('receipt.jpg', 6000); // ~6MB

        $response = $this->post("/orders/{$order->id}/receipt", [
            'receipt' => $file,
        ]);

        $response->assertSessionHasErrors('receipt');
    }
}
