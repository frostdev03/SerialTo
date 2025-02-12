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
      contextIsolation: false, // Pastikan ini false jika pakai ipcRenderer.send()
    },
  });

  win.loadFile("index.html");

  const port = new SerialPort({ path: "COM8", baudRate: 115200 });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", (data) => {
    console.log("Data STM32:", data.trim());
    win.webContents.send("serial-data", data.trim());
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
}

app.whenReady().then(createWindow);
