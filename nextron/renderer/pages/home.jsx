import React, { useEffect, useState } from "react";

export default function SerialMonitor() {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [debugMessages, setDebugMessages] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    window.ipc.on("available-ports", (event, ports) => {
      setPorts(ports);
    });

    window.ipc.on("serial-data", (event, data) => {
      setTableData((prevData) => [...prevData, data]);
    });

    window.ipc.on("save-excel-path", (event, filePath) => {
      if (!filePath) return;
      window.ipc.send("export-excel", filePath);
    });
  }, []);

  const sendSerial = () => {
    if (inputValue) {
      window.ipc.send("send-serial", inputValue);
      setDebugMessages((prev) => [...prev, `Sent: ${inputValue}`]);
    }
  };

  const connectPort = () => {
    if (selectedPort) {
      window.ipc.send("select-port", selectedPort);
      setDebugMessages((prev) => [...prev, `Connected to: ${selectedPort}`]);
    }
  };

  const requestData = () => {
    window.ipc.send("send-serial", "get");
    setDebugMessages((prev) => [...prev, "Requesting data from STM32..."]);
  };

  const clearTable = () => {
    setTableData([]);
    setDebugMessages((prev) => [...prev, "Table cleared."]);
  };

  const saveToExcel = () => {
    window.ipc.send("save-excel", tableData);
  };

  useEffect(() => {
    window.ipc.on("save-excel-success", (event, filePath) => {
      alert(`File Excel berhasil disimpan di: ${filePath}`);
    });

    window.ipc.on("save-excel-error", (event, error) => {
      alert(`Gagal menyimpan file Excel: ${error}`);
    });
  }, []);

  return (
    <div style={{ padding: "25px", fontFamily: "Arial, sans-serif" }}>
      <h1>Komunikasi Data</h1>

      <div className="controls">
        <label>Message: </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={sendSerial}>Send</button>

        <label>Port: </label>
        <select onChange={(e) => setSelectedPort(e.target.value)}>
          <option value="">Select Port</option>
          {ports?.map((port) => (
            <option key={port} value={port}>
              {port}
            </option>
          ))}
        </select>
        <button onClick={connectPort}>Connect</button>
        <button onClick={requestData}>Get Data</button>
        <button onClick={clearTable}>Clear</button>
        <button onClick={saveToExcel}>Download</button>
      </div>

      <table className="table-fixed w-full text-left">
        <thead
          className="bg-[#0080eb] text-[#ffffff]"
          style={{ backgroundColor: "#0080eb", color: "#ffffff" }}
        >
          <tr>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              Datetime
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              ID
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              Temperature
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              pH
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              EC
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              TDS
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              Salinity
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              DO
            </th>
            <th className="py-0 border border-gray-200 text-center font-bold p-4">
              DO Percent
            </th>
          </tr>
        </thead>
        <tbody
          className="bg-white text-gray-500 bg-[#FFFFFF] text-[#002147]"
          style={{ backgroundColor: "#FFFFFF", color: "#002147" }}
        >
          {tableData.map((data, index) => (
            <tr key={index} className="odd:bg-white even:bg-gray-100">
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.measured_at}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.rfid_id}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.temperature.toFixed(2)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.ph.toFixed(2)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.ec.toFixed(2)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.tds.toFixed(1)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.salinity.toFixed(2)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.do.toFixed(2)}
              </td>
              <td className="py-0 border border-gray-200 text-center font-bold p-4">
                {data.do_percent.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#f0f0f0",
          padding: "10px",
          height: "150px",
          overflowY: "auto",
        }}
      >
        <h3>Debug Messages:</h3>
        {debugMessages.map((msg, index) => (
          <div key={index}>
            {new Date().toLocaleTimeString()} - {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
