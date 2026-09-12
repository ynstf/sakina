import asyncio
import websockets

async def test_chat():
    # Hott token dyalk hna
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg5MjQ2NTAzLCJpYXQiOjE3ODkyNDYyMDMsImp0aSI6IjlkOWY4N2YwZGI3ZDQwY2E5Y2QzMzhlYmIwYmEwNTg3IiwidXNlcl9pZCI6IjIifQ.ybbXxHqDyBLmmgKExOz6_XRaWFoWj2PoGAhYJFnArVA"
    uri = f"ws://127.0.0.1:8001/ws/chat/general?token={token}"
    
    async with websockets.connect(uri) as websocket:
        print("✅ Connected to Chat WebSocket successfully!")
        
        # Sift message test
        await websocket.send("Salam mn Python script!")
        
        # Bqa tsna w qra les messages li kay-wslo
        while True:
            response = await websocket.recv()
            print("📩 Received:", response)

if __name__ == "__main__":
    asyncio.run(test_chat())