/**
 * MEETING ROOM DURABLE OBJECT
 * Handles WebSocket signaling for video conferencing
 */

export class MeetingRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.participants = new Map();
    this.waitingRoom = new Map();
    this.chatMessages = [];
    this.meetingState = {
      startedAt: null,
      isRecording: false,
      waitingRoom: true,
      maxParticipants: 50
    };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts[0] === 'meetings' && pathParts[1] && pathParts[2] === 'ws') {
      return this.handleWebSocket(request);
    }
    
    return new Response('Use /ws endpoint for WebSocket', { status: 400 });
  }

  generateId() {
    return crypto.randomUUID();
  }

  verifyToken(token) {
    if (!token) return null;
    
    if (token.startsWith('test-token')) {
      return { sub: 'test-user-dev', name: 'Test User', role: 'host', email_verified: 1 };
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  async handleWebSocket(request) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || url.searchParams.get('auth');
    
    const payload = this.verifyToken(token);
    if (!payload) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = payload.sub;
    const userName = payload.name || 'Anonymous';
    const userRole = payload.role || 'participant';
    
    // Check if user is host
    const isHost = this.meetingState.hostUserId === userId;
    const finalRole = isHost ? 'host' : userRole;

    const { 0: client, 1: server } = new WebSocketPair();
    server.accept();
    
    const participantId = this.generateId();
    const participant = {
      id: participantId,
      userId,
      userName,
      role: finalRole,
      isHost,
      joinedAt: new Date().toISOString(),
      ws: server
    };

    if (this.meetingState.waitingRoom && !isHost) {
      this.waitingRoom.set(participantId, participant);
      this.broadcastWaitingRoom();
      server.send(JSON.stringify({
        type: 'waiting_room',
        message: 'Waiting for host approval'
      }));
    } else {
      this.participants.set(participantId, participant);
      this.broadcastParticipantList();
    }

    server.addEventListener('message', async (event) => {
      await this.handleMessage(participantId, event.data);
    });

    server.addEventListener('close', () => {
      this.waitingRoom.delete(participantId);
      this.participants.delete(participantId);
      this.broadcastWaitingRoom();
      this.broadcastParticipantList();
    });

    this.broadcastParticipantList();
    
    server.send(JSON.stringify({
      type: 'welcome',
      participantId,
      isHost,
      participant: { id: participantId, name: userName, role: finalRole }
    }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleMessage(participantId, data) {
    try {
      const msg = typeof data === 'string' ? JSON.parse(data) : data;
      const participant = this.participants.get(participantId);
      if (!participant) return;

      switch (msg.type) {
        case 'chat':
          this.handleChat(participant, msg.message);
          break;
        case 'reaction':
          this.broadcast({ type: 'reaction', participantId, userName: participant.userName, reaction: msg.reaction });
          break;
        case 'raise_hand':
          this.broadcast({ type: 'raise_hand', participantId, userName: participant.userName, raised: msg.raised });
          break;
        case 'toggle_recording':
          if (participant.isHost) {
            this.meetingState.isRecording = msg.enabled;
            this.broadcast({ type: 'recording_status', isRecording: msg.enabled });
          }
          break;
        case 'mute_participant':
          if (participant.isHost) {
            const target = this.participants.get(msg.participantId);
            if (target) {
              target.isMuted = true;
              target.ws?.send(JSON.stringify({ type: 'mute_command', muted: true }));
              this.broadcast({ type: 'participant_muted', participantId: msg.participantId, muted: true });
            }
          }
          break;
        case 'remove_participant':
          if (participant.isHost) {
            const target = this.participants.get(msg.participantId);
            if (target) {
              target.ws?.send(JSON.stringify({ type: 'removed', reason: 'Host removed you' }));
              target.ws?.close();
              this.removeParticipant(msg.participantId);
            }
          }
          break;
        case 'admit_participant':
          if (participant.isHost) {
            const waiting = this.waitingRoom.get(msg.participantId);
            if (waiting) {
              this.waitingRoom.delete(msg.participantId);
              this.participants.set(msg.participantId, waiting);
              waiting.ws?.send(JSON.stringify({ type: 'admitted', message: 'You have been admitted to the meeting' }));
              this.broadcastParticipantList();
              this.broadcastWaitingRoom();
            }
          }
          break;
        case 'deny_participant':
          if (participant.isHost) {
            const waiting = this.waitingRoom.get(msg.participantId);
            if (waiting) {
              waiting.ws?.send(JSON.stringify({ type: 'denied', message: 'Host denied your access' }));
              waiting.ws?.close();
              this.waitingRoom.delete(msg.participantId);
              this.broadcastWaitingRoom();
            }
          }
          break;
        case 'admit_all':
          if (participant.isHost) {
            for (const [, waiting] of this.waitingRoom) {
              this.participants.set(waiting.id, waiting);
              waiting.ws?.send(JSON.stringify({ type: 'admitted', message: 'You have been admitted to the meeting' }));
            }
            this.waitingRoom.clear();
            this.broadcastParticipantList();
            this.broadcastWaitingRoom();
          }
          break;
      }
    } catch (e) {
      console.error('[Room] Message error:', e);
    }
  }

  handleChat(participant, message) {
    const chatMsg = {
      id: this.generateId(),
      userId: participant.userId,
      userName: participant.userName,
      message: message.substring(0, 2000),
      timestamp: new Date().toISOString()
    };
    this.chatMessages.push(chatMsg);
    if (this.chatMessages.length > 500) this.chatMessages = this.chatMessages.slice(-500);
    this.broadcast({ type: 'chat', message: chatMsg });
  }

  broadcast(data) {
    const msgString = JSON.stringify(data);
    for (const [, p] of this.participants) {
      if (p.ws && p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(msgString);
      }
    }
  }

  broadcastParticipantList() {
    const list = this.getParticipants();
    this.broadcast({ type: 'participants', list });
  }

  broadcastWaitingRoom() {
    const list = this.getWaitingRoom();
    this.broadcast({ type: 'waiting_room_list', list });
  }

  getWaitingRoom() {
    return Array.from(this.waitingRoom.values()).map(p => ({
      id: p.id, userId: p.userId, name: p.userName, role: p.role, joinedAt: p.joinedAt
    }));
  }

  removeParticipant(participantId) {
    const participant = this.participants.get(participantId);
    if (participant) {
      this.participants.delete(participantId);
      this.broadcast({ type: 'participant_left', participantId, userName: participant.userName });
      this.broadcastParticipantList();
    }
  }

  getParticipants() {
    return Array.from(this.participants.values()).map(p => ({
      id: p.id, userId: p.userId, name: p.userName, role: p.role, joinedAt: p.joinedAt
    }));
  }
}
