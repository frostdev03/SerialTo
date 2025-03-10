import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) =>
    ipcRenderer.on(channel, (event, ...args) => callback(event, ...args)),
});
