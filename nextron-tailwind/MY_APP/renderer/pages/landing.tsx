import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SerialConnect() {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const router = useRouter();

  useEffect(() => {
    window.ipc.on("available-ports", (event, ports) => {
      setPorts(ports);
    });
    window.ipc.send("refresh-port", null);
  }, []);

  const handleConnect = () => {
    if (!selectedPort) {
      toast.error("No device selected!");
      console.error("selectedPort is undefined!");
      return;
    }

    console.log("Mengirim connect-device untuk port:", selectedPort);
    window.ipc.send("select-port", selectedPort);
    router.push("/home");
    toast.info("Connecting to " + selectedPort + "...");
  };

  const handleRefresh = () => {
    window.ipc.send("refresh-port", null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <img src="/images/jala-logo.webp" width={250} height={250} />
      <div className="flex items-center space-x-2">
        <select
          className="border-2 border-blue-500 text-center w-32 px-2 py-1 rounded text-blue-500"
          onChange={(e) => setSelectedPort(e.target.value)}
        >
          <option value="">Select Port</option>
          {ports?.map((port) => (
            <option key={port} value={port}>
              {port}
            </option>
          ))}
        </select>
        <button
          onClick={handleRefresh}
          className="border border-blue-500 px-3 py-1 rounded flex items-center justify-center"
        >
          <RefreshCcw className="w-6 h-6 text-blue-500" />
        </button>
        <button
          onClick={handleConnect}
          className="bg-blue-500 text-white px-6 py-1 rounded"
        >
          CONNECT
        </button>
      </div>
    </div>
  );
}
