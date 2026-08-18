// Options logic
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.sync.get(['apiUrl']);
  document.getElementById('apiUrl').value = data.apiUrl || 'http://localhost:3000';
});

document.getElementById('btn-save').addEventListener('click', async () => {
  const apiUrl = document.getElementById('apiUrl').value.trim() || 'http://localhost:3000';
  await chrome.storage.sync.set({ apiUrl });

  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Settings saved!';
  setTimeout(() => {
    statusEl.textContent = '';
  }, 2000);
});
