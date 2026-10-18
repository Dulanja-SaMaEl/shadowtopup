import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authGuard';
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '@/lib/bankService';

// GET: Fetch all bank accounts for admin management
export async function GET() {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const accounts = await getAllBankAccounts();
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    console.error('[Admin Bank Details GET Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

// POST: Create a new bank account
export async function POST(request: NextRequest) {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bank_name, account_name, account_number, branch_name, instructions, is_active, display_order } = body;

    if (!bank_name || !account_name || !account_number) {
      return NextResponse.json(
        { success: false, message: 'Bank Name, Account Name, and Account Number are required.' },
        { status: 400 }
      );
    }

    const created = await createBankAccount({
      bank_name: String(bank_name).trim(),
      account_name: String(account_name).trim(),
      account_number: String(account_number).trim(),
      branch_name: branch_name ? String(branch_name).trim() : null,
      instructions: instructions ? String(instructions).trim() : null,
      is_active: is_active ?? true,
      display_order: Number(display_order) || 0,
    });

    return NextResponse.json({ success: true, account: created, message: 'Bank account added successfully.' });
  } catch (err: any) {
    console.error('[Admin Bank Details POST Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Failed to create bank account' }, { status: 500 });
  }
}

// PUT: Update an existing bank account
export async function PUT(request: NextRequest) {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, bank_name, account_name, account_number, branch_name, instructions, is_active, display_order } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Account ID is required.' }, { status: 400 });
    }

    const updated = await updateBankAccount(id, {
      ...(bank_name !== undefined && { bank_name: String(bank_name).trim() }),
      ...(account_name !== undefined && { account_name: String(account_name).trim() }),
      ...(account_number !== undefined && { account_number: String(account_number).trim() }),
      ...(branch_name !== undefined && { branch_name: branch_name ? String(branch_name).trim() : null }),
      ...(instructions !== undefined && { instructions: instructions ? String(instructions).trim() : null }),
      ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      ...(display_order !== undefined && { display_order: Number(display_order) }),
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Bank account not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, account: updated, message: 'Bank account updated successfully.' });
  } catch (err: any) {
    console.error('[Admin Bank Details PUT Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Failed to update bank account' }, { status: 500 });
  }
}

// DELETE: Delete a bank account
export async function DELETE(request: NextRequest) {
  const adminAuth = await requireAdmin();
  if (!adminAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Account ID is required.' }, { status: 400 });
    }

    const deleted = await deleteBankAccount(id);
    return NextResponse.json({ success: true, deleted, message: 'Bank account deleted successfully.' });
  } catch (err: any) {
    console.error('[Admin Bank Details DELETE Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Failed to delete bank account' }, { status: 500 });
  }
}
