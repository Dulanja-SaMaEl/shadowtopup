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
        Schema::table('users', function (Blueprint $table) {
            $table->string('reseller_status')->default('none')->after('role');
            $table->string('requested_tier')->nullable()->after('reseller_status');
            $table->timestamp('reseller_expires_at')->nullable()->after('requested_tier');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['reseller_status', 'requested_tier', 'reseller_expires_at']);
        });
    }
};
