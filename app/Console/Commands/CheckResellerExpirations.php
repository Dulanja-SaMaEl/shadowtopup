<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckResellerExpirations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'resellers:check-expirations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and expire reseller subscriptions that have passed their expiration date';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredUsers = User::whereNotNull('reseller_expires_at')
            ->where('reseller_expires_at', '<=', now())
            ->get();

        $count = 0;
        foreach ($expiredUsers as $user) {
            $user->update([
                'role' => 'user',
                'reseller_status' => 'none',
                'reseller_expires_at' => null,
                'requested_tier' => null,
            ]);
            $count++;
        }

        $this->info("Expired $count reseller subscriptions.");
    }
}
