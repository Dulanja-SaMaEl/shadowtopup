function updateStatus() {
  chrome.storage.local.get(['status'], (result) => {
    const badge = document.getElementById('badge');
    if (result.status === 'CONNECTED') {
      badge.textContent = 'ACTIVE';
      badge.className = 'status-badge connected';
    } else {
      badge.textContent = 'DISCONNECTED';
      badge.className = 'status-badge disconnected';
    }
  });
}

updateStatus();
setInterval(updateStatus, 1000);
