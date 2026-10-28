const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      
    },
  });


  win.loadURL("http://localhost:5173/");
  win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  createWindow();

});
