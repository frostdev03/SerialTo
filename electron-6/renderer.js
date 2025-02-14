const { ipcRenderer } = require("electron");

const portSelect = document.getElementById("port-select");
const connectButton = document.getElementById("connect");

const XLSX = require("xlsx");

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

document.getElementById("get-data").addEventListener("click", () => {
  ipcRenderer.send("send-serial", "data");
  debugLog("Requesting data from STM32...");
  console.log("Meminta data dari STM32...");

  setTimeout(() => {
    console.log("Memeriksa ulang tabel...");
    console.log(document.querySelector("#data-table tbody").innerHTML);
  }, 1000);
});

document.getElementById("download").addEventListener("click", () => {
  console.log("Meminta folder penyimpanan...");

  ipcRenderer.send("save-excel");
});

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

ipcRenderer.on("save-excel-path", (event, filePath) => {
  if (!filePath) {
    console.log("User membatalkan penyimpanan.");
    return;
  }

  console.log("Menyimpan file di:", filePath);

  const table = document.getElementById("data-table");
  if (!table) {
    console.error("Tabel tidak ditemukan!");
    return;
  }

  const worksheet = XLSX.utils.table_to_sheet(table);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Sensor");

  XLSX.writeFile(workbook, filePath);

  console.log("File Excel berhasil disimpan!");
});
