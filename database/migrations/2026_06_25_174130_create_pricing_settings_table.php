<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('shells_1300_price', 10, 2)->default(0); // Base price in local currency
            // Adding specific fields for markups based on requirements
            $table->decimal('markup_normal', 10, 2)->default(0); 
            $table->decimal('markup_silver', 10, 2)->default(0);
            $table->decimal('markup_gold', 10, 2)->default(0);
            $table->enum('markup_type', ['fixed', 'percent'])->default('percent');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_settings');
    }
};
