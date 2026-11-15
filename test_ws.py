import asyncio, json, websockets

async def main():
    async with websockets.connect("wss://groovy-gumminess-truffle.ngrok-free.dev") as ws:
        await ws.send(json.dumps({"event": "connected"}))
        print("sent ok")
        await asyncio.sleep(1)

asyncio.run(main())
