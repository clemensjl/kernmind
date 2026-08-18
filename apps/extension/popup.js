// KernMind Popup Logic

const DEFAULT_API_URL = 'http://localhost:3000';

async function getApiUrl() {
  const data = await chrome.storage.sync.get(['apiUrl']);
  return data.apiUrl || DEFAULT_API_URL;
}

function showStatus(text, isError = false) {
  const statusEl = document.getElementById('popup-status');
  statusEl.textContent = text;
  statusEl.className = `popup-status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    statusEl.className = 'popup-status';
  }, 2500);
}

// Load active tab info
let currentTab = null;
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs[0]) {
    currentTab = tabs[0];
    document.getElementById('tab-title').textContent = currentTab.title || 'Untitled';
    document.getElementById('tab-url').textContent = currentTab.url || '';
    
    if (currentTab.favIconUrl) {
      document.getElementById('tab-favicon').src = currentTab.favIconUrl;
    } else {
      document.getElementById('tab-favicon').style.display = 'none';
    }
  }
});

// Save active page
document.getElementById('btn-save-page').addEventListener('click', async () => {
  if (!currentTab) return;
  const btn = document.getElementById('btn-save-page');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const apiUrl = await getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title,
        type: 'article',
      }),
    });

    if (res.ok) {
      btn.textContent = '✓ Saved!';
      showStatus('Saved to your Mind!');
      setTimeout(() => window.close(), 1200);
    } else {
      throw new Error('Save failed');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Save Page';
    showStatus('Could not reach KernMind server', true);
  }
});

// Save quick note
document.getElementById('btn-save-note').addEventListener('click', async () => {
  const text = document.getElementById('quick-note').value.trim();
  if (!text) return;

  const btn = document.getElementById('btn-save-note');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const apiUrl = await getApiUrl();
  try {
    const res = await fetch(`${apiUrl}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        type: 'note',
      }),
    });

    if (res.ok) {
      document.getElementById('quick-note').value = '';
      showStatus('Note saved to your Mind!');
      setTimeout(() => window.close(), 1000);
    } else {
      throw new Error('Failed');
    }
  } catch (err) {
    showStatus('Error saving note', true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Note';
  }
});

// Eyedropper tool
document.getElementById('btn-eyedropper').addEventListener('click', async () => {
  if (!window.EyeDropper) {
    showStatus('Eyedropper not supported in this browser', true);
    return;
  }

  try {
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    if (result && result.sRGBHex) {
      const hex = result.sRGBHex.toUpperCase();
      const apiUrl = await getApiUrl();

      await fetch(`${apiUrl}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'color',
          text: hex,
          colors: [hex],
        }),
      });

      showStatus(`Saved color ${hex}!`);
      setTimeout(() => window.close(), 1200);
    }
  } catch (err) {
    console.log('Eyedropper canceled or failed');
  }
});
