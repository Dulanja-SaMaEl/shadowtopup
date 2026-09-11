const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdqyxwenhzhucmqiyogi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcXl4d2VuaHpodWNtcWl5b2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkxNjA5NSwiZXhwIjoyMTAyNDkyMDk1fQ._28ze6ZDKyHPi7rz3Rk8gVXk2sw6th0Uu1GqikpAWys';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DIAMOND_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png';
const WEEKLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/002/010/logo.png';
const WEEKLY_LITE_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png';
const MONTHLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png';

const UCBOT_20_PACKAGES = [
  // 1. Diamonds
  {
    id: '11111111-1111-1111-1111-111111111001',
    package_name: '25 Diamond',
    package_type: 'diamond',
    diamond_amount: 25,
    shell_cost: 13,
    normal_price: 100.00,
    silver_price: 93.00,
    gold_price: 87.00,
    badge: 'MINI',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111002',
    package_name: '100 Diamond',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 50,
    normal_price: 350.00,
    silver_price: 320.00,
    gold_price: 300.00,
    badge: 'STARTER',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111003',
    package_name: '310 Diamond',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 152,
    normal_price: 1050.00,
    silver_price: 980.00,
    gold_price: 920.00,
    badge: 'POPULAR',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111004',
    package_name: '520 Diamond',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 254,
    normal_price: 1750.00,
    silver_price: 1620.00,
    gold_price: 1500.00,
    badge: 'VALUE',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111005',
    package_name: '1060 Diamond',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 500,
    normal_price: 3450.00,
    silver_price: 3200.00,
    gold_price: 3000.00,
    badge: 'HOT DEAL',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111006',
    package_name: '2180 Diamond',
    package_type: 'diamond',
    diamond_amount: 2180,
    shell_cost: 1010,
    normal_price: 6900.00,
    silver_price: 6400.00,
    gold_price: 6000.00,
    badge: 'BEST VALUE',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111007',
    package_name: '5600 Diamond',
    package_type: 'diamond',
    diamond_amount: 5600,
    shell_cost: 2500,
    normal_price: 17500.00,
    silver_price: 16200.00,
    gold_price: 15000.00,
    badge: 'PRO VAULT',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111008',
    package_name: '11500 Diamond',
    package_type: 'diamond',
    diamond_amount: 11500,
    shell_cost: 5000,
    normal_price: 34900.00,
    silver_price: 32500.00,
    gold_price: 30500.00,
    badge: 'MEGA VAULT',
    image_url: DIAMOND_CDN,
    is_active: true,
  },

  // 2. Passes & Subscriptions
  {
    id: '11111111-1111-1111-1111-111111111009',
    package_name: 'Weekly Lite Pack',
    package_type: 'weekly_pass',
    diamond_amount: 120,
    shell_cost: 18,
    normal_price: 140.00,
    silver_price: 129.00,
    gold_price: 120.00,
    badge: 'NEW LITE PASS',
    image_url: WEEKLY_LITE_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111010',
    package_name: 'Weekly Subscription',
    package_type: 'weekly_pass',
    diamond_amount: 450,
    shell_cost: 86,
    normal_price: 650.00,
    silver_price: 600.00,
    gold_price: 550.00,
    badge: 'WEEKLY VIP',
    image_url: WEEKLY_PASS_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111011',
    package_name: 'Monthly Subscription',
    package_type: 'monthly_pass',
    diamond_amount: 2600,
    shell_cost: 430,
    normal_price: 3200.00,
    silver_price: 3000.00,
    gold_price: 2800.00,
    badge: 'VIP BEST VALUE',
    image_url: MONTHLY_PASS_CDN,
    is_active: true,
  },

  // 3. EVO Gun Access
  {
    id: '11111111-1111-1111-1111-111111111012',
    package_name: 'EVO 3 Days',
    package_type: 'evo_access',
    diamond_amount: 0,
    shell_cost: 20,
    normal_price: 150.00,
    silver_price: 135.00,
    gold_price: 125.00,
    badge: '3 DAYS EVO',
    image_url: WEEKLY_LITE_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111013',
    package_name: 'EVO 7 Days',
    package_type: 'evo_access',
    diamond_amount: 0,
    shell_cost: 45,
    normal_price: 320.00,
    silver_price: 295.00,
    gold_price: 275.00,
    badge: '7 DAYS EVO',
    image_url: WEEKLY_PASS_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111014',
    package_name: 'EVO 30 Days',
    package_type: 'evo_access',
    diamond_amount: 0,
    shell_cost: 180,
    normal_price: 1250.00,
    silver_price: 1150.00,
    gold_price: 1080.00,
    badge: '30 DAYS EVO',
    image_url: MONTHLY_PASS_CDN,
    is_active: true,
  },

  // 4. Level Up Passes
  {
    id: '11111111-1111-1111-1111-111111111015',
    package_name: 'Level Up 6',
    package_type: 'levelup_pass',
    diamond_amount: 200,
    shell_cost: 16,
    normal_price: 140.00,
    silver_price: 125.00,
    gold_price: 115.00,
    badge: 'LVL 6',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111016',
    package_name: 'Level Up 10',
    package_type: 'levelup_pass',
    diamond_amount: 400,
    shell_cost: 34,
    normal_price: 260.00,
    silver_price: 235.00,
    gold_price: 220.00,
    badge: 'LVL 10',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111017',
    package_name: 'Level Up 15',
    package_type: 'levelup_pass',
    diamond_amount: 550,
    shell_cost: 40,
    normal_price: 300.00,
    silver_price: 275.00,
    gold_price: 255.00,
    badge: 'LVL 15',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111018',
    package_name: 'Level Up 20',
    package_type: 'levelup_pass',
    diamond_amount: 700,
    shell_cost: 45,
    normal_price: 330.00,
    silver_price: 305.00,
    gold_price: 285.00,
    badge: 'LVL 20',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111019',
    package_name: 'Level Up 25',
    package_type: 'levelup_pass',
    diamond_amount: 850,
    shell_cost: 48,
    normal_price: 350.00,
    silver_price: 325.00,
    gold_price: 305.00,
    badge: 'LVL 25',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111020',
    package_name: 'Level Up 30',
    package_type: 'levelup_pass',
    diamond_amount: 1000,
    shell_cost: 50,
    normal_price: 380.00,
    silver_price: 350.00,
    gold_price: 330.00,
    badge: 'LVL 30 MAX',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
];

async function syncDatabase() {
  console.log('=== Starting UCBot Product & Package DB Sync ===');

  // 1. Sync 'packages' table
  console.log('\n1. Synchronizing "packages" table...');

  // Delete all existing packages to eliminate old duplicates
  const { error: delErr } = await supabase.from('packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.warn('Note deleting existing packages:', delErr.message);
  }

  const packagesToInsert = UCBOT_20_PACKAGES.map(pkg => ({
    id: pkg.id,
    package_name: pkg.package_name,
    package_type: pkg.package_type,
    diamond_amount: pkg.diamond_amount,
    shell_cost: pkg.shell_cost,
    normal_price: pkg.normal_price,
    silver_price: pkg.silver_price,
    gold_price: pkg.gold_price,
    badge: pkg.badge,
    image_url: pkg.image_url,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data: insertedPackages, error: pErr } = await supabase.from('packages').upsert(packagesToInsert, { onConflict: 'id' }).select();
  if (pErr) {
    console.error('Failed to insert packages:', pErr);
  } else {
    console.log(`✓ Successfully updated ${insertedPackages.length} official UCBot packages in "packages" table.`);
  }

  // 2. Sync 'products' table for Free Fire
  console.log('\n2. Synchronizing "products" table (Free Fire inventory)...');
  const { data: games } = await supabase.from('games').select('id, slug, title');
  const ffGame = games?.find(g => g.slug === 'free-fire');

  if (ffGame) {
    const ffId = ffGame.id;

    // Delete existing Free Fire products to refresh with official 20 list
    await supabase.from('products').delete().eq('game_id', ffId);

    const productsToInsert = UCBOT_20_PACKAGES.map(pkg => ({
      game_id: ffId,
      name: pkg.package_name,
      price: pkg.normal_price,
      silver_price: pkg.silver_price,
      gold_price: pkg.gold_price,
      stock: 9999,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data: insertedProducts, error: prErr } = await supabase.from('products').insert(productsToInsert).select();
    if (prErr) {
      console.error('Failed to insert products:', prErr);
    } else {
      console.log(`✓ Successfully updated ${insertedProducts.length} products for Free Fire in "products" table.`);
    }
  } else {
    console.warn('Free Fire game not found in "games" table.');
  }

  // 3. Verify final state
  console.log('\n3. Verifying Final DB Records:');
  const { data: finalPkgs } = await supabase.from('packages').select('package_name, package_type, diamond_amount, shell_cost, normal_price');
  console.log(`Total active packages in DB: ${finalPkgs?.length}`);
  finalPkgs?.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.package_type}] ${p.package_name} - Shells: ${p.shell_cost} | LKR ${p.normal_price}`);
  });

  console.log('\n=== Database synchronization complete! ===');
}

syncDatabase().catch(err => console.error(err));
