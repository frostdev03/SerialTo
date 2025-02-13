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

document.getElementById("saveData").addEventListener("click", () => {
  ipcRenderer.send("send-serial", "SAVE_DATA");
  console.log("Mengirim perintah: SAVE_DATA");
});

// ipcRenderer.on("serial-data", (event, jsonData) => {
//   console.log("data diterima di frontend", jsonData);

//   if (jsonData && typeof jsonData === "object") {
//     const formattedText = `suhu: ${jsonData.suhu}, pH: ${jsonData.pH}, DO: ${jsonData.DO}`;

//     const newItem = document.createElement("li");
//     newItem.innerText = formattedText;
//     document.getElementById("data-list").appendChild(newItem);
//   }
// });

ipcRenderer.on("serial-data", (event, data) => {
  console.log("Data diterima:", data);
  try {
    const jsonData = JSON.parse(data);

    if (Array.isArray(jsonData)) {
      console.log("Data array diterima:", jsonData);

      const datalist = document.getElementById("data-list");
      datalist.innerHTML = "";

      jsonData.forEach((item) => {
        const newItem = document.createElement("li");
        newItem.innerText = `ID: ${item.id}, Suhu: ${item.temperature}°C, Kelembaban: ${item.humidity}%`;
        datalist.appendChild(newItem);
      });
    }
  } catch (error) {
    console.error("Parsing JSON gagal:", error, "Data:", data);
  }
});

ipcRenderer.send("save-data", data);
