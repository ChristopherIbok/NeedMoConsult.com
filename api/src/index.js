/**
 * NEEDMO API - Cloudflare Workers
 * Complete video conferencing API with authentication
 */

const callTestHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeedMo - Meeting Room</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111; color: #fff; height: 100vh; overflow: hidden; }
    
    .app { display: flex; height: 100vh; }
    .sidebar { width: 280px; background: #1a1a1a; padding: 20px; border-right: 1px solid #333; display: flex; flex-direction: column; }
    .main { flex: 1; display: flex; flex-direction: column; }
    
    .video-grid { display: grid; gap: 10px; padding: 20px; flex: 1; background: #000; overflow: auto; }
    .video-grid.has-1 { grid-template-columns: 1fr; }
    .video-grid.has-2 { grid-template-columns: 1fr 1fr; }
    .video-grid.has-3, .video-grid.has-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .video-grid.has-5, .video-grid.has-6 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
    
    .video-tile { background: #222; border-radius: 8px; position: relative; overflow: hidden; min-height: 200px; display: flex; align-items: center; justify-content: center; }
    .video-tile video { width: 100%; height: 100%; object-fit: cover; }
    .video-tile .name { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 4px 10px; border-radius: 4px; font-size: 14px; }
    .video-tile .role-badge { position: absolute; top: 10px; left: 10px; background: #eab308; color: #000; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .video-tile .role-badge.host { background: #ef4444; color: #fff; }
    .video-tile video.mirror { transform: scaleX(-1); }
    
    .controls { padding: 20px; background: #1a1a1a; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 12px 20px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn:hover { transform: scale(1.05); }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-secondary { background: #333; color: #fff; }
    .btn-active { background: #22c55e; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    .chat-panel { width: 320px; background: #1a1a1a; border-left: 1px solid #333; display: flex; flex-direction: column; }
    .chat-header { padding: 15px; border-bottom: 1px solid #333; font-weight: 600; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
    .chat-input { padding: 15px; border-top: 1px solid #333; display: flex; gap: 10px; }
    .chat-input input { flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #333; background: #222; color: #fff; }
    .chat-input input:focus { outline: none; border-color: #3b82f6; }
    
    .message { padding: 8px 12px; background: #252525; border-radius: 8px; }
    .message .sender { font-size: 12px; color: #888; margin-bottom: 4px; }
    .message .text { font-size: 14px; }
    
    .participants-list { flex: 1; overflow-y: auto; padding: 15px; }
    .participant-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #252525; border-radius: 6px; margin-bottom: 8px; }
    .participant-item .avatar { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .participant-item .info { flex: 1; }
    .participant-item .info .name { font-size: 14px; }
    .participant-item .info .role { font-size: 12px; color: #888; }
    
    .status { padding: 10px 20px; background: #252525; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
    .status-indicator { display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
    .dot.disconnected { background: #ef4444; }
    
    .join-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
    .join-form { background: #1a1a1a; padding: 40px; border-radius: 12px; width: 400px; text-align: center; }
    .join-form h1 { margin-bottom: 30px; }
    .join-form input { width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #333; background: #222; color: #fff; }
    .join-form .btn { width: 100%; justify-content: center; }
    
    .meeting-info { margin-bottom: 20px; padding: 15px; background: #252525; border-radius: 8px; text-align: left; }
    .meeting-info h3 { margin-bottom: 10px; }
    .meeting-info p { color: #888; font-size: 14px; margin-bottom: 5px; }
    
    .hidden { display: none !important; }
    
    .reactions { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 100; font-size: 48px; animation: floatUp 2s ease-out forwards; }
    @keyframes floatUp { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -150%) scale(1.5); } }
    
    .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: #333; padding: 12px 24px; border-radius: 8px; animation: slideUp 0.3s ease; z-index: 1000; }
    @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
  </style>
</head>
<body>
  <div id="join-screen" class="join-screen">
    <div class="join-form">
      <h1>NeedMo Meeting</h1>
      <input type="text" id="meeting-link" placeholder="Meeting Link (e.g., abc123xyz)">
      <input type="text" id="user-name" placeholder="Your Name">
      <button class="btn btn-primary" onclick="joinMeeting()">Join Meeting</button>
    </div>
  </div>

  <div id="meeting-room" class="app hidden">
    <div class="sidebar">
      <div class="meeting-info">
        <h3 id="meeting-title">Meeting</h3>
        <p id="participant-count">0 participants</p>
        <p id="recording-status">Not recording</p>
      </div>
      <div class="participants-list" id="participants-list"></div>
    </div>
    
    <div class="main">
      <div class="status">
        <div class="status-indicator">
          <span class="dot" id="status-dot"></span>
          <span id="status-text">Connecting...</span>
        </div>
        <span id="time-elapsed">00:00</span>
      </div>
      
      <div class="video-grid" id="video-grid"></div>
      
      <div class="controls">
        <button class="btn btn-secondary" id="btn-mic" onclick="toggleMic()">Mute</button>
        <button class="btn btn-secondary" id="btn-camera" onclick="toggleCamera()">Camera</button>
        <button class="btn btn-secondary" id="btn-screen" onclick="toggleScreen()">Share Screen</button>
        <button class="btn btn-secondary" id="btn-record" onclick="toggleRecord()">Record</button>
        <button class="btn btn-secondary" onclick="raiseHand()">Raise Hand</button>
        <button class="btn btn-danger" onclick="leaveMeeting()">Leave</button>
      </div>
    </div>
    
    <div class="chat-panel">
      <div class="chat-header">Chat</div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input">
        <input type="text" id="chat-input" placeholder="Type a message..." onkeypress="handleChatKeypress(event)">
        <button class="btn btn-primary" onclick="sendChat()">Send</button>
      </div>
    </div>
  </div>

  <script>
    const API_URL = window.location.origin;
    let ws = null;
    let localStream = null;
    let screenStream = null;
    let meetingId = null;
    let participantId = null;
    let participants = new Map();
    let isMicOn = true;
    let isCameraOn = true;
    let isRecording = false;
    let startTime = null;
    let authToken = null;
    let userName = '';

    async function joinMeeting() {
      const link = document.getElementById('meeting-link').value.trim();
      userName = document.getElementById('user-name').value.trim() || 'Anonymous';
      
      if (!link) { showToast('Please enter a meeting link'); return; }
      
      meetingId = link.replace(/^.*\\//, '').replace(/^.*meeting[/]/, '');
      
      try {
        const loginRes = await fetch(\`\${API_URL}/api/auth/login\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
        });
        
        const loginData = await loginRes.json();
        if (!loginData.access_token) {
          authToken = 'test-token';
        } else {
          authToken = loginData.access_token;
        }
      } catch (e) {
        authToken = 'test-token';
      }
      
      connectWebSocket();
    }

    function connectWebSocket() {
      const wsUrl = \`\${API_URL}/meetings/\${meetingId}/ws?token=\${authToken}\`;
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        updateStatus('connected', 'Connected');
        startTime = Date.now();
        setInterval(updateTimer, 1000);
      };
      
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      };
      
      ws.onclose = () => {
        updateStatus('disconnected', 'Disconnected');
        showToast('Disconnected from meeting');
      };
      
      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        updateStatus('disconnected', 'Connection Error');
      };
    }

    function handleMessage(msg) {
      switch (msg.type) {
        case 'welcome':
          participantId = msg.participantId;
          document.getElementById('meeting-title').textContent = msg.meetingId;
          document.getElementById('join-screen').classList.add('hidden');
          document.getElementById('meeting-room').classList.remove('hidden');
          initLocalMedia();
          break;
          
        case 'participants':
          updateParticipantsList(msg.list);
          updateVideoGrid(msg.list);
          break;
          
        case 'chat':
          addChatMessage(msg.message);
          break;
          
        case 'participant_left':
          participants.delete(msg.participantId);
          updateParticipantsList(Array.from(participants.values()));
          updateVideoGrid(Array.from(participants.values()));
          showToast(\`\${msg.userName} left the meeting\`);
          break;
          
        case 'recording_status':
          isRecording = msg.isRecording;
          document.getElementById('recording-status').textContent = msg.isRecording ? 'Recording' : 'Not recording';
          showToast(msg.isRecording ? 'Recording started' : 'Recording stopped');
          break;
          
        case 'reaction':
          showReaction(msg.userName, msg.reaction);
          break;
          
        case 'raise_hand':
          showToast(\`\${msg.userName} \${msg.raised ? 'raised' : 'lowered'} hand\`);
          break;
      }
    }

    async function initLocalMedia() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoEl = document.createElement('video');
        videoEl.srcObject = localStream;
        videoEl.autoplay = true;
        videoEl.muted = true;
        videoEl.classList.add('mirror');
        videoEl.dataset.participantId = 'local';
        
        const tile = createVideoTile('local', userName, 'You', videoEl);
        document.getElementById('video-grid').appendChild(tile);
      } catch (e) {
        console.error('Media error:', e);
        showToast('Could not access camera/mic');
      }
    }

    function createVideoTile(id, name, role, videoEl) {
      const tile = document.createElement('div');
      tile.className = 'video-tile';
      tile.dataset.participantId = id;
      
      tile.appendChild(videoEl);
      
      const nameEl = document.createElement('div');
      nameEl.className = 'name';
      nameEl.textContent = name;
      tile.appendChild(nameEl);
      
      if (role === 'host') {
        const badge = document.createElement('div');
        badge.className = 'role-badge host';
        badge.textContent = 'HOST';
        tile.appendChild(badge);
      }
      
      return tile;
    }

    function updateParticipantsList(list) {
      const container = document.getElementById('participants-list');
      container.innerHTML = '';
      
      list.forEach(p => {
        participants.set(p.id, p);
        
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = \`
          <div class="avatar">\${p.name.charAt(0).toUpperCase()}</div>
          <div class="info">
            <div class="name">\${p.name}\${p.id === participantId ? ' (You)' : ''}</div>
            <div class="role">\${p.role}</div>
          </div>
        \`;
        container.appendChild(item);
      });
      
      document.getElementById('participant-count').textContent = \`\${list.length} participant\${list.length !== 1 ? 's' : ''}\`;
    }

    function updateVideoGrid(list) {
      const grid = document.getElementById('video-grid');
      const count = list.length + (localStream ? 1 : 0);
      grid.className = \`video-grid has-\${Math.min(count, 6)}\`;
    }

    function sendMessage(type, data) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, ...data }));
      }
    }

    function toggleMic() {
      isMicOn = !isMicOn;
      if (localStream) {
        localStream.getAudioTracks().forEach(t => t.enabled = isMicOn);
      }
      document.getElementById('btn-mic').textContent = isMicOn ? 'Mute' : 'Unmute';
      document.getElementById('btn-mic').classList.toggle('btn-active', isMicOn);
    }

    function toggleCamera() {
      isCameraOn = !isCameraOn;
      if (localStream) {
        localStream.getVideoTracks().forEach(t => t.enabled = isCameraOn);
      }
      document.getElementById('btn-camera').textContent = isCameraOn ? 'Camera' : 'Camera Off';
      document.getElementById('btn-camera').classList.toggle('btn-active', isCameraOn);
    }

    async function toggleScreen() {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
        document.getElementById('btn-screen').classList.remove('btn-active');
      } else {
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          document.getElementById('btn-screen').classList.add('btn-active');
          screenStream.getVideoTracks()[0].onended = () => {
            screenStream = null;
            document.getElementById('btn-screen').classList.remove('btn-active');
          };
        } catch (e) {
          showToast('Could not share screen');
        }
      }
    }

    function toggleRecord() {
      isRecording = !isRecording;
      sendMessage('toggle_recording', { enabled: isRecording });
      document.getElementById('btn-record').classList.toggle('btn-active', isRecording);
    }

    function raiseHand() {
      sendMessage('raise_hand', { raised: true });
    }

    function sendChat() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      if (message) {
        sendMessage('chat', { message });
        input.value = '';
      }
    }

    function handleChatKeypress(e) {
      if (e.key === 'Enter') sendChat();
    }

    function addChatMessage(msg) {
      const container = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'message';
      div.innerHTML = \`<div class="sender">\${msg.user_name}</div><div class="text">\${msg.message}</div>\`;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

    function leaveMeeting() {
      if (ws) ws.close();
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      window.location.reload();
    }

    function updateStatus(state, text) {
      const dot = document.getElementById('status-dot');
      const textEl = document.getElementById('status-text');
      dot.className = \`dot \${state === 'disconnected' ? 'disconnected' : ''}\`;
      textEl.textContent = text;
    }

    function updateTimer() {
      if (!startTime) return;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      document.getElementById('time-elapsed').textContent = \`\${mins}:\${secs}\`;
    }

    function showToast(message) {
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();
      
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    function showReaction(userName, reaction) {
      const el = document.createElement('div');
      el.className = 'reactions';
      el.textContent = reaction;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  </script>
</body>
</html>`;

const ALLOWED_ORIGINS = [
  'https://needmoconsult.com',
  'https://www.needmoconsult.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function errorResponse(message, status = 500) {
  console.error(`[ERROR] ${status}: ${message}`);
  return jsonResponse({ error: message }, status);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
  return crypto.randomUUID();
}

function base64UrlEncode(data) {
  return btoa(JSON.stringify(data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createToken(payload, secret, expiresIn = '7d') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: getExpiry(expiresIn)
  });
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = btoa(message + secret)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${message}.${signature}`;
}

function getExpiry(expiresIn) {
  const units = { 's': 1, 'm': 60, 'h': 3600, 'd': 86400 };
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));
  return Math.floor(Date.now() / 1000) + (value * units[unit]);
}

function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 12; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

// ============================================
// RATE LIMITING
// ============================================

async function checkRateLimit(env, key, limit = 5, windowSeconds = 60) {
  if (!env.RATE_LIMIT) {
    return true;
  }
  
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= limit) {
    return false;
  }
  
  await env.RATE_LIMIT.put(key, (count + 1).toString(), { expirationTtl: windowSeconds });
  return true;
}

// ============================================
// DATABASE HELPERS
// ============================================

async function dbGetUserByEmail(env, email) {
  const stmt = env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email);
  return stmt.first();
}

async function dbGetUserById(env, id) {
  const stmt = env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id);
  return stmt.first();
}

async function dbCreateUser(env, { id, email, passwordHash, name }) {
  const stmt = env.DB.prepare(`
    INSERT INTO users (id, email, password_hash, name, subscription_tier, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'free', 0, datetime('now'), datetime('now'))
  `).bind(id, email, passwordHash, name);
  await stmt.run();
}

async function dbUpdateUser(env, id, updates) {
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  const stmt = env.DB.prepare(`
    UPDATE users SET ${fields}, updated_at = datetime('now') WHERE id = ?
  `).bind(...values, id);
  await stmt.run();
}

async function dbGetMeetings(env, userId, filter = 'all') {
  let query = '';
  switch (filter) {
    case 'upcoming':
      query = `SELECT m.* FROM meetings m
        JOIN meeting_participants mp ON m.id = mp.meeting_id
        WHERE mp.user_id = ? AND m.scheduled_start > datetime('now')
        ORDER BY m.scheduled_start ASC`;
      break;
    case 'past':
      query = `SELECT m.* FROM meetings m
        JOIN meeting_participants mp ON m.id = mp.meeting_id
        WHERE mp.user_id = ? AND (m.status = 'ended' OR m.scheduled_start < datetime('now'))
        ORDER BY m.scheduled_start DESC`;
      break;
    default:
      query = `SELECT m.* FROM meetings m
        JOIN meeting_participants mp ON m.id = mp.meeting_id
        WHERE mp.user_id = ?
        ORDER BY m.created_at DESC`;
  }
  const stmt = env.DB.prepare(query).bind(userId);
  return stmt.all();
}

async function dbCreateMeeting(env, meeting) {
  const stmt = env.DB.prepare(`
    INSERT INTO meetings (id, host_user_id, title, description, scheduled_start, scheduled_end, is_instant, meeting_link_slug, settings, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
  `).bind(
    meeting.id,
    meeting.hostUserId,
    meeting.title,
    meeting.description || null,
    meeting.scheduledStart || null,
    meeting.scheduledEnd || null,
    meeting.isInstant ? 1 : 0,
    meeting.slug,
    JSON.stringify(meeting.settings)
  );
  await stmt.run();
}

async function dbGetMeetingById(env, id) {
  const stmt = env.DB.prepare('SELECT * FROM meetings WHERE id = ?').bind(id);
  return stmt.first();
}

async function dbGetMeetingBySlug(env, slug) {
  const stmt = env.DB.prepare('SELECT * FROM meetings WHERE meeting_link_slug = ?').bind(slug);
  return stmt.first();
}

async function dbAddParticipant(env, meetingId, userId, role) {
  const stmt = env.DB.prepare(`
    INSERT INTO meeting_participants (id, meeting_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).bind(generateId(), meetingId, userId, role);
  await stmt.run();
}

async function dbGetRecordings(env, userId) {
  const stmt = env.DB.prepare(`
    SELECT r.* FROM recordings r
    JOIN meetings m ON r.meeting_id = m.id
    JOIN meeting_participants mp ON m.id = mp.meeting_id
    WHERE mp.user_id = ?
    ORDER BY r.created_at DESC
  `).bind(userId);
  return stmt.all();
}

async function dbSaveEmailToken(env, token, userId, type) {
  const table = type === 'verification' ? 'email_verification_tokens' : 'password_reset_tokens';
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const stmt = env.DB.prepare(`
    INSERT INTO ${table} (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(generateId(), userId, token, expiresAt);
  await stmt.run();
}

// ============================================
// EMAIL SERVICE
// ============================================

async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return { success: true };
  }
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'NEEDMO <noreply@needmoconsult.com>',
        to,
        subject,
        html
      })
    });
    return await res.json();
  } catch (e) {
    console.error('[EMAIL] Error:', e);
    return { success: false, error: e.message };
  }
}

async function sendVerificationEmail(env, email, name, token) {
  const url = `https://needmoconsult.com/verify-email?token=${token}`;
  return sendEmail(env, email, 'Verify your NEEDMO account', `
    <h1>Welcome to NEEDMO!</h1>
    <p>Hi ${name},</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${url}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
    <p>Or copy this link: ${url}</p>
  `);
}

async function sendPasswordResetEmail(env, email, name, token) {
  const url = `https://needmoconsult.com/reset-password?token=${token}`;
  return sendEmail(env, email, 'Reset your NEEDMO password', `
    <h1>Reset Password</h1>
    <p>Hi ${name},</p>
    <p>Click below to reset your password:</p>
    <a href="${url}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
    <p>Or copy this link: ${url}</p>
    <p>This link expires in 24 hours.</p>
  `);
}

// ============================================
// STRIPE
// ============================================

const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', maxParticipants: 1, maxDuration: 40, recording: false },
  pro: { name: 'Pro', maxParticipants: 50, maxDuration: 240, recording: true },
  business: { name: 'Business', maxParticipants: 100, maxDuration: 0, recording: true, transcription: true }
};

const STRIPE_PRICES = {
  pro: { monthly: 'price_pro_monthly_id', yearly: 'price_pro_yearly_id' },
  business: { monthly: 'price_business_monthly_id', yearly: 'price_business_yearly_id' }
};

async function createStripeCheckout(env, userId, priceId, successUrl, cancelUrl) {
  const user = await dbGetUserById(env, userId);
  
  let customerId = user.stripe_customer_id;
  
  if (!customerId) {
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id }
      })
    });
    const customer = await customerRes.json();
    customerId = customer.id;
    await dbUpdateUser(env, userId, { stripe_customer_id: customerId });
  }

  const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      customer: customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      metadata: { userId: user.id }
    })
  });
  
  return await sessionRes.json();
}

async function createStripePortal(env, customerId, returnUrl) {
  const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: returnUrl
    })
  });
  return await res.json();
}

async function handleStripeWebhook(env, body, signature) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const event = JSON.parse(body);
  
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object;
      let tier = 'free';
      if (subscription.items.data[0].price.id === STRIPE_PRICES.pro.monthly || subscription.items.data[0].price.id === STRIPE_PRICES.pro.yearly) {
        tier = 'pro';
      } else if (subscription.items.data[0].price.id === STRIPE_PRICES.business.monthly || subscription.items.data[0].price.id === STRIPE_PRICES.business.yearly) {
        tier = 'business';
      }
      
      const customerId = subscription.customer;
      await env.DB.prepare('UPDATE users SET subscription_tier = ? WHERE stripe_customer_id = ?').bind(tier, customerId).run();
      break;
    }
    case 'customer.subscription.deleted': {
      const customerId = event.data.object.customer;
      await env.DB.prepare('UPDATE users SET subscription_tier = ? WHERE stripe_customer_id = ?').bind('free', customerId).run();
      break;
    }
  }
  
  return { received: true };
}

// ============================================
// AUTH MIDDLEWARE
// ============================================

function requireAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing auth token', status: 401 };
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token, env.JWT_SECRET_KEY);
  if (!payload) {
    return { error: 'Invalid token', status: 401 };
  }
  return { payload };
}

function requireVerifiedUser(env, payload) {
  if (!payload.email_verified) {
    return { error: 'Email verification required', status: 403 };
  }
  return { valid: true };
}

// ============================================
// REALTIMEKIT
// ============================================

async function createRealtimeKitMeeting(env, meetingId, title) {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN } = env;
  
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_APP_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare RealtimeKit not configured');
  }
  
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings/${meetingId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
      },
      body: JSON.stringify({ name: title })
    }
  );
  
  return await res.json();
}

async function addRealtimeKitParticipant(env, meetingId, name, role, customId) {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN } = env;
  
  const presetMap = {
    host: 'group_call_host',
    participant: 'group_call_participant',
    viewer: 'webinar_viewer',
    presenter: 'webinar_presenter'
  };
  
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings/${meetingId}/participants`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
      },
      body: JSON.stringify({
        name,
        preset_name: presetMap[role] || 'group_call_participant',
        custom_participant_id: customId
      })
    }
  );
  
  return await res.json();
}

// ============================================
// ROUTE HANDLERS
// ============================================

// POST /api/auth/register
async function handleRegister(request, env) {
  const rateKey = `rate:register:${request.headers.get('CF-Connecting-IP')}`;
  if (!await checkRateLimit(env, rateKey)) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }
  
  const body = await request.json();
  const { email, password, name } = body;
  
  if (!email || !password || !name) {
    return errorResponse('Missing required fields', 400);
  }
  
  if (password.length < 8) {
    return errorResponse('Password must be at least 8 characters', 400);
  }
  
  const existing = await dbGetUserByEmail(env, email);
  if (existing) {
    return errorResponse('Email already registered', 400);
  }
  
  const passwordHash = await hashPassword(password);
  const userId = generateId();
  
  await dbCreateUser(env, { id: userId, email, passwordHash, name });
  
  const token = generateId();
  await dbSaveEmailToken(env, token, userId, 'verification');
  await sendVerificationEmail(env, email, name, token);
  
  return jsonResponse({ message: 'Registration successful. Please check your email to verify.' });
}

// POST /api/auth/login
async function handleLogin(request, env) {
  const rateKey = `rate:login:${request.headers.get('CF-Connecting-IP')}`;
  if (!await checkRateLimit(env, rateKey)) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }
  
  const body = await request.json();
  const { email, password } = body;
  
  if (!email || !password) {
    return errorResponse('Missing email or password', 400);
  }
  
  const user = await dbGetUserByEmail(env, email);
  if (!user) {
    return errorResponse('Invalid credentials', 401);
  }
  
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return errorResponse('Invalid credentials', 401);
  }
  
  const token = createToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.subscription_tier,
    email_verified: user.email_verified,
    avatar_url: user.avatar_url
  }, env.JWT_SECRET_KEY);
  
  return jsonResponse({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      subscriptionTier: user.subscription_tier,
      emailVerified: user.email_verified
    }
  });
}

// POST /api/auth/logout
async function handleLogout(request, env) {
  return jsonResponse({ message: 'Logged out successfully' });
}

// POST /api/auth/verify-email
async function handleVerifyEmail(request, env) {
  const body = await request.json();
  const { token } = body;
  
  if (!token) {
    return errorResponse('Missing verification token', 400);
  }
  
  const tokenRow = await env.DB.prepare(`
    SELECT * FROM email_verification_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).bind(token).first();
  
  if (!tokenRow) {
    return errorResponse('Invalid or expired token', 400);
  }
  
  await env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(tokenRow.user_id).run();
  await env.DB.prepare('UPDATE email_verification_tokens SET used = 1 WHERE id = ?').bind(tokenRow.id).run();
  
  return jsonResponse({ message: 'Email verified successfully' });
}

