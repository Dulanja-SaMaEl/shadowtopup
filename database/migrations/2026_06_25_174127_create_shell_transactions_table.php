<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shell_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shell_account_id')->constrained()->onDelete('cascade');
            $table->enum('transaction_type', ['credit', 'debit']);
            $table->integer('amount');
            $table->string('description')->nullable();
            $table->unsignedBigInteger('related_user_id')->nullable();
            $table->unsignedBigInteger('related_purchase_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shell_transactions');
    }
};
