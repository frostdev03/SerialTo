const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');

let port;
let win;

function createMainWindow() {
  win = new BrowserWindow({
    title: 'Komunikasi Serial',
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Memindahkan deklarasi `startUrl` ke atas sebelum dipakai
  const startUrl = url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file',
    slashes: true,
  });

  win.loadURL(startUrl);

  SerialPort.list()
    .then((ports) => {
      console.log('Port terdeteksi', ports);
      win.webContents.send('serial-ports', ports);

      if (ports.length > 0) {
        console.log('Mencoba membuka port', ports[0].path);
        port = new SerialPort({
          path: ports[0].path,
          baudRate: 9600,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          flowControl: false,
        });

        port.on('open', () => {
          console.log('Port terbuka');
        });

        port.on('error', (err) => {
          console.error('Gagal membuka port', err);
        });

        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        parser.on('data', (data) => {
          console.log('Data diterima:', data.trim());
          win.webContents.send('receive-serial-data', data.trim());
        });
      }
    })
    .catch((err) => {
      console.error('Gagal mendapatkan daftar port:', err);
    });

  ipcMain.on('send-serial-data', (event, data) => {
    console.log('Nyoba kirim data:', data);
    if (port && port.isOpen) {
      port.write(data + '\n', (err) => {
        if (err) {
          console.error('Error mengirim data:', err);
        } else {
          console.log('Data terkirim');
        }
      });
    } else {
      console.error('Port tidak terbuka');
    }
  });
}

app.whenReady().then(createMainWindow);