// POST /api/auth/reset-password
async function handleResetPasswordRequest(request, env) {
  const rateKey = `rate:reset:${request.headers.get('CF-Connecting-IP')}`;
  if (!await checkRateLimit(env, rateKey, 3, 60)) {
    return errorResponse('Too many requests', 429);
  }
  
  const body = await request.json();
  const { email } = body;
  
  const user = await dbGetUserByEmail(env, email);
  if (!user) {
    return jsonResponse({ message: 'If the email exists, a reset link will be sent' });
  }
  
  const token = generateId();
  await dbSaveEmailToken(env, token, user.id, 'password');
  await sendPasswordResetEmail(env, user.email, user.name, token);
  
  return jsonResponse({ message: 'If the email exists, a reset link will be sent' });
}

// POST /api/auth/change-password
async function handleChangePassword(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const body = await request.json();
  const { currentPassword, newPassword } = body;
  
  if (!currentPassword || !newPassword) {
    return errorResponse('Missing passwords', 400);
  }
  
  if (newPassword.length < 8) {
    return errorResponse('Password must be at least 8 characters', 400);
  }
  
  const user = await dbGetUserById(env, auth.payload.sub);
  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    return errorResponse('Current password is incorrect', 400);
  }
  
  const newHash = await hashPassword(newPassword);
  await dbUpdateUser(env, auth.payload.sub, { password_hash: newHash });
  
  return jsonResponse({ message: 'Password changed successfully' });
}

