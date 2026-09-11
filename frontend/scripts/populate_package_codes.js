// Script to populate package_code on Supabase packages table once the column is added
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdqyxwenhzhucmqiyogi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcXl4d2VuaHpodWNtcWl5b2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkxNjA5NSwiZXhwIjoyMTAyNDkyMDk1fQ._28ze6ZDKyHPi7rz3Rk8gVXk2sw6th0Uu1GqikpAWys';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PACKAGE_CODE_MAPPING = [
  { id: '11111111-1111-1111-1111-111111111001', code: '25' },
  { id: '11111111-1111-1111-1111-111111111002', code: '100' },
  { id: '11111111-1111-1111-1111-111111111003', code: '310' },
  { id: '11111111-1111-1111-1111-111111111004', code: '520' },
  { id: '11111111-1111-1111-1111-111111111005', code: '1060' },
  { id: '11111111-1111-1111-1111-111111111006', code: '2180' },
  { id: '11111111-1111-1111-1111-111111111007', code: '5600' },
  { id: '11111111-1111-1111-1111-111111111008', code: '11500' },
  { id: '11111111-1111-1111-1111-111111111009', code: 'LITE' },
  { id: '11111111-1111-1111-1111-111111111010', code: 'WEEKLY' },
  { id: '11111111-1111-1111-1111-111111111011', code: 'MONTHLY' },
  { id: '11111111-1111-1111-1111-111111111012', code: '3D' },
  { id: '11111111-1111-1111-1111-111111111013', code: '7D' },
  { id: '11111111-1111-1111-1111-111111111014', code: '30D' },
  { id: '11111111-1111-1111-1111-111111111015', code: 'lvl6' },
  { id: '11111111-1111-1111-1111-111111111016', code: 'lvl10' },
  { id: '11111111-1111-1111-1111-111111111017', code: 'lvl15' },
  { id: '11111111-1111-1111-1111-111111111018', code: 'lvl20' },
  { id: '11111111-1111-1111-1111-111111111019', code: 'lvl25' },
  { id: '11111111-1111-1111-1111-111111111020', code: 'lvl30' },
];

async function run() {
  console.log('Testing if package_code column exists...');
  const { data, error } = await supabase.from('packages').select('id, package_code').limit(1);
  if (error && error.code === '42703') {
    console.error('Column package_code does not exist yet.');
    console.log('Please execute this SQL in your Supabase SQL Editor:');
    console.log('ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_code TEXT;');
    return;
  }
  if (error) {
    console.error('Database query error:', error.message);
    return;
  }

  console.log('Column package_code detected! Updating packages with exact codes...');
  for (const item of PACKAGE_CODE_MAPPING) {
    const { error: updErr } = await supabase
      .from('packages')
      .update({ package_code: item.code })
      .eq('id', item.id);
    if (updErr) {
      console.error(`Failed to update ${item.id}:`, updErr.message);
    } else {
      console.log(`Updated ${item.id} -> code: ${item.code}`);
    }
  }
  console.log('All packages updated successfully with package_code!');
}

run();
