import { IpcHandler, SerialHandler } from "../main/preload";

declare global {
  interface Window {
    ipc: IpcHandler;
    serial: SerialHandler;
  }
}