// GET /api/user/me
async function handleGetMe(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const user = await dbGetUserById(env, auth.payload.sub);
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  return jsonResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    subscriptionTier: user.subscription_tier,
    emailVerified: user.email_verified,
    createdAt: user.created_at
  });
}

// PUT /api/user/me
async function handleUpdateMe(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const body = await request.json();
  const { name, avatarUrl } = body;
  
  const updates = {};
  if (name) updates.name = name;
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
  
  if (Object.keys(updates).length > 0) {
    await dbUpdateUser(env, auth.payload.sub, updates);
  }
  
  const user = await dbGetUserById(env, auth.payload.sub);
  return jsonResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    subscriptionTier: user.subscription_tier,
    emailVerified: user.email_verified
  });
}

// GET /api/meetings
async function handleGetMeetings(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all';
  const meetings = await dbGetMeetings(env, auth.payload.sub, filter);
  
  return jsonResponse({ meetings });
}

// POST /api/meetings
async function handleCreateMeeting(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const body = await request.json();
  const { title, description, scheduledStart, scheduledEnd, isInstant, settings } = body;
  
  if (!title) {
    return errorResponse('Title is required', 400);
  }
  
  const user = await dbGetUserById(env, auth.payload.sub);
  const tier = SUBSCRIPTION_TIERS[user.subscription_tier];
  
  const meetingId = generateId();
  const slug = generateSlug();
  
  const defaultSettings = {
    waitingRoom: true,
    recordingEnabled: tier.recording,
    maxParticipants: tier.maxParticipants
  };
  
  await dbCreateMeeting(env, {
    id: meetingId,
    hostUserId: auth.payload.sub,
    title,
    description,
    scheduledStart,
    scheduledEnd,
    isInstant: isInstant || false,
    slug,
    settings: { ...defaultSettings, ...settings }
  });
  
  await dbAddParticipant(env, meetingId, auth.payload.sub, 'host');
  
  if (isInstant) {
    await createRealtimeKitMeeting(env, meetingId, title).catch(console.error);
  }
  
  return jsonResponse({
    meeting: {
      id: meetingId,
      title,
      slug,
      meetingLink: `https://needmoconsult.com/meeting/${slug}`,
      isInstant,
      scheduledStart,
      settings: { ...defaultSettings, ...settings }
    }
  });
}

