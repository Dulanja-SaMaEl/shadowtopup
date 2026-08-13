<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('price', 'normal_price');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('silver_price', 10, 2)->default(0)->after('normal_price');
            $table->decimal('gold_price', 10, 2)->default(0)->after('silver_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['silver_price', 'gold_price']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('normal_price', 'price');
        });
    }
};
