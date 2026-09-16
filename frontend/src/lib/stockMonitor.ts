import { SupabaseClient } from '@supabase/supabase-js';
import { sendLowStockAlertEmail } from './emailService';

// 4-Hour cooldown between low stock alert emails to prevent mailbox flooding
const COOLDOWN_MS = 4 * 60 * 60 * 1000;
let lastLowStockAlertTimestamp = 0;

/**
 * Checks current Garena Shell accounts inventory and triggers an email alert if low.
 * Threshold: total shells across all accounts < 1000 shells (or < 2h estimated endurance).
 */
export async function checkAndNotifyLowStock(
  adminSupabase: SupabaseClient,
  threshold: number = 1000
): Promise<{ isLow: boolean; totalShells: number; alertSent: boolean }> {
  try {
    const { data: accounts, error } = await adminSupabase
      .from('shell_accounts')
      .select('id, account_username, available_balance, is_main')
      .order('is_main', { ascending: false });

    if (error || !accounts || accounts.length === 0) {
      return { isLow: false, totalShells: 0, alertSent: false };
    }

    const totalShells = accounts.reduce(
      (sum, acc) => sum + Number(acc.available_balance || 0),
      0
    );

    const isLow = totalShells < threshold;

    if (!isLow) {
      return { isLow: false, totalShells, alertSent: false };
    }

    // Cooldown check
    const now = Date.now();
    if (now - lastLowStockAlertTimestamp < COOLDOWN_MS) {
      return { isLow: true, totalShells, alertSent: false };
    }

    // Estimate endurance hours based on 24-hour shell burn rate
    let enduranceHours = '< 2';
    try {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentTxs } = await adminSupabase
        .from('purchase_transactions')
        .select('shells_deducted')
        .gte('created_at', yesterday);

      const shellsConsumed24h = (recentTxs || []).reduce(
        (sum, tx) => sum + Number(tx.shells_deducted || 0),
        0
      );

      const hourlyRate = shellsConsumed24h > 0 ? shellsConsumed24h / 24 : 100;
      const hoursRemaining = Math.max(0.5, totalShells / hourlyRate);
      enduranceHours = hoursRemaining.toFixed(1);
    } catch {
      enduranceHours = '< 2';
    }

    // Format account list for the email
    const accountsData = accounts.map((acc) => ({
      username: acc.account_username || `Account #${acc.id}`,
      balance: Number(acc.available_balance || 0),
    }));

    lastLowStockAlertTimestamp = now;

    // Send alert email asynchronously
    const emailResult = await sendLowStockAlertEmail({
      totalShells,
      accounts: accountsData,
      enduranceHours,
    });

    return { isLow: true, totalShells, alertSent: emailResult.success };
  } catch (err) {
    console.error('[stockMonitor] Exception in checkAndNotifyLowStock:', err);
    return { isLow: false, totalShells: 0, alertSent: false };
  }
}