// GET /api/meetings/:id
async function handleGetMeeting(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const meeting = await dbGetMeetingById(env, id);
  if (!meeting) {
    return errorResponse('Meeting not found', 404);
  }
  
  const participant = await env.DB.prepare(`
    SELECT * FROM meeting_participants WHERE meeting_id = ? AND user_id = ?
  `).bind(id, auth.payload.sub).first();
  
  if (!participant && meeting.host_user_id !== auth.payload.sub) {
    return errorResponse('Not authorized', 403);
  }
  
  return jsonResponse({ meeting });
}

// DELETE /api/meetings/:id
async function handleDeleteMeeting(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const meeting = await dbGetMeetingById(env, id);
  if (!meeting) {
    return errorResponse('Meeting not found', 404);
  }
  
  if (meeting.host_user_id !== auth.payload.sub) {
    return errorResponse('Only the host can delete this meeting', 403);
  }
  
  await env.DB.prepare('UPDATE meetings SET status = ? WHERE id = ?').bind('cancelled', id).run();
  
  return jsonResponse({ message: 'Meeting cancelled' });
}

// GET /api/recordings
async function handleGetRecordings(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const recordings = await dbGetRecordings(env, auth.payload.sub);
  return jsonResponse({ recordings });
}

// POST /api/recordings/upload
async function handleUploadRecording(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  if (!env.needmo_recordings) {
    return errorResponse('Storage not configured', 500);
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const meetingId = formData.get('meetingId');
    
    if (!file) {
      return errorResponse('Missing file', 400);
    }
    if (!meetingId) {
      return errorResponse('Missing meetingId', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const fileSize = buffer.length;
    
    const key = `recordings/${meetingId}/${Date.now()}-${file.name}`;
    
    await env.needmo_recordings.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || 'video/webm'
      }
    });

    const recordingId = generateId();
    await env.DB.prepare(`
      INSERT INTO recordings (id, meeting_id, recorded_by_user_id, r2_key, file_size_bytes, status)
      VALUES (?, ?, ?, ?, ?, 'ready')
    `).bind(recordingId, meetingId, auth.payload.sub, key, fileSize).run();

    return jsonResponse({ 
      success: true, 
      key,
      fileSize,
      message: 'Recording saved successfully'
    });
  } catch (e) {
    console.error('[Upload] Error:', e);
    return errorResponse(`Upload failed: ${e.message}`, 500);
  }
}

