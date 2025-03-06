import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SerialMonitor() {
  const [tableData, setTableData] = useState([]);
  const [imei, setImei] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    window.ipc.on("imei-response", (event, imeiData) => {
      setImei(imeiData);
    });

    window.ipc.send("send-serial", "imei");

    window.serial.onSerialData((d) => {
      setTableData((prev) => [...prev, d]);
    });
    window.serial.onSerialError((err) => {
      toast.error("Serial error: " + err);
    });
  }, []);

  const getData = () => {
    window.ipc.send("send-serial", "get");
    toast.info("Requesting data...");
  };

  const clearTable = () => {
    setTableData([]);
    toast.success("Table cleared");
  };

  const saveToExcel = () => {
    window.ipc.send("save-excel", tableData);
    toast.success("Data saved to Excel");
  };

  const sortTable = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...tableData].sort((a, b) => {
      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      } else {
        return direction === "asc"
          ? a[key].toString().localeCompare(b[key].toString())
          : b[key].toString().localeCompare(a[key].toString());
      }
    });

    setTableData(sortedData);
    setSortConfig({ key, direction });
  };
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-1/4 flex flex-col items-center justify-center border-r border-gray-300 p-6">
        <img src="/images/jala-logo.webp" width={250} height={250} />
        <p className="text-blue-500 text-lg mb-4">
          {" "}
          IMEI: {imei || "Loading..."}{" "}
        </p>

        <button
          onClick={getData}
          className="border-2 border-blue-500 text-center w-48 px-2 py-1 rounded text-blue-500 mb-2"
        >
          Get Data
        </button>
        <button
          onClick={clearTable}
          className="border-2 border-blue-500 text-center w-48 px-2 py-1 rounded text-blue-500 mb-2"
        >
          Clear
        </button>
        <button
          onClick={saveToExcel}
          className="border-2 border-blue-500 text-center w-48 px-2 py-1 rounded text-blue-500 mb-2"
        >
          Download Data
        </button>

        {/*Toggle View */}
        <button
          onClick={() => setViewMode(viewMode === "table" ? "chart" : "table")}
          className="bg-blue-500 text-white w-48 px-2 py-1 rounded mt-4"
        >
          {viewMode === "table" ? "Show Charts" : "Show Table"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-x-auto rounded-lg">
        {viewMode === "table" ? (
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-blue-500 text-white">
                {[
                  "Datetime",
                  "ID",
                  "Temperature",
                  "pH",
                  "EC",
                  "TDS",
                  "Salinity",
                  "DO",
                  "DO Percent",
                ].map((key) => (
                  <th
                    key={key}
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => sortTable(key)}
                  >
                    {key.toUpperCase()}
                    {sortConfig.key === key &&
                      (sortConfig.direction === "asc" ? (
                        <FaSortUp className="inline ml-2" />
                      ) : (
                        <FaSortDown className="inline ml-2" />
                      ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr
                  key={index}
                  className={`border border-gray-300 text-blue-500 text-lg ${"bg-white"}`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-black">
                    {data.measured_at}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.rfid_id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.temperature === "number"
                      ? data.temperature.toFixed(2)
                      : data.temperature}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.ph === "number" ? data.ph.toFixed(2) : data.ph}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.ec === "number" ? data.ec.toFixed(2) : data.ec}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.tds === "number"
                      ? data.tds.toFixed(1)
                      : data.tds}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.salinity === "number"
                      ? data.salinity.toFixed(2)
                      : data.salinity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.do === "number" ? data.do.toFixed(2) : data.do}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {typeof data.do_percent === "number"
                      ? data.do_percent.toFixed(2)
                      : data.do_percent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {["temperature", "ph", "ec", "tds", "salinity", "do"].map((key) => (
              <div key={key} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">
                  {key.toUpperCase()}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tableData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="measured_at" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke="#9aaafd"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
