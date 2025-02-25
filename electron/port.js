const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const portName = "COM8";

const port = new SerialPort({
  path: portName,
  baudRate: 19200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log(`Serial port ${portName} terbuka`);
});

parser.on("data", (data) => {
  console.log(data);
});

port.on("error", (err) => {
  console.error(`Kesalahan: ${err.message}`);
});
