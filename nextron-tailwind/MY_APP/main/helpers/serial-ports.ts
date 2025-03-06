import { ipcMain } from "electron";
import { SerialPort } from "serialport";

let port: SerialPort | null = null;

ipcMain.on("serial-open", (event, { path, baudRate }) => {
  if (port) port.close(); // Close existing connection

  port = new SerialPort({ path, baudRate: Number(baudRate) });

  port.on("open", () => {
    event.reply("serial-status", "opened");
  });

  port.on("data", (data: Buffer) => {
    event.reply("serial-data", data.toString());
  });

  port.on("error", (err) => {
    event.reply("serial-error", err.message);
  });

  port.on("close", () => {
    event.reply("serial-status", "closed");
  });
});

ipcMain.on("serial-send", (_, data: string) => {
  if (port && port.isOpen) {
    port.write(data, (err) => {
      if (err) console.error("Error writing to serial port:", err.message);
    });
  }
});

ipcMain.on("serial-close", (event) => {
  if (port) {
    port.close();
    port = null;
    event.reply("serial-status", "closed");
  }
});

ipcMain.handle("serial-list", async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map((port) => ({
      path: port.path,
      manufacturer: port.manufacturer || "Unknown",
    }));
  } catch (error) {
    console.error("Error listing ports:", error);
    return [];
  }
});
