import asyncio
import websockets

async def test_chat():
    # L-token dyalek
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg5MzM0MjY1LCJpYXQiOjE3ODkzMzM5NjUsImp0aSI6IjJkN2U1YzZlMTU2ODQ4YWM5ZjllZmYyMmIxZDQ0ODE2IiwidXNlcl9pZCI6IjIifQ.myHt7ZJ7KY5H2gR0TF3j2B6DLl8qiInu75NE073uXYw"
    uri = f"ws://127.0.0.1:8001/ws/chat/client/2/therapist/5?token={token}"

    print(f"Connecting to {uri} ...")
    
    try:
        # Kan-tconnectaw l WebSocket
        async with websockets.connect(uri) as websocket:
            print("✅ Connected securely!")
            
            # Kan-siftou message
            message_to_send = "Salam Dr., ana bghit n-bda l-consultation."
            print(f"📤 Sending: {message_to_send}")
            await websocket.send(message_to_send)
            
            # Kan-tsennaw r-rad
            response = await websocket.recv()
            print(f"📩 Received in real-time: {response}")
            
    except ConnectionRefusedError:
        print("❌ Erreur: Connection Refused. T2aked blli FastAPI khddam f port 8001!")
    except Exception as e:
        print(f"❌ Erreur: {e}")

# Run l-fonction asynchrone
if __name__ == "__main__":
    asyncio.run(test_chat())