// POST /api/meetings/create (public - for quick meeting creation)
async function handleQuickCreateMeeting(request, env) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Quick Meeting';
  
  const meetingId = generateId();
  const slug = generateSlug();
  
  await dbCreateMeeting(env, {
    id: meetingId,
    hostUserId: 'quick-create',
    title,
    slug,
    isInstant: true,
    settings: { waitingRoom: false, recordingEnabled: true, maxParticipants: 50 }
  });

  return jsonResponse({
    meetingId,
    slug,
    title,
    link: `https://needmoconsult.com/call?room=${slug}`
  });
}

// POST /api/subscription/create-checkout
async function handleCreateCheckout(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const body = await request.json();
  const { tier, interval = 'monthly' } = body;
  
  if (!STRIPE_PRICES[tier]) {
    return errorResponse('Invalid tier', 400);
  }
  
  const priceId = STRIPE_PRICES[tier][interval];
  if (!priceId) {
    return errorResponse('Invalid subscription interval', 400);
  }
  
  const session = await createStripeCheckout(
    env,
    auth.payload.sub,
    priceId,
    'https://needmoconsult.com/dashboard?subscription=success',
    'https://needmoconsult.com/pricing?subscription=cancelled'
  );
  
  return jsonResponse({ url: session.url });
}

