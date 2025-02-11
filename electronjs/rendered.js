const { SerialPort } = require('serialport');
const tableify = require('tableify');

async function portList() {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      document.getElementById('error').textContent = err.message;
      return;
    } else {
      document.getElementById('error').textContent = '';
    }
    console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent =
        'Tidak ada port yang terdeteksi';
    }

    tableHTML = tableify(ports);
    document.getElementById('ports').innerHTML = tableHTML;
  });
}

function portSerial() {
  portList();
  setTimeout(portSerial, 1000);
}

setTimeout(portSerial, 1000);
portList();
