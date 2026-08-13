<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('banner_path')->nullable()->after('logo_path');
            $table->text('description')->nullable()->after('banner_path');
            $table->string('category')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['banner_path', 'description', 'category']);
        });
    }
};
