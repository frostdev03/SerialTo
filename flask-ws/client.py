import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:5000"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello, server!")
        response = await websocket.recv()
        print(f"Response: {response}")

asyncio.run(test_websocket())
