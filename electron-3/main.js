const { app, BrowserWindow, ipcMain } = require("electron");
const { SerialPort, ReadlineParser } = require("serialport");

let win;
let port;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  SerialPort.list()
    .then((ports) => {
      const portNames = ports.map((p) => p.path);
      console.log("Port yang tersedia:", portNames);
      win.webContents.send("available-ports", portNames);
    })
    .catch((err) => console.error("Gagal mendapatkan daftar port:", err));
}

function openPort(selectedPort) {
  port = new SerialPort({
    path: selectedPort,
    baudRate: 115200,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", (data) => {
    console.log("Data STM32:", data.trim());
    win.webContents.send("serial-data", data.trim());
  });

  console.log("Port terbuka:", selectedPort);
}

ipcMain.on("select-port", (event, selectedPort) => {
  if (port) {
    port.close(() => {
      console.log("Port sebelumnya ditutup.");
      openPort(selectedPort);
    });
  } else {
    openPort(selectedPort);
  }
});

ipcMain.on("send-serial", (event, message) => {
  console.log("Mengirim ke STM32:", message);
  if (port && port.isOpen) {
    port.write(message + "\n", (err) => {
      if (err) {
        console.error("Error saat mengirim data:", err);
      }
    });
  } else {
    console.error("Port serial tidak terbuka!");
  }
});

app.whenReady().then(createWindow);
