const http = require('http');
const { WebSocketServer } = require('ws');
const log = require('./logger');

const PORT = 3456;
const clients = new Set();
let workerStatus = 'STARTING';
let ordersProcessed = 0;
let ordersFailed = 0;
let lastOrderTime = null;

function broadcast(data) {
  for (const client of clients) {
    if (client.readyState === 1) client.send(data);
  }
}

function setStatus(status) {
  workerStatus = status;
  broadcast(JSON.stringify({ type: 'status', status }));
}

function orderProcessed(success) {
  if (success) ordersProcessed++;
  else ordersFailed++;
  lastOrderTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  broadcast(JSON.stringify({ type: 'stats', ordersProcessed, ordersFailed, lastOrderTime }));
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ShadowTopUp — Worker Live Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#080714;--card:#0f0c22;--border:#1e1a38;
    --cyan:#22d3ee;--purple:#a78bfa;--green:#34d399;
    --red:#f87171;--amber:#fbbf24;--pink:#f472b6;
    --text:#e2e8f0;--muted:#64748b;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
  
  /* Animated gradient header */
  header{
    background:linear-gradient(135deg,#0f0c22 0%,#1a1040 50%,#0c1a2e 100%);
    border-bottom:1px solid var(--border);
    padding:0 32px;
    display:flex;align-items:center;justify-content:space-between;
    height:64px;position:sticky;top:0;z-index:100;
    backdrop-filter:blur(20px);
  }
  .brand{display:flex;align-items:center;gap:12px}
  .brand-icon{
    width:36px;height:36px;border-radius:10px;
    background:linear-gradient(135deg,var(--cyan),var(--purple));
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 0 20px rgba(34,211,238,.3);
  }
  .brand-name{font-size:15px;font-weight:900;letter-spacing:.05em;color:#fff}
  .brand-sub{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-weight:600;letter-spacing:.1em}
  
  #status-pill{
    padding:6px 16px;border-radius:999px;font-size:11px;font-weight:700;
    font-family:'JetBrains Mono',monospace;letter-spacing:.08em;
    display:flex;align-items:center;gap:8px;transition:all .3s;
    background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:var(--amber);
  }
  #status-pill.connected{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.3);color:var(--green)}
  #status-pill.error{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.3);color:var(--red)}
  .pulse{width:8px;height:8px;border-radius:50%;background:currentColor;
    animation:pulse 1.5s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

  main{max-width:1400px;margin:0 auto;padding:28px 24px;display:flex;flex-direction:column;gap:24px}

  /* Stats Row */
  .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .stat-card{
    background:var(--card);border:1px solid var(--border);border-radius:16px;
    padding:20px;display:flex;flex-direction:column;gap:4px;
    position:relative;overflow:hidden;transition:border-color .3s;
  }
  .stat-card::before{
    content:'';position:absolute;inset:0;opacity:.05;
    background:linear-gradient(135deg,var(--accent,var(--cyan)),transparent);
    pointer-events:none;
  }
  .stat-card:hover{border-color:var(--accent,var(--cyan))}
  .stat-label{font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}
  .stat-value{font-size:28px;font-weight:900;color:var(--accent,var(--cyan));line-height:1.1;
    font-family:'JetBrains Mono',monospace}
  .stat-sub{font-size:11px;color:var(--muted);margin-top:2px}

  /* Log Panel */
  .log-panel{background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;flex:1}
  .log-header{
    padding:16px 24px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(255,255,255,.02);
  }
  .log-title{font-size:13px;font-weight:700;letter-spacing:.05em;
    display:flex;align-items:center;gap:8px}
  .live-dot{width:8px;height:8px;border-radius:50%;background:var(--green);
    animation:pulse 1s ease-in-out infinite;box-shadow:0 0 8px var(--green)}
  .log-controls{display:flex;gap:8px}
  .btn{
    padding:6px 14px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;
    border:1px solid var(--border);background:rgba(255,255,255,.05);color:var(--muted);
    transition:all .2s;font-family:inherit;letter-spacing:.04em;
  }
  .btn:hover{background:rgba(255,255,255,.1);color:var(--text);border-color:var(--purple)}
  
  #log-container{
    height:520px;overflow-y:auto;padding:12px 0;
    font-family:'JetBrains Mono',monospace;font-size:12.5px;
    scroll-behavior:smooth;
  }
  #log-container::-webkit-scrollbar{width:4px}
  #log-container::-webkit-scrollbar-track{background:transparent}
  #log-container::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

  .log-entry{
    padding:6px 24px;display:flex;align-items:flex-start;gap:10px;
    border-left:2px solid transparent;transition:background .15s;
    animation:slideIn .2s ease-out;
  }
  .log-entry:hover{background:rgba(255,255,255,.025)}
  @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
  
  .log-entry.ERROR{border-left-color:var(--red);background:rgba(248,113,113,.04)}
  .log-entry.SUCCESS{border-left-color:var(--green)}
  .log-entry.ORDER{border-left-color:var(--pink);background:rgba(244,114,182,.04)}
  .log-entry.STEP{border-left-color:var(--purple)}

  .log-ts{color:var(--muted);font-size:11px;flex-shrink:0;padding-top:1px}
  .log-icon{flex-shrink:0;font-size:13px}
  .log-msg{line-height:1.5;word-break:break-word}

  .divider{
    margin:6px 24px;border:none;border-top:1px solid var(--border);opacity:.5;
  }

  /* Connection banner */
  #conn-banner{
    background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);
    border-radius:12px;padding:12px 20px;font-size:13px;color:var(--amber);
    display:flex;align-items:center;gap:10px;
  }
  #conn-banner.hidden{display:none}

  @media(max-width:768px){
    .stats-row{grid-template-columns:repeat(2,1fr)}
    main{padding:16px}
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    <div class="brand-icon">⚡</div>
    <div>
      <div class="brand-name">SHADOW<span style="color:var(--cyan)">TOPUP</span></div>
      <div class="brand-sub">LOCAL FULFILLMENT WORKER — LIVE DASHBOARD</div>
    </div>
  </div>
  <div id="status-pill">
    <span class="pulse"></span>
    <span id="status-text">CONNECTING...</span>
  </div>
</header>

<main>
  <div id="conn-banner">⚠ Connecting to local worker... Make sure <code>node index.js</code> is running.</div>

  <div class="stats-row">
    <div class="stat-card" style="--accent:var(--green)">
      <div class="stat-label">Orders Fulfilled</div>
      <div class="stat-value" id="stat-ok">0</div>
      <div class="stat-sub">Successfully delivered</div>
    </div>
    <div class="stat-card" style="--accent:var(--red)">
      <div class="stat-label">Orders Failed</div>
      <div class="stat-value" id="stat-fail">0</div>
      <div class="stat-sub">Require manual action</div>
    </div>
    <div class="stat-card" style="--accent:var(--purple)">
      <div class="stat-label">Worker Status</div>
      <div class="stat-value" id="stat-status" style="font-size:16px;padding-top:4px">●  LIVE</div>
      <div class="stat-sub">Real-time listener active</div>
    </div>
    <div class="stat-card" style="--accent:var(--cyan)">
      <div class="stat-label">Last Activity</div>
      <div class="stat-value" id="stat-time" style="font-size:15px;padding-top:4px">—</div>
      <div class="stat-sub">Most recent order time</div>
    </div>
  </div>

  <div class="log-panel">
    <div class="log-header">
      <div class="log-title">
        <div class="live-dot"></div>
        LIVE LOG STREAM
      </div>
      <div class="log-controls">
        <button class="btn" onclick="toggleScroll()">⏸ Pause Scroll</button>
        <button class="btn" onclick="clearLogs()">🗑 Clear</button>
      </div>
    </div>
    <div id="log-container"></div>
  </div>
</main>

<script>
  const container = document.getElementById('log-container');
  const banner = document.getElementById('conn-banner');
  const pill = document.getElementById('status-pill');
  const pillText = document.getElementById('status-text');
  let autoScroll = true;

  function addLog(data) {
    const el = document.createElement('div');
    el.className = 'log-entry ' + (data.level || '');
    el.innerHTML = \`
      <span class="log-ts">\${data.ts}</span>
      <span class="log-icon">\${data.icon || 'ℹ'}</span>
      <span class="log-msg" style="color:\${data.color || '#e2e8f0'}">\${escapeHtml(data.message)}</span>
    \`;
    container.appendChild(el);
    if (autoScroll) container.scrollTop = container.scrollHeight;
  }

  function addDivider() {
    const hr = document.createElement('hr');
    hr.className = 'divider';
    container.appendChild(hr);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function toggleScroll() {
    autoScroll = !autoScroll;
    document.querySelector('[onclick="toggleScroll()"]').textContent = autoScroll ? '⏸ Pause Scroll' : '▶ Resume Scroll';
  }

  function clearLogs() { container.innerHTML = ''; }

  function setConnected(ok) {
    if (ok) {
      pill.className = 'connected';
      pillText.textContent = 'WORKER CONNECTED';
      banner.classList.add('hidden');
      document.getElementById('stat-status').textContent = '●  LIVE';
      document.getElementById('stat-status').style.color = 'var(--green)';
    } else {
      pill.className = 'error';
      pillText.textContent = 'DISCONNECTED';
      banner.classList.remove('hidden');
      document.getElementById('stat-status').textContent = '○  OFFLINE';
      document.getElementById('stat-status').style.color = 'var(--red)';
    }
  }

  function connect() {
    const ws = new WebSocket('ws://localhost:3456');

    ws.onopen = () => {
      setConnected(true);
      addLog({ level:'SUCCESS', icon:'✅', color:'#34d399', message:'Connected to ShadowTopUp Local Worker!', ts: new Date().toLocaleTimeString('en-US',{hour12:false}) });
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'log') {
          addLog(data);
        } else if (data.type === 'stats') {
          document.getElementById('stat-ok').textContent   = data.ordersProcessed;
          document.getElementById('stat-fail').textContent = data.ordersFailed;
          document.getElementById('stat-time').textContent = data.lastOrderTime || '—';
        } else if (data.type === 'status') {
          pillText.textContent = data.status;
        } else if (data.type === 'divider') {
          addDivider();
        }
      } catch(_) {}
    };

    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000); // auto-reconnect every 3s
    };

    ws.onerror = () => ws.close();
  }

  connect();
</script>
</body>
</html>`;

function startDashboard() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
  });

  const wss = new WebSocketServer({ server });

  // Attach extension message handler
  const { registerExtensionResponseHandler } = require('./garenaFulfill');
  registerExtensionResponseHandler(wss);

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'REGISTER_CLIENT' && data.client === 'CHROME_EXTENSION') {
          ws.isExtension = true;
          log.success('🔌 Chrome Extension connected to local worker!');
        } else if (data.type === 'SYNC_SHELL_BALANCE' && typeof data.balance === 'number') {
          log.db(`🐚 Live Garena Shell balance auto-detected from browser: ${data.balance} Shells!`);
          const { updateLiveShellBalance } = require('./supabaseListener');
          if (typeof updateLiveShellBalance === 'function') {
            updateLiveShellBalance(data.balance);
          }
        }
      } catch (_) {}
    });

    ws.on('close', () => {
      clients.delete(ws);
      if (ws.isExtension) {
        log.warn('🔌 Chrome Extension disconnected from local worker.');
      }
    });

    ws.on('error', () => clients.delete(ws));
    // Send current stats on connect
    ws.send(JSON.stringify({ type: 'stats', ordersProcessed, ordersFailed, lastOrderTime }));
    ws.send(JSON.stringify({ type: 'status', status: workerStatus }));
  });

  server.listen(PORT, () => {
    console.log(`\n[Dashboard] 🖥  Live Dashboard running at → http://localhost:${PORT}\n`);
  });
}

module.exports = { broadcast, startDashboard, setStatus, orderProcessed };
