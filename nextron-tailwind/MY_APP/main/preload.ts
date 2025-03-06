import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  // on(channel: string, callback: (...args: unknown[]) => void) {
  //   const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
  //     callback(...args)
  //   ipcRenderer.on(channel, subscription)

  //   return () => {
  //     ipcRenderer.removeListener(channel, subscription)
  //   }
  // },
  on: (channel, callback) =>
    ipcRenderer.on(channel, (event, ...args) => callback(event, ...args)),
};

const serialHandler = {
  listSerialPorts: () => ipcRenderer.invoke("serial-list"),
  openSerial: (path: string, baudRate: number) =>
    ipcRenderer.send("serial-open", { path, baudRate }),
  closeSerial: () => ipcRenderer.send("serial-close"),
  sendSerialData: (data: string) => ipcRenderer.send("serial-send", data),
  onSerialData: (callback: (data: string) => void) =>
    ipcRenderer.on("serial-data", (_, data) => callback(data)),
  onSerialStatus: (callback: (status: string) => void) =>
    ipcRenderer.on("serial-status", (_, status) => callback(status)),
  onSerialError: (callback: (error: string) => void) =>
    ipcRenderer.on("serial-error", (_, error) => callback(error)),
};

contextBridge.exposeInMainWorld("ipc", handler);
contextBridge.exposeInMainWorld("serial", serialHandler);

export type IpcHandler = typeof handler;
export type SerialHandler = typeof serialHandler;
