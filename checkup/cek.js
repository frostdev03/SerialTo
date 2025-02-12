const { SerialPort } = require("serialport");

SerialPort.list().then((ports) => {
  console.log("Available Serial Ports:");
  ports.forEach((port) => console.log(port.path));
});
