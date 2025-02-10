const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

const port = new SerialPort("COM8", {
  baudRate: 9600,
});

const parser = port.pipe(new Readline({ delimiter: "\r\n" }));

port.on("open", () => {
  console.log("Serial Port Opened");
});

parser.on("data", (data) => {
  console.log("Data received:", data);
});

port.on("error", (err) => {
  console.error("Error: ", err.message);
});
