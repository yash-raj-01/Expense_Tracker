const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    title: 'Ledger — Expense Tracker',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const primaryUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  const fallbackUrl = 'http://localhost:5174';

  const tryLoad = (url) => {
    return win.loadURL(url);
  };

  const loadWithRetry = () => {
    tryLoad(primaryUrl).catch(() => {
      tryLoad(fallbackUrl).catch(() => {
        setTimeout(loadWithRetry, 400);
      });
    });
  };

  loadWithRetry();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

