const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

function createMainWindow() {
  const win = new BrowserWindow({
    title: 'Komunikasi Serial',
    width: 1000,
    height: 600,
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file',
    // slashes: true,
  });

  win.loadURL(startUrl);
}

app.whenReady().then(createMainWindow);
