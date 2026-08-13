<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('shell_accounts');
        
        Schema::create('shell_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_name');
            $table->string('account_email');
            $table->text('account_password');
            $table->integer('available_balance')->default(0);
            $table->boolean('is_main')->default(false);
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shell_accounts');
        
        // Optionally recreate the old table structure here if rolling back, 
        // but since we are replacing it, dropping is enough.
        Schema::create('shell_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->string('account_uid');
            $table->string('nickname')->nullable();
            $table->json('extra_data')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }
};
