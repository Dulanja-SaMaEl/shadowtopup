const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdqyxwenhzhucmqiyogi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcXl4d2VuaHpodWNtcWl5b2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjkxNjA5NSwiZXhwIjoyMTAyNDkyMDk1fQ._28ze6ZDKyHPi7rz3Rk8gVXk2sw6th0Uu1GqikpAWys';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('--- Starting Products Seed ---');

  // 1. Fetch existing games
  const { data: games, error: gErr } = await supabase.from('games').select('id, slug, title');
  if (gErr || !games || games.length === 0) {
    console.error('Failed to fetch games:', gErr);
    process.exit(1);
  }

  console.log('Found games:', games.map(g => `${g.title} (${g.slug})`));

  const gameMap = {};
  games.forEach(g => {
    gameMap[g.slug] = g.id;
  });

  // 2. Check existing products
  const { data: existingProducts } = await supabase.from('products').select('id, name, game_id');
  if (existingProducts && existingProducts.length > 0) {
    console.log(`Products table already contains ${existingProducts.length} items. Skipping initial seed to avoid duplicates.`);
    return;
  }

  const productsToInsert = [];

  // Free Fire
  if (gameMap['free-fire']) {
    const ffId = gameMap['free-fire'];
    productsToInsert.push(
      { game_id: ffId, name: '100 Diamonds', price: 350.00, silver_price: 320.00, gold_price: 300.00, stock: 9999, is_published: true },
      { game_id: ffId, name: '310 Diamonds', price: 1050.00, silver_price: 980.00, gold_price: 920.00, stock: 9999, is_published: true },
      { game_id: ffId, name: '520 Diamonds', price: 1750.00, silver_price: 1620.00, gold_price: 1500.00, stock: 9999, is_published: true },
      { game_id: ffId, name: '1060 Diamonds', price: 3450.00, silver_price: 3200.00, gold_price: 3000.00, stock: 9999, is_published: true },
      { game_id: ffId, name: 'Weekly Membership Pass', price: 677.00, silver_price: 617.00, gold_price: 577.00, stock: 9999, is_published: true },
      { game_id: ffId, name: 'Weekly Lite Pass', price: 141.00, silver_price: 129.00, gold_price: 120.00, stock: 9999, is_published: true },
      { game_id: ffId, name: 'Monthly Membership Pass', price: 3387.00, silver_price: 3086.00, gold_price: 2885.00, stock: 9999, is_published: true }
    );
  }

  // Mobile Legends
  if (gameMap['mobile-legends']) {
    const mlId = gameMap['mobile-legends'];
    productsToInsert.push(
      { game_id: mlId, name: '86 Diamonds', price: 450.00, silver_price: 420.00, gold_price: 390.00, stock: 9999, is_published: true },
      { game_id: mlId, name: '172 Diamonds', price: 890.00, silver_price: 840.00, gold_price: 790.00, stock: 9999, is_published: true },
      { game_id: mlId, name: '257 Diamonds', price: 1320.00, silver_price: 1250.00, gold_price: 1180.00, stock: 9999, is_published: true },
      { game_id: mlId, name: 'Weekly Diamond Pass', price: 650.00, silver_price: 610.00, gold_price: 570.00, stock: 9999, is_published: true }
    );
  }

  // PUBG Mobile
  if (gameMap['pubg-mobile']) {
    const pubgId = gameMap['pubg-mobile'];
    productsToInsert.push(
      { game_id: pubgId, name: '60 UC', price: 350.00, silver_price: 325.00, gold_price: 300.00, stock: 9999, is_published: true },
      { game_id: pubgId, name: '325 UC', price: 1750.00, silver_price: 1650.00, gold_price: 1550.00, stock: 9999, is_published: true },
      { game_id: pubgId, name: '660 UC', price: 3450.00, silver_price: 3250.00, gold_price: 3050.00, stock: 9999, is_published: true },
      { game_id: pubgId, name: 'Royale Pass Upgrade', price: 3200.00, silver_price: 3000.00, gold_price: 2800.00, stock: 9999, is_published: true }
    );
  }

  console.log(`Inserting ${productsToInsert.length} products...`);
  const { data: inserted, error: iErr } = await supabase.from('products').insert(productsToInsert).select();
  if (iErr) {
    console.error('Error inserting products:', iErr);
    process.exit(1);
  }

  console.log(`Successfully seeded ${inserted.length} products into Supabase!`);
}

seed();
