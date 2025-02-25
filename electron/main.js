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
  updatePortList();
}

function updatePortList() {
  SerialPort.list()
    .then((ports) => {
      const portNames = ports.map((p) => p.path);
      // console.log("Port yang tersedia:", portNames);
      win.webContents.send("available-ports", portNames);
    })
    .catch((err) => console.error("Gagal mendapatkan daftar port:", err));
}

setInterval(updatePortList, 2000);

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

    // const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    port.on("data", (data) => {
      let rawData = data.toString().trim();

      // filter
      rawData = rawData.replace(/[^\x20-\x7E]+/g, "");

      if (!rawData.includes("{") || !rawData.includes("}")) {
        console.warn("Data bukan JSON, diabaikan:", rawData);
        return;
      }

      try {
        let jsonData = JSON.parse(rawData);

        // let date = new Date(jsonData.measured_at);
        // let formattedDate = new Intl.DateTimeFormat("id-ID", {
        //   weekday: "long",
        //   year: "numeric",
        //   month: "long",
        //   day: "2-digit",
        //   hour: "2-digit",
        //   minute: "2-digit",
        //   second: "2-digit",
        //   timeZoneName: "short",
        // }).format(date);

        // jsonData.measured_at = formattedDate;

        console.log("Parsed JSON setelah filtering:", jsonData);

        console.log("Mengirim JSON ke frontend:", JSON.stringify(jsonData));

        win.webContents.send("serial-data", jsonData);
      } catch (error) {
        console.error("Gagal parse JSON:", error, "Data JSON:", rawData);
      }
    });
  });
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
