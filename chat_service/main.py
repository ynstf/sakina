from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import grpc
import os
import json
import asyncio
import redis.asyncio as aioredis

from grpc_setup import users_pb2, users_pb2_grpc

app = FastAPI(title="Sakina Chat Microservice")
security = HTTPBearer()

# Environment Variables
GRPC_HOST = os.getenv("GRPC_HOST", "localhost:50051")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Connect to Redis
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)

# Helper function to verify token via gRPC
def verify_token_with_django(token: str):
    with grpc.insecure_channel(GRPC_HOST) as channel:
        stub = users_pb2_grpc.UserAuthStub(channel)
        try:
            response = stub.VerifyToken(users_pb2.TokenRequest(token=token))
            if not response.is_valid:
                return None
            return {"id": response.id, "username": response.username, "email": response.email}
        except grpc.RpcError:
            return None

# Normal HTTP Auth Dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = verify_token_with_django(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

@app.get("/verify-me")
def verify_me(user: dict = Depends(get_current_user)):
    return {"message": "gRPC communication successful!", "django_user": user}

# ==========================================
# WEBSOCKET CHAT ENDPOINT
# ==========================================
@app.websocket("/ws/chat/{room_name}")
async def chat_endpoint(websocket: WebSocket, room_name: str, token: str = Query(...)):
    # 1. Authenticate WebSocket connection using the token in the URL
    user = verify_token_with_django(token)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return
        
    await websocket.accept()
    channel_name = f"chat_room_{room_name}"
    
    # 2. Subscribe to Redis Channel
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel_name)
    
    # 3. Background Task: Listen to Redis and send to WebSocket
    async def listen_to_redis():
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    await websocket.send_text(message["data"])
        except asyncio.CancelledError:
            pass
            
    receiver_task = asyncio.create_task(listen_to_redis())
    
    # 4. Main Loop: Receive from WebSocket and publish to Redis
    try:
        # Announce user joined
        join_msg = json.dumps({"system": True, "message": f"{user['username']} joined the room."})
        await redis_client.publish(channel_name, join_msg)
        
        while True:
            data = await websocket.receive_text()
            # Broadcast message to everyone in the Redis channel
            msg_payload = json.dumps({"user": user['username'], "text": data})
            await redis_client.publish(channel_name, msg_payload)
            
    except WebSocketDisconnect:
        # Cleanup when user disconnects
        receiver_task.cancel()
        await pubsub.unsubscribe(channel_name)
        leave_msg = json.dumps({"system": True, "message": f"{user['username']} left the room."})
        await redis_client.publish(channel_name, leave_msg)