// POST /api/subscription/webhook
async function handleSubscriptionWebhook(request, env) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  
  try {
    await handleStripeWebhook(env, body, signature);
    return jsonResponse({ received: true });
  } catch (e) {
    return errorResponse(`Webhook error: ${e.message}`, 400);
  }
}

// GET /api/subscription/portal
async function handleSubscriptionPortal(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const user = await dbGetUserById(env, auth.payload.sub);
  if (!user.stripe_customer_id) {
    return errorResponse('No active subscription', 400);
  }
  
  const session = await createStripePortal(
    env,
    user.stripe_customer_id,
    'https://needmoconsult.com/dashboard'
  );
  
  return jsonResponse({ url: session.url });
}

// POST /api/realtimekit/join
async function handleRealtimeKitJoin(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);
  
  const body = await request.json();
  const { meetingId, name } = body;
  
  if (!meetingId) {
    return errorResponse('Meeting ID required', 400);
  }
  
  const meeting = await dbGetMeetingById(env, meetingId);
  if (!meeting) {
    return errorResponse('Meeting not found', 404);
  }
  
  const participant = await env.DB.prepare(`
    SELECT role FROM meeting_participants WHERE meeting_id = ? AND user_id = ?
  `).bind(meetingId, auth.payload.sub).first();
  
  const role = participant?.role || 'participant';
  const customId = `${auth.payload.sub}-${Date.now()}`;
  
  const result = await addRealtimeKitParticipant(env, meetingId, name || auth.payload.name, role, customId);
  
  if (!result.success) {
    return errorResponse(result.errors?.[0]?.message || 'Failed to join meeting');
  }
  
  return jsonResponse({
    authToken: result.data?.token || result.data?.authToken,
    meetingId,
    role
  });
}

