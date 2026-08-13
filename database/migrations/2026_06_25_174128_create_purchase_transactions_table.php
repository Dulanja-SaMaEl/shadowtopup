<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade');
            $table->foreignId('shell_account_id')->constrained('shell_accounts')->onDelete('cascade');
            $table->string('free_fire_player_id');
            $table->integer('shells_deducted');
            $table->decimal('price_paid', 10, 2);
            $table->enum('price_tier', ['normal', 'silver', 'gold']);
            $table->enum('status', ['pending', 'success', 'failed']);
            
            // Adding PayPal transaction reference
            $table->string('paypal_order_id')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_transactions');
    }
};
