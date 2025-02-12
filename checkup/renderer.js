const { ipcRenderer } = require("electron");

ipcRenderer.on("serial-data", (event, message) => {
  document.getElementById("output").innerText += message + "\n";
});
