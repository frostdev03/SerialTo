from flask import Flask, render_template
import serial
import threading
import asyncio
import websockets

app = Flask(__name__)

ser = serial.Serial("COM8", 9600)

clients = set()

async def serial_reader():
    while True:
        if ser.in_waiting:
            data = ser.readline().decode("utf-8").strip()
            await broadcast(data)
        await asyncio.sleep(0.1)

async def broadcast(data):
    for ws in clients:
        try:
            await ws.send(data)
        except:
            pass
async def websocket_handler(ws, path):
    await ws.send("Connected")
    
async def start_websocket():
    server = await websockets.serve(websocket_handler, "localhost", 5000)
    await server.wait_closed()
    
loop = asyncio.get_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(start_websocket())

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    threading.Thread(target=start_websocket, daemon=True).start()
    threading.Thread(target=lambda: asyncio.run(serial_reader()), daemon=True).start()
    app.run(debug=True, port=5000)
