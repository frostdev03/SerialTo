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

document.getElementById("get-data").addEventListener("click", () => {
  debugLog("Requesting data from STM32...");
  ipcRenderer.send("send-serial", "data");
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
});

document.getElementById("get-data").addEventListener("click", () => {
  ipcRenderer.send("send-serial", "data");
  console.log("Meminta data dari STM32...");
});

// Tambahkan listener untuk menerima data serial
ipcRenderer.on("serial-data", (event, data) => {
  console.log("Data diterima:", data);

  const datalist = document.getElementById("data-list");
  if (!datalist) {
    console.error("Element data-list tidak ditemukan!");
    return;
  }

  try {
    if (typeof data === "string" && data.trim().startsWith("[")) {
      const jsonData = JSON.parse(data.trim());

      datalist.innerHTML = "";

      jsonData.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `ID: ${
          item.id
        }, Temperature: ${item.temperature.toFixed(
          2
        )}°C, Humidity: ${item.humidity.toFixed(2)}%`;
        li.style.padding = "5px";
        li.style.borderBottom = "1px solid #eee";
        datalist.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent =
        typeof data === "object" ? JSON.stringify(data, null, 2) : data;
      li.style.padding = "5px";
      li.style.color = "blue";
      datalist.appendChild(li);
    }
  } catch (error) {
    console.error("Error parsing data:", error);
    const li = document.createElement("li");
    li.textContent = `Error: ${error.message}`;
    li.style.color = "red";
    datalist.appendChild(li);
  }
});