// ============================================
// MAIN REQUEST HANDLER
// ============================================

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  console.log(`[REQUEST] ${method} ${path}`);
  
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Health check
  if (method === 'GET' && path === '/health') {
    return jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  }

  // Serve call page
  if (method === 'GET' && path === '/call') {
    return new Response(callTestHTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (method === 'GET' && path === '/') {
    return new Response('NeedMo API Running', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // Auth routes
  if (path === '/api/auth/register' && method === 'POST') {
    return handleRegister(request, env);
  }
  if (path === '/api/auth/login' && method === 'POST') {
    return handleLogin(request, env);
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    return handleLogout(request, env);
  }
  if (path === '/api/auth/verify-email' && method === 'POST') {
    return handleVerifyEmail(request, env);
  }
  if (path === '/api/auth/reset-password' && method === 'POST') {
    return handleResetPasswordRequest(request, env);
  }
  if (path === '/api/auth/change-password' && method === 'POST') {
    return handleChangePassword(request, env);
  }
  
  // User routes
  if (path === '/api/user/me' && method === 'GET') {
    return handleGetMe(request, env);
  }
  if (path === '/api/user/me' && method === 'PUT') {
    return handleUpdateMe(request, env);
  }
  
  // Meetings routes
  if (path === '/api/meetings' && method === 'GET') {
    return handleGetMeetings(request, env);
  }
  if (path === '/api/meetings' && method === 'POST') {
    return handleCreateMeeting(request, env);
  }
  
  // Single meeting
  const meetingMatch = path.match(/^\/api\/meetings\/([^/]+)$/);
  if (meetingMatch) {
    const id = meetingMatch[1];
    if (method === 'GET') return handleGetMeeting(request, env, id);
    if (method === 'DELETE') return handleDeleteMeeting(request, env, id);
  }
  
  // Recordings
  if (path === '/api/recordings' && method === 'GET') {
    return handleGetRecordings(request, env);
  }
  if (path === '/api/recordings/upload' && method === 'POST') {
    return handleUploadRecording(request, env);
  }
  if (path === '/api/meetings/create' && method === 'POST') {
    return handleQuickCreateMeeting(request, env);
  }
  
  // Subscription routes
  if (path === '/api/subscription/create-checkout' && method === 'POST') {
    return handleCreateCheckout(request, env);
  }
  if (path === '/api/subscription/webhook' && method === 'POST') {
    return handleSubscriptionWebhook(request, env);
  }
  if (path === '/api/subscription/portal' && method === 'GET') {
    return handleSubscriptionPortal(request, env);
  }
  
  // RealtimeKit
  if (path === '/api/realtimekit/join' && method === 'POST') {
    return handleRealtimeKitJoin(request, env);
  }
  
  // WebSocket route for meeting rooms
  const wsMatch = path.match(/^\/meetings\/([^/]+)\/ws$/);
  if (wsMatch && env.MEETING_ROOM) {
    const meetingSlug = wsMatch[1];
    const id = env.MEETING_ROOM.idFromName(meetingSlug);
    const stub = env.MEETING_ROOM.get(id);
    return stub.fetch(request);
  }

  return errorResponse(`Not found: ${path}`, 404);
}

export default {
  fetch: (request, env, ctx) => handleRequest(request, env, ctx).catch(e =>
    errorResponse(`Unhandled: ${e.message}`)
  )
};

export { MeetingRoom } from './room.js';
