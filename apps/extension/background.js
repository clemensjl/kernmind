const DEFAULT_API_URL = 'http://localhost:3000';

async function getApiUrl() {
  const data = await chrome.storage.sync.get(['apiUrl']);
  return data.apiUrl || DEFAULT_API_URL;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openmind-save-page',
    title: 'Save Page to OpenMind',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'openmind-save-selection',
    title: 'Save Quote "%s" to OpenMind',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'openmind-save-image',
    title: 'Save Image to OpenMind',
    contexts: ['image'],
  });

  chrome.contextMenus.create({
    id: 'openmind-save-link',
    title: 'Save Link to OpenMind',
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const apiUrl = await getApiUrl();
  let payload = {};

  if (info.menuItemId === 'openmind-save-page') {
    payload = {
      url: tab?.url,
      title: tab?.title,
      type: 'article',
    };
  } else if (info.menuItemId === 'openmind-save-selection') {
    payload = {
      type: 'quote',
      text: info.selectionText,
      url: tab?.url,
      title: tab?.title ? `Quote from ${tab.title}` : 'Saved Quote',
    };
  } else if (info.menuItemId === 'openmind-save-image') {
    payload = {
      type: 'image',
      imageUrl: info.srcUrl,
      url: tab?.url,
      title: tab?.title ? `Image from ${tab.title}` : 'Saved Image',
    };
  } else if (info.menuItemId === 'openmind-save-link') {
    payload = {
      url: info.linkUrl,
      type: 'article',
    };
  }

  try {
    const res = await fetch(`${apiUrl}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2500);

      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'show_toast',
          message: 'Saved to your Mind!',
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('OpenMind capture error:', err);
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
  }
});
