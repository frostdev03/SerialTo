const { ipcRenderer } = require("electron");

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
