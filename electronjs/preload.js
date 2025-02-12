// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  for (const versionType of ['chrome', 'electron', 'node']) {
    document.getElementById(`${versionType}-version`).innerText =
      process.versions[versionType];
  }
  document.getElementById('serialport-version').innerText =
    require('serialport/package').version;
});

contextBridge.exposeInMainWorld('electron', {
  receiveSerialPorts: (callback) =>
    ipcRenderer.on('serial-ports', (event, data) => callback(data)),
  receiveSerialData: (callback) =>
    ipcRenderer.on('receive-serial-data', (event, data) => callback(data)),
  sendSerialData: (data) => ipcRenderer.send('send-serial-data', data),
  // on: (channel, callback) =>
  //   ipcRenderer.on(channel, (event, ...args) => callback(...args)),
});
