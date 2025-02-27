import path from "path";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { SerialPort } from "serialport";
import * as XLSX from "xlsx";
import fs from "fs";

const isProd = process.env.NODE_ENV === "production";
let mainWindow;
let port;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

async function createMainWindow() {
  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app:/renderer/pages/home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  app.quit();
});

//get port
async function updatePortList() {
  try {
    const ports = await SerialPort.list();
    const portNames = ports.map((p) => p.path);
    mainWindow.webContents.send("available-ports", portNames);
  } catch (err) {
    console.error("Gagal mendapatkan daftar port:", err);
  }
}

setInterval(updatePortList, 2000);

//selected port
function openPort(selectedPort) {
  port = new SerialPort({
    path: selectedPort,
    baudRate: 19200,
    autoOpen: false,
  });

  port.open((err) => {
    if (err) {
      console.error("Gagal membuka port:", err.message);
      return;
    }
    console.log("Port terbuka:", selectedPort);

    port.on("data", (data) => {
      let rawData = data.toString().trim();
      rawData = rawData.replace(
        /[^       rawData = rawData.replace(/[^\x20-\x7E]+/g,
        ""
      );

      if (!rawData.includes("{") || !rawData.includes("}")) {
        console.warn("Data bukan JSON, diabaikan:", rawData);
        return;
      }

      try {
        let jsonData = JSON.parse(rawData); //data dari baaruni
        console.log("Mengirim JSON ke frontend:", JSON.stringify(jsonData));
        mainWindow.webContents.send("serial-data", jsonData);
      } catch (error) {
        console.error("Gagal parse JSON:", error, "Data JSON:", rawData);
      }
    });
  });
}

//ganti port
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

//kirim data serial
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

//konversi ke excel
ipcMain.on("save-excel", async (event, tableData) => {
  const result = await dialog.showSaveDialog({
    title: "Simpan Data Sensor",
    defaultPath: path.join(app.getPath("desktop"), "Data_Sensor.xlsx"),
    filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
  });

  if (result.canceled || !result.filePath) {
    event.sender.send("save-excel-error", "Penyimpanan dibatalkan.");
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sensor");

    XLSX.writeFile(workbook, result.filePath);
    console.log("File Excel berhasil disimpan:", result.filePath);

    event.sender.send("save-excel-success", result.filePath);
  } catch (error) {
    console.error("Gagal menyimpan file Excel:", error);
    event.sender.send("save-excel-error", error.message);
  }
});
