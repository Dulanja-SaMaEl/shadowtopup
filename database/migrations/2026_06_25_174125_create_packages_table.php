<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('package_name');
            $table->enum('package_type', ['diamond', 'membership']);
            $table->integer('diamond_amount')->nullable();
            $table->integer('shell_cost');
            $table->decimal('normal_price', 10, 2)->default(0);
            $table->decimal('silver_price', 10, 2)->default(0);
            $table->decimal('gold_price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
