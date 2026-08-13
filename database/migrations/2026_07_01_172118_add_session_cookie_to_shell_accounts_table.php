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
        Schema::table('shell_accounts', function (Blueprint $table) {
            $table->text('session_cookie')->nullable()->after('account_password');
        });
    }

    public function down(): void
    {
        Schema::table('shell_accounts', function (Blueprint $table) {
            $table->dropColumn('session_cookie');
        });
    }
};
