require('dotenv').config();
const { startListener } = require('./supabaseListener');

// Validate required environment variables
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GARENA_USERNAME', 'GARENA_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`\n[Worker] ❌ Missing required environment variables:\n  ${missing.join('\n  ')}`);
  console.error('\n[Worker] Please copy .env.example to .env and fill in your values.\n');
  process.exit(1);
}

console.log(`
╔══════════════════════════════════════════════════════════╗
║       SHADOWTOPUP LOCAL FULFILLMENT WORKER v1.0          ║
║──────────────────────────────────────────────────────────║
║  Supabase  : ${process.env.SUPABASE_URL.slice(0, 42).padEnd(42)} ║
║  Account   : ${process.env.GARENA_USERNAME.padEnd(42)} ║
║  Mode      : ${(process.env.HEADLESS === 'false' ? 'VISIBLE BROWSER' : 'HEADLESS BROWSER').padEnd(42)} ║
╚══════════════════════════════════════════════════════════╝
`);

startListener().catch(err => {
  console.error('[Worker] Fatal error:', err.message);
  process.exit(1);
});

// Keep process alive and handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Worker] Shutting down gracefully...');
  process.exit(0);
});
