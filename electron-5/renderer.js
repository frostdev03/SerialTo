const { ipcRenderer } = require("electron");

const portSelect = document.getElementById("port-select");
const connectButton = document.getElementById("connect");

function debugLog(message) {
  console.log(message);
  const debug = document.getElementById("debug");
  if (debug) {
    const timestamp = new Date().toLocaleTimeString();
    debug.innerHTML += `<div>${timestamp} - ${message}</div>`;
    debug.scrollTop = debug.scrollHeight;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  debugLog("Application started");
});

ipcRenderer.on("available-ports", (event, ports) => {
  portSelect.innerHTML = "";
  ports.forEach((port) => {
    const option = document.createElement("option");
    option.value = port;
    option.innerText = port;
    portSelect.appendChild(option);
  });
});

document.getElementById("connect").addEventListener("click", () => {
  const selectedPort = portSelect.value;
  if (selectedPort) {
    ipcRenderer.send("select-port", selectedPort);
    console.log("Menghubungkan ke port:", selectedPort);
  }
});

document.getElementById("send").addEventListener("click", () => {
  const val = document.getElementById("val").value;
  if (val) {
    ipcRenderer.send("send-serial", val);
    console.log("Mengirim data ke STM32:", val);
  }
});

document.getElementById("clear").addEventListener("click", () => {
  ipcRenderer.send("send-serial", "clear");
  console.log("Mengirim perintah: clear");

  const tableBody = document.querySelector("#data-table tbody");
  if (tableBody) {
    tableBody.innerHTML = "";
    console.log("Tabel telah dikosongkan!");
  }
});

// document.getElementById("get-data").addEventListener("click", () => {
//   debugLog("Requesting data from STM32...");
//   ipcRenderer.send("send-serial", "data");
// });

document.getElementById("get-data").addEventListener("click", () => {
  ipcRenderer.send("send-serial", "data");
  debugLog("Requesting data from STM32...");
  console.log("Meminta data dari STM32...");

  setTimeout(() => {
    console.log("Memeriksa ulang tabel...");
    console.log(document.querySelector("#data-table tbody").innerHTML);
  }, 1000);
});

// listener menerima data serial
// ipcRenderer.on("serial-data", (event, data) => {
//   console.log("Data diterima:", data);

//   const tableBody = document.querySelector("#data-table tbody");
//   if (!tableBody) {
//     console.error("Tabel tidak ditemukan");
//     return;
//   }

//   try {
//     if (typeof data === "string" && data.trim().startsWith("[")) {
//       const jsonData = JSON.parse(data.trim());

//       console.log("Data setelah parse:", data);

//       if (!Array.isArray(data)) {
//         console.warn("Data bukan array:", data);
//         return;
//       }

//       datalist.innerHTML = "";

//       jsonData.forEach((item) => {
//         console.log("Menambahkan baris ke tabel:", item);

//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td>${item.id}</td>
//           <td>${item.temperature.toFixed(2)}</td>
//           <td>${item.humidity.toFixed(2)}</td>
//         `;
//         tableBody.appendChild(row);
//       });
//     } else {
//       console.warn("Format data tidak sesuai untuk ditampilkan di tabel.");
//     }
//   } catch (error) {
//     console.error("Error parsing data:", error);
//   }
// });

ipcRenderer.on("serial-data", (event, data) => {
  console.log("Data diterima (mentah):", data);

  const tableBody = document.querySelector("#data-table tbody");
  if (!tableBody) {
    console.error("Element data-table tbody tidak ditemukan!");
    return;
  }

  try {
    if (!Array.isArray(data)) {
      console.warn("Data bukan array:", data);
      return;
    }

    tableBody.innerHTML = "";

    data.forEach((item) => {
      console.log("Menambahkan ke tabel:", item);
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${item.id}</td>
          <td>${item.temperature.toFixed(2)}</td>
          <td>${item.humidity.toFixed(2)}</td>
        `;
      tableBody.appendChild(row);
    });

    console.log("Tabel berhasil diperbarui!");
  } catch (error) {
    console.error("Error parsing atau menampilkan data:", error);
  }
});
