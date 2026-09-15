from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import grpc
import os
import json
import asyncio
import redis.asyncio as aioredis
from celery_client import celery_app

from grpc_setup import users_pb2, users_pb2_grpc
from models import SessionLocal, ChatMessage


    
app = FastAPI(title="Sakina Private Chat Service")
security = HTTPBearer()

GRPC_HOST = os.getenv("GRPC_HOST", "localhost:50051")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)

def verify_token_with_django(token: str):
    # Ensure correct fallback inside Docker network
    grpc_target = os.getenv("GRPC_HOST", "sakina_grpc:50051")
    
    # Strip 'Bearer ' prefix if present
    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]

    with grpc.insecure_channel(grpc_target) as channel:
        stub = users_pb2_grpc.UserAuthStub(channel)
        try:
            response = stub.VerifyToken(users_pb2.TokenRequest(token=token))
            if not response.is_valid:
                print("FastAPI: Django gRPC returned is_valid=False", flush=True)
                return None
            return {
                "id": str(response.id), 
                "username": response.username, 
                "email": response.email
            }
        except grpc.RpcError as e:
            print(f"FastAPI gRPC Connection Error: {e.code()} - {e.details()}", flush=True)
            return None


# def verify_token_with_django(token: str):
#     with grpc.insecure_channel(GRPC_HOST) as channel:
#         stub = users_pb2_grpc.UserAuthStub(channel)
#         try:
#             response = stub.VerifyToken(users_pb2.TokenRequest(token=token))
#             if not response.is_valid:
#                 return None
#             return {"id": str(response.id), "username": response.username, "email": response.email}
#         except grpc.RpcError:
#             return None



def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = verify_token_with_django(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

@app.get("/verify-me")
def verify_me(user: dict = Depends(get_current_user)):
    return {"message": "gRPC connection secure", "user": user}

# ==========================================
# SECURE 1-ON-1 WEBSOCKET ENDPOINT
# ==========================================
@app.websocket("/ws/chat/client/{client_id}/therapist/{therapist_id}")
async def private_chat_endpoint(
    websocket: WebSocket, 
    client_id: str, 
    therapist_id: str, 
    token: str = Query(...)
):
    # 1. Authenticate user via gRPC
    user = verify_token_with_django(token)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized: Invalid Token")
        return
        
    # 2. Strict Access Control: Only the specific client or therapist can join
    if user["id"] not in [client_id, therapist_id]:
        await websocket.close(code=1008, reason="Unauthorized: You do not have access to this private room")
        return
        
    await websocket.accept()
    
    # 3. Unique Private Channel Name
    channel_name = f"private_chat_c{client_id}_t{therapist_id}"
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel_name)
    
    async def listen_to_redis():
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    await websocket.send_text(message["data"])
        except asyncio.CancelledError:
            pass
            
    receiver_task = asyncio.create_task(listen_to_redis())
    
    try:
        join_msg = json.dumps({"system": True, "message": f"{user['username']} joined the secure session."})
        await redis_client.publish(channel_name, join_msg)
        
        while True:
            data = await websocket.receive_text()
            
            # 1. Real-time: Broadcast to Redis
            msg_payload = json.dumps({
                "sender_id": user["id"],
                "username": user["username"], 
                "text": data
            })
            await redis_client.publish(channel_name, msg_payload)
            
            # 2. Background: Send payload to RabbitMQ for Celery Worker to save in PostgreSQL
            # Kan-sta3mlou send_task 7it l-worker y-qdr y-koun m-defini f Django (machi f FastAPI)
            celery_app.send_task(
                "save_chat_message", # Smiyat l-function li ghadi n-gaddouha f Django mn ba3d
                kwargs={
                    "client_id": client_id,
                    "therapist_id": therapist_id,
                    "sender_id": user["id"],
                    "message_text": data
                }
            )
            
    except WebSocketDisconnect:
        receiver_task.cancel()
        await pubsub.unsubscribe(channel_name)
        leave_msg = json.dumps({"system": True, "message": f"{user['username']} left the session."})
        await redis_client.publish(channel_name, leave_msg)


# Dependency dyal Database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/chat/history/client/{client_id}/therapist/{therapist_id}")
def get_chat_history(
    client_id: str, 
    therapist_id: str, 
    user: dict = Depends(get_current_user), # Vérification gRPC automatiquement
    db = Depends(get_db)
):
    # Sécurité: Wesh had l-user 3ndu l-7eq y-shouf had l-conversation?
    if user["id"] not in [client_id, therapist_id]:
        raise HTTPException(status_code=403, detail="Unauthorized to view this conversation")
        
    # Jbed l-messages mn Database
    messages = db.query(ChatMessage).filter(
        ChatMessage.client_id == client_id,
        ChatMessage.therapist_id == therapist_id
    ).order_by(ChatMessage.timestamp.asc()).all()
    
    return {
        "conversation": f"client_{client_id}_therapist_{therapist_id}",
        "messages": messages
    }