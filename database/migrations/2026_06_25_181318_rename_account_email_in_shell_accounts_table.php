<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shell_accounts', function (Blueprint $table) {
            $table->renameColumn('account_email', 'account_username');
        });
    }

    public function down(): void
    {
        Schema::table('shell_accounts', function (Blueprint $table) {
            $table->renameColumn('account_username', 'account_email');
        });
    }
};
