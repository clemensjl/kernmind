const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, clipboard } = require('electron');
const path = require('path');

let mainWindow = null;
let captureWindow = null;
let tray = null;
const SERVER_URL = process.env.KERNMIND_URL || 'http://localhost:3000';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'KernMind — AI Second Brain',
    backgroundColor: '#FDFBF7',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(SERVER_URL);

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createCaptureWindow() {
  captureWindow = new BrowserWindow({
    width: 520,
    height: 280,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  captureWindow.loadFile(path.join(__dirname, 'capture.html'));

  captureWindow.on('blur', () => {
    captureWindow.hide();
  });
}

function createTray() {
  // Use extension icon for tray
  const iconPath = path.join(__dirname, '../extension/icons/icon16.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Mind Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      },
    },
    {
      label: 'Quick Capture (Ctrl+Shift+M)',
      click: () => toggleCaptureWindow(),
    },
    {
      label: 'Capture Clipboard',
      click: () => captureClipboardContent(),
    },
    { type: 'separator' },
    {
      label: 'Quit KernMind',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('KernMind — AI Second Brain');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function toggleCaptureWindow() {
  if (!captureWindow) createCaptureWindow();

  if (captureWindow.isVisible()) {
    captureWindow.hide();
  } else {
    captureWindow.center();
    captureWindow.show();
    captureWindow.focus();
  }
}

async function captureClipboardContent() {
  const text = clipboard.readText();
  if (!text) return;

  try {
    const isUrl = text.startsWith('http://') || text.startsWith('https://');
    const isColor = text.startsWith('#') && (text.length === 4 || text.length === 7);

    const payload = isUrl
      ? { url: text }
      : isColor
      ? { type: 'color', text, colors: [text] }
      : { type: 'note', text };

    await fetch(`${SERVER_URL}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.reload();
    }
  } catch (err) {
    console.error('Clipboard capture error:', err);
  }
}

app.whenReady().then(() => {
  createMainWindow();
  createCaptureWindow();
  createTray();

  // Register Global Hotkey anywhere in Windows
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    toggleCaptureWindow();
  });

  globalShortcut.register('CommandOrControl+Alt+O', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in system tray
  }
});
