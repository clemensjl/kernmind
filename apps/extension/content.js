// KernMind Content Script

let floatingButton = null;

function createFloatingButton() {
  if (floatingButton) return floatingButton;

  floatingButton = document.createElement('div');
  floatingButton.id = 'kernmind-highlight-btn';
  floatingButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8Z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8Z"/>
    </svg>
    <span>Save to Mind</span>
  `;
  document.body.appendChild(floatingButton);

  floatingButton.addEventListener('mousedown', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selection = window.getSelection()?.toString().trim();
    if (!selection) return;

    hideFloatingButton();

    try {
      const response = await fetch('http://localhost:3000/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          text: selection,
          url: window.location.href,
          title: `Quote from ${document.title}`,
        }),
      });

      if (response.ok) {
        showToast('Quote saved to your Mind!');
      }
    } catch (err) {
      showToast('Could not reach KernMind server');
    }
  });

  return floatingButton;
}

function showFloatingButton(x, y) {
  const btn = createFloatingButton();
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  btn.style.display = 'flex';
}

function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.style.display = 'none';
  }
}

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 5) {
    const range = window.getSelection()?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();
    if (rect) {
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      showFloatingButton(rect.left + scrollX + rect.width / 2 - 50, rect.top + scrollY - 38);
    }
  } else {
    hideFloatingButton();
  }
});

document.addEventListener('mousedown', (e) => {
  if (e.target && !e.target.closest('#kernmind-highlight-btn')) {
    hideFloatingButton();
  }
});

// Toast notification
function showToast(message) {
  const existing = document.getElementById('kernmind-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'kernmind-toast';
  toast.innerHTML = `
    <div class="kernmind-toast-icon">🧠</div>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('kernmind-toast-hide');
    setTimeout(() => toast.remove(), 400);
  }, 2400);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'show_toast') {
    showToast(request.message || 'Saved to your Mind!');
  }
});
