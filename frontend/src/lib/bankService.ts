import fs from 'fs';
import path from 'path';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string | null;
  instructions?: string | null;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

const CACHE_FILE_PATH = path.join(process.cwd(), '.bank_accounts_cache.json');

const DEFAULT_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-sampath-118055314226',
    bank_name: 'Sampath Bank PLC',
    account_name: 'D.I.R.D. WIJESINGHE',
    account_number: '118055314226',
    branch_name: 'HEAD OFFICE',
    instructions: 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bank-dialog-001023077550',
    bank_name: 'Dialog Finance PLC',
    account_name: 'D.I.R.D. WIJESINGHE',
    account_number: '001023077550',
    branch_name: 'HEAD OFFICE',
    instructions: 'Please deposit or transfer the exact order amount and upload a clear screenshot of the transfer confirmation.',
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bank-boc-75566748',
    bank_name: 'Bank of Ceylon',
    account_name: 'D.I.R.D. WIJESINGHE',
    account_number: '75566748',
    branch_name: 'HAKMANA BRANCH',
    instructions: 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bank-nsb-300058079751',
    bank_name: 'National Savings Bank (NSB)',
    account_name: 'D.I.R.D. WIJESINGHE',
    account_number: '300058079751',
    branch_name: 'HAKMANA BRANCH',
    instructions: 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-project')) {
    return null;
  }
  try {
    return createAdminClient(supabaseUrl, supabaseServiceKey);
  } catch {
    return null;
  }
}

function readDiskCache(): BankAccount[] {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Note reading bank accounts disk cache:', e);
  }
  return DEFAULT_ACCOUNTS;
}

function writeDiskCache(accounts: BankAccount[]) {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(accounts, null, 2), 'utf8');
  } catch (e) {
    console.warn('Note writing bank accounts disk cache:', e);
  }
}

/**
 * Get all bank accounts (for admin management)
 */
export async function getAllBankAccounts(): Promise<BankAccount[]> {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        writeDiskCache(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase bank_accounts query failed, using cache:', e);
    }
  }
  return readDiskCache();
}

/**
 * Get active bank accounts (for public customer checkout)
 */
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
  const all = await getAllBankAccounts();
  const active = all.filter((a) => a.is_active);
  return active.length > 0 ? active : DEFAULT_ACCOUNTS;
}

/**
 * Create a new bank account
 */
export async function createBankAccount(account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
  const newAccount: BankAccount = {
    ...account,
    id: `bank_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{
          bank_name: account.bank_name,
          account_name: account.account_name,
          account_number: account.account_number,
          branch_name: account.branch_name || null,
          instructions: account.instructions || null,
          is_active: account.is_active ?? true,
          display_order: account.display_order ?? 0,
        }])
        .select()
        .single();

      if (!error && data) {
        const cached = readDiskCache().filter((a) => a.id !== data.id);
        cached.push(data);
        writeDiskCache(cached);
        return data;
      }
    } catch (e) {
      console.warn('Supabase insert failed, saving to local cache:', e);
    }
  }

  // Disk fallback
  const cached = readDiskCache();
  cached.push(newAccount);
  writeDiskCache(cached);
  return newAccount;
}

/**
 * Update an existing bank account
 */
export async function updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount | null> {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const cached = readDiskCache().map((a) => (a.id === id ? data : a));
        writeDiskCache(cached);
        return data;
      }
    } catch (e) {
      console.warn('Supabase update failed, updating local cache:', e);
    }
  }

  // Disk fallback
  const cached = readDiskCache();
  let updatedAccount: BankAccount | null = null;
  const next = cached.map((a) => {
    if (a.id === id) {
      updatedAccount = { ...a, ...updates, updated_at: new Date().toISOString() };
      return updatedAccount;
    }
    return a;
  });

  if (updatedAccount) {
    writeDiskCache(next);
  }
  return updatedAccount;
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string): Promise<boolean> {
  const supabase = getAdminClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (!error) {
        const cached = readDiskCache().filter((a) => a.id !== id);
        writeDiskCache(cached);
        return true;
      }
    } catch (e) {
      console.warn('Supabase delete failed, removing from local cache:', e);
    }
  }

  // Disk fallback
  const cached = readDiskCache();
  const next = cached.filter((a) => a.id !== id);
  writeDiskCache(next);
  return true;
}
