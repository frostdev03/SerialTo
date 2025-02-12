const { ipcRenderer } = require('electron');
const { SerialPort } = require('serialport');
const tableify = require('tableify');

document.getElementById('send').addEventListener('click', () => {
  const val = document.getElementById('val').value;
  if (val) {
    ipcRenderer.send('send-serial', val);
    console.log('Mengirim data ke STM32:', val);
  }
});

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

ipcRenderer.on('serial-data', (event, data) => {
  console.log('Data diterima:', data);

  const datalist = document.getElementById('data-list');

  const newItem = document.createElement('li');

  newItem.innerText = data;
  datalist.appendChild(newItem);

  const container = document.getElementById('data-container');
  container.scrollTop = container.scrollHeight;
});
