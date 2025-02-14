const { dialog, app, BrowserWindow, ipcMain } = require("electron");
const { SerialPort, ReadlineParser } = require("serialport");
const path = require("path");

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
    try {
      console.log("Data mentah dari serial:", data);

      const jsonStart = data.indexOf("[");
      if (jsonStart === -1) {
        console.error("JSON tidak ditemukan dalam data:", data);
        return;
      }

      data = data.substring(jsonStart).trim();

      const jsonData = JSON.parse(data);
      console.log("Data setelah parse di main.js:", jsonData);

      if (Array.isArray(jsonData)) {
        win.webContents.send("serial-data", jsonData);
      } else {
        console.error("Format JSON tidak valid:", jsonData);
      }
    } catch (error) {
      console.error("Gagal parse data:", error);
    }
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

ipcMain.on("save-excel", async (event) => {
  const result = await dialog.showSaveDialog({
    title: "Simpan Data Sensor",
    defaultPath: path.join(app.getPath("desktop"), "Data_Sensor.xlsx"),
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
  });

  if (!result.canceled && result.filePath) {
    event.sender.send("save-excel-path", result.filePath);
  } else {
    event.sender.send("save-excel-path", null);
  }
});

app.whenReady().then(createWindow);
