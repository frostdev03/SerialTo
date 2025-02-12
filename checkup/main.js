const { app, BrowserWindow } = require("electron");
const { SerialPort } = require("serialport");

let win;
let port;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");

  // Ganti '/dev/ttyUSB0' atau 'COM3' dengan port STM32-mu
  port = new SerialPort({ path: "COM8", baudRate: 115200 });

  port.on("open", () => console.log("Serial Port Opened"));

  port.on("data", (data) => {
    console.log("Received:", data.toString());
    win.webContents.send("serial-data", data.toString());
  });

  port.on("error", (err) => console.log("Error:", err.message));
});
