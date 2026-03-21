"""routers/signaling.py — WebRTC WebSocket Signaling Server"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import uuid
import asyncio

# Room management
class RoomManager:
    def __init__(self):
        # room_id -> list of websockets
        self.rooms: Dict[str, Set[WebSocket]] = {}
        # websocket -> room_id
        self.connections: Dict[WebSocket, str] = {}
        # room_id -> {host: ws, guest: ws or None}
        self.room_roles: Dict[str, Dict] = {}
    
    async def create_room(self, ws: WebSocket) -> str:
        room_id = str(uuid.uuid4())[:8]
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
            self.room_roles[room_id] = {"host": ws, "guest": None}
        self.rooms[room_id].add(ws)
        self.connections[ws] = room_id
        await ws.send_json({"type": "room-created", "roomId": room_id})
        return room_id
    
    async def join_room(self, ws: WebSocket, room_id: str) -> bool:
        if room_id not in self.rooms:
            await ws.send_json({"type": "error", "message": "Room not found"})
            return False
        
        if len(self.rooms[room_id]) >= 2:
            await ws.send_json({"type": "error", "message": "Room is full"})
            return False
        
        self.rooms[room_id].add(ws)
        self.connections[ws] = room_id
        self.room_roles[room_id]["guest"] = ws
        
        # Notify host that guest joined
        host = self.room_roles[room_id]["host"]
        if host and host != ws:
            await host.send_json({"type": "peer-joined"})
        
        await ws.send_json({"type": "joined", "roomId": room_id})
        return True
    
    async def leave_room(self, ws: WebSocket):
        room_id = self.connections.get(ws)
        if not room_id:
            return
        
        if room_id in self.rooms:
            self.rooms[room_id].discard(ws)
            
            # Notify other participant
            for participant in self.rooms[room_id]:
                try:
                    await participant.send_json({"type": "peer-left"})
                except:
                    pass
            
            # Clean up empty rooms
            if not self.rooms[room_id]:
                del self.rooms[room_id]
                if room_id in self.room_roles:
                    del self.room_roles[room_id]
        
        del self.connections[ws]
    
    async def send_to_peer(self, ws: WebSocket, message: dict):
        room_id = self.connections.get(ws)
        if not room_id or room_id not in self.rooms:
            return
        
        for participant in self.rooms[room_id]:
            if participant != ws:
                try:
                    await participant.send_json(message)
                except:
                    pass

manager = RoomManager()

async def websocket_handler(websocket: WebSocket):
    await websocket.accept()
    current_room = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            
            if msg_type == "create":
                current_room = await manager.create_room(websocket)
                
            elif msg_type == "join":
                room_id = message.get("roomId")
                current_room = room_id
                await manager.join_room(websocket, room_id)
                
            elif msg_type == "offer":
                await manager.send_to_peer(websocket, {
                    "type": "offer",
                    "sdp": message.get("sdp")
                })
                
            elif msg_type == "answer":
                await manager.send_to_peer(websocket, {
                    "type": "answer", 
                    "sdp": message.get("sdp")
                })
                
            elif msg_type == "ice-candidate":
                await manager.send_to_peer(websocket, {
                    "type": "ice-candidate",
                    "candidate": message.get("candidate")
                })
                
            elif msg_type == "leave":
                await manager.leave_room(websocket)
                break
                
    except WebSocketDisconnect:
        await manager.leave_room(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.leave_room(websocket)
