const { ipcRenderer } = require("electron");

const portSelect = document.getElementById("port-select");
const connectButton = document.getElementById("connect");

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

ipcRenderer.on("serial-data", (event, data) => {
  console.log("Data diterima:", data);

  const datalist = document.getElementById("data-list");

  const newItem = document.createElement("li");

  newItem.innerText = data;
  datalist.appendChild(newItem);

  const container = document.getElementById("data-container");
  container.scrollTop = container.scrollHeight;
});
