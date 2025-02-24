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

// Perbarui daftar port setiap 2 detik
setInterval(updatePortList, 2000);

// function openPort(selectedPort) {
//   port = new SerialPort({
//     path: selectedPort,
//     baudRate: 19200,
//     autoOpen: false,
//   });

//   port.open((err) => {
//     if (err) {
//       console.error("Gagal membuka port:", err.message);
//       return;
//     }
//     // console.log("Port terbuka:", selectedPort);

//     // const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

//     console.log("Menjalankan parser.on('data')...");
//     // parser.on("data", (data) => {
//     //   console.log("RAW DATA DITERIMA:", data.toString());
//     //   win.webContents.send("serial-data", data.toString()); // Kirim ke frontend
//     // });
//   });

//   const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

//   parser.on("data", (data) => {
//     try {
//       console.log("Raw Data:", data);

//       const jsonMatches = data.match(/\{.*?\}/g);

//       // const jsonMatches = data.match(/\{[\s\S]*?\}/g);

//       if (!jsonMatches) {
//         console.warn("Tidak ada JSON yang ditemukan, data diabaikan:", data);
//         return;
//       }

//       jsonMatches.forEach((jsonStr) => {
//         try {
//           const jsonData = JSON.parse(jsonStr);
//           console.log("Parsed JSON:", jsonData);
//           win.webContents.send("serial-data", jsonData);
//         } catch (error) {
//           console.error("Gagal parse JSON:", error, "Data JSON:", jsonStr);
//         }
//       });
//     } catch (error) {
//       console.error("Kesalahan parsing batch data:", error);
//     }
//   });

//   console.log("Port terbuka:", selectedPort);
// }

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

    const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    // port.on("data", (data) => {
    //   try {
    //     let rawData = data.toString().trim(); // Konversi Buffer ke String
    //     console.log("Raw Data:", rawData);
    //     const jsonMatches = data.match(/\{.*?\}/g);

    //     if (!jsonMatches) {
    //       console.warn("Tidak ada JSON yang ditemukan, data diabaikan:", data);
    //       return;
    //     }

    //     jsonMatches.forEach((jsonStr) => {
    //       try {
    //         const jsonData = JSON.parse(jsonStr);
    //         console.log("Parsed JSON:", jsonData);
    //         win.webContents.send("serial-data", jsonData);
    //       } catch (error) {
    //         console.error("Gagal parse JSON:", error, "Data JSON:", jsonStr);
    //       }
    //     });
    //   } catch (error) {
    //     console.error("Kesalahan parsing batch data:", error);
    //   }
    // });

    // port.on("data", (data) => {
    //   let rawData = data.toString().trim(); // Konversi Buffer ke String

    //   // Cek apakah data mengandung JSON ({}), jika tidak, abaikan
    //   if (!rawData.includes("{") || !rawData.includes("}")) {
    //     console.warn("⚠️ Data bukan JSON, diabaikan:", rawData);
    //     return;
    //   }

    //   console.log("📡 Data JSON Ditemukan:", rawData);
    // });

    port.on("data", (data) => {
      let rawData = data.toString().trim();

      // Hapus karakter aneh (non-printable ASCII)
      rawData = rawData.replace(/[^\x20-\x7E]+/g, "");

      if (!rawData.includes("{") || !rawData.includes("}")) {
        console.warn("⚠️ Data bukan JSON, diabaikan:", rawData);
        return;
      }

      try {
        let jsonData = JSON.parse(rawData);
        console.log("✅ Parsed JSON setelah filtering:", jsonData);

        // **Tambahkan log sebelum mengirim ke frontend**
        console.log("📡 Mengirim JSON ke frontend:", JSON.stringify(jsonData));

        win.webContents.send("serial-data", jsonData);
      } catch (error) {
        console.error("❌ Gagal parse JSON:", error, "Data JSON:", rawData);
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
