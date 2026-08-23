require('dotenv').config();
const { startDashboard, setStatus } = require('./dashboard');
const { startListener } = require('./supabaseListener');
const log = require('./logger');

// Validate required environment variables
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GARENA_USERNAME', 'GARENA_PASSWORD'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`\n[Worker] ❌ Missing required environment variables:\n  ${missing.join('\n  ')}`);
  console.error('\n[Worker] Please copy .env.example to .env and fill in your values.\n');
  process.exit(1);
}

// Start the live dashboard first
startDashboard();

log.info('ShadowTopUp Local Fulfillment Worker v1.0 started');
log.info(`Supabase  : ${process.env.SUPABASE_URL}`);
log.info(`Account   : ${process.env.GARENA_USERNAME}`);
log.info(`Mode      : ${process.env.HEADLESS === 'false' ? 'VISIBLE BROWSER' : 'HEADLESS BROWSER'}`);
log.info('Dashboard : http://localhost:3456');

setStatus('RUNNING');

startListener().catch(err => {
  log.error(`Fatal error: ${err.message}`);
  setStatus('ERROR');
  process.exit(1);
});

process.on('SIGINT', () => {
  log.warn('Worker shutting down...');
  process.exit(0);
});
