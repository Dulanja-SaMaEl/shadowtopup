const { broadcast } = require('./dashboard');

const LEVELS = {
  INFO:    { color: '#60a5fa', icon: 'ℹ' },
  SUCCESS: { color: '#34d399', icon: '✅' },
  ERROR:   { color: '#f87171', icon: '❌' },
  WARN:    { color: '#fbbf24', icon: '⚠' },
  STEP:    { color: '#a78bfa', icon: '▶' },
  DB:      { color: '#38bdf8', icon: '🗄' },
  ORDER:   { color: '#f472b6', icon: '🔔' },
};

function log(level, message) {
  const meta = LEVELS[level] || LEVELS.INFO;
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const consoleLine = `[${ts}] ${meta.icon}  ${message}`;
  console.log(consoleLine);

  try {
    broadcast(JSON.stringify({
      type: 'log',
      level,
      icon: meta.icon,
      color: meta.color,
      message,
      ts,
    }));
  } catch (_) {}
}

module.exports = {
  info:    (msg) => log('INFO',    msg),
  success: (msg) => log('SUCCESS', msg),
  error:   (msg) => log('ERROR',   msg),
  warn:    (msg) => log('WARN',    msg),
  step:    (msg) => log('STEP',    msg),
  db:      (msg) => log('DB',      msg),
  order:   (msg) => log('ORDER',   msg),
};
