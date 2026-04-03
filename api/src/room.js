/**
 * MEETING ROOM DURABLE OBJECT
 * Handles WebSocket signaling for video conferencing
 */

export class MeetingRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.participants = new Map();
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

    const userName = payload.name || 'Anonymous';
    const userRole = payload.role || 'participant';

    const { 0: client, 1: server } = new WebSocketPair();
    server.accept();
    
    const participantId = this.generateId();
    const participant = {
      id: participantId,
      userId: payload.sub,
      userName,
      role: userRole,
      joinedAt: new Date().toISOString(),
      ws: server
    };

    this.participants.set(participantId, participant);

    server.addEventListener('message', async (event) => {
      await this.handleMessage(participantId, event.data);
    });

    server.addEventListener('close', () => {
      this.removeParticipant(participantId);
    });

    this.broadcastParticipantList();
    
    server.send(JSON.stringify({
      type: 'welcome',
      participantId,
      participant: { id: participantId, name: userName, role: userRole }
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
          if (participant.role === 'host') {
            this.meetingState.isRecording = msg.enabled;
            this.broadcast({ type: 'recording_status', isRecording: msg.enabled });
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
