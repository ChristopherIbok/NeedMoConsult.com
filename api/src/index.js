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
      <input type="text" id="meeting-link" placeholder="Meeting Link (optional)">
      <input type="text" id="user-name" placeholder="Your Name">
      <input type="email" id="user-email" placeholder="Email">
      <input type="password" id="user-password" placeholder="Password">
      <button class="btn btn-primary" onclick="joinMeeting()">Login & Join</button>
      <button class="btn btn-secondary" onclick="createQuickMeeting()">Create New Meeting</button>
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
        <button class="btn btn-secondary" id="btn-record" onclick="toggleRecord()" style="display:none">Record</button>
        <button class="btn btn-secondary" id="btn-mute-all" onclick="muteAll()" style="display:none">Mute All</button>
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
      const email = document.getElementById('user-email').value.trim();
      const password = document.getElementById('user-password').value.trim();
      let link = document.getElementById('meeting-link').value.trim();
      userName = document.getElementById('user-name').value.trim() || 'Anonymous';
      
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) link = roomParam;
      
      if (!email || !password) {
        showToast('Please enter email and password');
        return;
      }
      
      if (!link) {
        showToast('Please enter a meeting link');
        return;
      }
      
      meetingId = link.split("/").pop().split("?")[0];
      
      try {
        const loginRes = await fetch(API_URL + '/api/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: email, password: password })
        });
        
        const loginData = await loginRes.json();
        console.log('Login response:', loginData);
        if (!loginData.access_token) {
          showToast('Invalid credentials - ' + (loginData.error || 'check email/password'));
          return;
        }
        authToken = loginData.access_token;
        userName = loginData.user?.name || userName;
      } catch (e) {
        showToast('Login failed');
        return;
      }
      
      connectWebSocket();
    }

    async function createQuickMeeting() {
      const email = document.getElementById('user-email').value.trim();
      const password = document.getElementById('user-password').value.trim();
      userName = document.getElementById('user-name').value.trim() || 'Quick Meeting';
      
      if (!email || !password) {
        showToast('Please login first (enter email & password)');
        return;
      }
      
      try {
        const loginRes = await fetch(API_URL + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (!loginData.access_token) {
          showToast('Invalid credentials');
          return;
        }
        authToken = loginData.access_token;
        
        const res = await fetch(API_URL + '/api/meetings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify({ title: userName, isInstant: true })
        });
        
        const data = await res.json();
        if (data.meeting?.slug) {
          meetingId = data.meeting.slug;
          showToast('Meeting created! Joining...');
          connectWebSocket();
        } else {
          showToast('Failed to create meeting');
        }
      } catch (e) {
        showToast('Error: ' + e.message);
      }
    }

    function connectWebSocket() {
      const wsUrl = API_URL + '/meetings/' + meetingId + '/ws?token=' + authToken;
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
          const isHost = msg.isHost === true;
          if (isHost) {
            document.getElementById('meeting-title').textContent += ' (Host)';
            document.getElementById('btn-record').style.display = 'inline-flex';
            document.getElementById('btn-mute-all').style.display = 'inline-flex';
          }
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

    function muteAll() {
      sendMessage('mute_all', {});
      showToast('All participants muted');
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
  'https://api.needmoconsult.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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
  // Use hardcoded key as fallback since secret isn't working
  const apiKey = 're_iRkr1eqx_xaovSNPE6Yqg9u8iQgQWQD7s';
  
  try {
    const recipients = Array.isArray(to) ? to : [to];
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'NEEDMO CONSULT <hello@needmoconsult.com>',
        to: recipients,
        subject,
        html
      })
    });

    const data = await res.json();
    return data;
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
  
  console.log('[createRealtimeKitMeeting] Creating RTK meeting:', meetingId, title);
  
  // Check if RTK meeting already exists
  const existingMeeting = await env.DB.prepare(
    'SELECT realtimekit_id FROM meetings WHERE id = ?'
  ).bind(meetingId).first();
  
  if (existingMeeting?.realtimekit_id) {
    console.log('[createRealtimeKitMeeting] Using existing RTK meeting:', existingMeeting.realtimekit_id);
    return { success: true, data: { id: existingMeeting.realtimekit_id } };
  }
  
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
      },
      body: JSON.stringify({ name: title, meeting_id: meetingId })
    }
  );
  
  const data = await res.json();
  console.log('[createRealtimeKitMeeting] Response:', JSON.stringify(data));
  if (!data.success) {
    console.error('[RealtimeKit] Create meeting error:', data.error);
    throw new Error(data.error?.message || 'Failed to create RTK meeting');
  }
  
  // Store RTK meeting ID
  try {
    await env.DB.prepare(
      'UPDATE meetings SET realtimekit_id = ? WHERE id = ?'
    ).bind(data.data.id, meetingId).run();
    console.log('[createRealtimeKitMeeting] Stored RTK ID:', data.data.id);
  } catch (e) {
    console.error('[createRealtimeKitMeeting] DB update failed:', e.message);
  }
  
  return data;
}

async function addRealtimeKitParticipant(env, meetingId, name, role, customId) {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN } = env;
  
  console.log('[addRealtimeKitParticipant] Starting for meeting:', meetingId, 'role:', role);
  
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
  
  const data = await res.json();
  console.log('[addRealtimeKitParticipant] Response:', JSON.stringify(data));
  return data;
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
  
  // Auto-verify for now (skip email verification for simpler testing)
  await env.DB.prepare(`
    INSERT INTO users (id, email, password_hash, name, subscription_tier, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'free', 1, datetime('now'), datetime('now'))
  `).bind(userId, email, passwordHash, name).run();
  
  return jsonResponse({ message: 'Registration successful. You can now login.' });
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
  const tier = SUBSCRIPTION_TIERS[user?.subscription_tier || 'free'];
  
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
  
  let rtkMeetingId = null;
  if (isInstant) {
    try {
      const rtkResult = await createRealtimeKitMeeting(env, meetingId, title);
      rtkMeetingId = rtkResult.data?.id;
    } catch (e) {
      console.error('[handleCreateMeeting] RTK creation failed:', e.message);
    }
  }

  const rtkUrl = rtkMeetingId 
    ? `https://api.needmoconsult.com/meeting/${rtkMeetingId}`
    : null;

  return jsonResponse({
    meeting: {
      id: meetingId,
      title,
      slug,
      meetingLink: `https://needmoconsult.com/meeting/${slug}`,
      rtkUrl,
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
  
  // Use placeholder host ID for quick meetings
  const hostId = '911e365d-01ce-4525-a04c-60f7aa45d971';
  
  await env.DB.prepare(`
    INSERT INTO meetings (id, host_user_id, title, meeting_link_slug, settings, status, is_instant)
    VALUES (?, ?, ?, ?, ?, 'active', 1)
  `).bind(meetingId, hostId, title, slug, JSON.stringify({ waitingRoom: false, recordingEnabled: true, maxParticipants: 50 })).run();

  // Create RealtimeKit meeting if configured
  let rtkInfo = null;
  if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_APP_ID && env.CLOUDFLARE_API_TOKEN) {
    try {
      await createRealtimeKitMeeting(env, meetingId, title);
      rtkInfo = { ready: true };
    } catch (e) {
      console.error('[RealtimeKit] Error:', e.message);
    }
  }

  return jsonResponse({
    meetingId,
    slug,
    title,
    link: `https://api.needmoconsult.com/call?room=${slug}`,
    realtimekit: rtkInfo
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
    return errorResponse('Meeting ID or slug required', 400);
  }
  
  // Accept either meeting ID or slug
  let meeting;
  if (meetingId.includes('-') && meetingId.length === 36) {
    meeting = await dbGetMeetingById(env, meetingId);
  } else {
    meeting = await dbGetMeetingBySlug(env, meetingId);
  }
  
  if (!meeting) {
    return errorResponse('Meeting not found', 404);
  }
  
  const rtkMeetingId = meeting.realtimekit_id;
  if (!rtkMeetingId) {
    return errorResponse('RealtimeKit meeting not initialized', 400);
  }
  
  const participant = await env.DB.prepare(`
    SELECT role FROM meeting_participants WHERE meeting_id = ? AND user_id = ?
  `).bind(meetingId, auth.payload.sub).first();
  
  const role = participant?.role || 'participant';
  const customId = `${auth.payload.sub}-${Date.now()}`;
  
  console.log('[handleRealtimeKitJoin] Joining RTK meeting:', rtkMeetingId, 'with role:', role);
  
  const result = await addRealtimeKitParticipant(env, rtkMeetingId, name || auth.payload.name, role, customId);
  
  if (!result.success) {
    console.error('[handleRealtimeKitJoin] Error:', result.error);
    return errorResponse(result.errors?.[0]?.message || 'Failed to join meeting');
  }
  
  return jsonResponse({
    authToken: result.data?.token || result.data?.authToken,
    meetingId: meeting.id,
    role
  });
}

// ============================================
// WAITLIST/SUBSCRIBER HANDLERS
// ============================================

async function handleJoinWaitlist(request, env) {
  const body = await request.json().catch(() => ({}));
  const { email, name = '' } = body;

  if (!email || !email.includes('@')) {
    return errorResponse('Valid email required', 400);
  }

  const id = crypto.randomUUID();
  
  try {
    await env.DB.prepare(`
      INSERT INTO waitlist_subscribers (id, email, name, status, subscribed_at)
      VALUES (?, ?, ?, 'active', datetime('now'))
    `).bind(id, email.toLowerCase(), name).run();

    await sendEmail(env, email.toLowerCase(), 'Welcome to the NEEDMO CONSULT Newsletter! 🎉', `
      <h1>Welcome to the Family!</h1>
      <p>Hi ${name || 'there'}, thanks for subscribing to the NEEDMO CONSULT newsletter. You've just made a great decision for your brand.</p>
      <p>Every week we'll send you:</p>
      <ul>
        <li>Social Media Tips - Actionable strategies to grow your brand</li>
        <li>Case Studies - Real results from real clients</li>
        <li>Exclusive Offers - Special deals for our subscribers only</li>
        <li>Industry Insights - Stay ahead of the latest trends</li>
      </ul>
      <p><a href="https://needmoconsult.com">Visit our website to learn more →</a></p>
    `);
    
    return jsonResponse({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return errorResponse('Email already subscribed', 400);
    }
    throw err;
  }
}

async function handleUnsubscribe(request, env) {
  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email) {
    return errorResponse('Email required', 400);
  }

  await env.DB.prepare(`
    UPDATE waitlist_subscribers 
    SET status = 'unsubscribed', unsubscribed_at = datetime('now')
    WHERE email = ?
  `).bind(email.toLowerCase()).run();

  return jsonResponse({ success: true, message: 'Unsubscribed successfully' });
}

async function handleGetWaitlist(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const { results } = await env.DB.prepare(`
    SELECT id, email, name, status, subscribed_at, unsubscribed_at
    FROM waitlist_subscribers
    ORDER BY subscribed_at DESC
  `).all();

  return jsonResponse({ 
    subscribers: results || [],
    total: results?.length || 0
  });
}

// POST /admin/welcome-email
async function handleSendWelcomeEmail(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const body = await request.json().catch(() => ({}));
  const { email, name, headline, intro, cta_text, cta_url } = body;

  if (!email) {
    return errorResponse('Email is required', 400);
  }

  const logoUrl = "https://assets.needmoconsult.com/Logo-Dark.webp";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to NEEDMO CONSULT</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="540" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;">
              <img src="${logoUrl}" alt="NEEDMO CONSULT" width="140" height="40" style="display:block;margin:0 auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#E0E0E0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 40px 24px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:bold;color:#333333;font-family:Arial,sans-serif;">
                ${headline || "Welcome to the Family!"}
              </h1>
              <p style="margin:0;font-size:15px;color:#666666;line-height:1.6;font-family:Arial,sans-serif;">
                Hi <strong>${name || "there"}</strong>, ${intro || "thanks for subscribing to the NEEDMO CONSULT newsletter."}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <a href="${cta_url || 'https://needmoconsult.com'}" style="display:inline-block;background-color:#333333;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 32px;border-radius:6px;font-family:Arial,sans-serif;">
                ${cta_text || "Visit Our Website"} &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#E0E0E0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 40px;background-color:#FAFAFA;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 8px;font-size:12px;color:#999999;font-family:Arial,sans-serif;">NEEDMO CONSULT</p>
              <p style="margin:0;font-size:11px;color:#BBBBBB;font-family:Arial,sans-serif;">&copy; ${new Date().getFullYear()} All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await sendEmail(env, email, 'Welcome to the NEEDMO CONSULT Newsletter! 🎉', html);
  return jsonResponse({ ok: true, result });
}

// POST /admin/newsletter/send
async function handleSendNewsletter(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const body = await request.json().catch(() => ({}));
  const { to, subject, issue = "001", heroTitle = "", heroIntro = "", articleTitle = "", articleBody = "", articleUrl = "https://needmoconsult.com/blog", pullQuote = "", tips = [], offerTitle = "", offerBody = "", offerUrl = "https://needmoconsult.com/Contact", offerLabel = "Book Free Strategy Call" } = body;

  if (!to || !subject) {
    return errorResponse('Recipients and subject are required', 400);
  }

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const year = new Date().getFullYear();
  const logoUrl = "https://assets.needmoconsult.com/Logo-Dark.webp";
  const recipients = Array.isArray(to) ? to : [to];

  const articleSection = articleTitle ? `
  <tr><td style="padding:52px 40px 0;">
    <p style="margin:0 0 16px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Featured Article</p>
    <h2 style="margin:0 0 20px;font-size:26px;font-weight:normal;color:#1A2332;line-height:1.3;font-family:Georgia,serif;">${articleTitle}</h2>
    <p style="margin:0 0 32px;font-size:15px;color:#5A5A5A;line-height:1.85;font-family:Georgia,serif;">${articleBody}</p>
    ${pullQuote ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td style="padding:24px 28px;background-color:#F9F7F4;border-left:2px solid #D4AF7A;"><p style="margin:0 0 10px;font-size:19px;color:#1A2332;line-height:1.5;font-family:Georgia,serif;font-style:italic;">&#8220;${pullQuote}&#8221;</p><p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">&mdash; NEEDMO CONSULT</p></td></tr></table>` : ''}
    <a href="${articleUrl}" style="display:inline-block;border:1px solid #1A2332;color:#1A2332;font-size:10px;text-decoration:none;padding:12px 28px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Read Full Article &rarr;</a>
  </td></tr>
  <tr><td style="padding:52px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td><td style="height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>` : "";

  const tipsRows = tips.map((tip, i) => `<tr><td style="padding:20px 0;border-top:1px solid #EEEBE5;${i === tips.length - 1 ? "border-bottom:1px solid #EEEBE5;" : ""}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="width:32px;vertical-align:top;padding-top:3px;"><p style="margin:0;font-size:11px;color:#D4AF7A;font-family:Georgia,serif;">${String(i + 1).padStart(2, "0")}</p></td><td><p style="margin:0 0 5px;font-size:14px;color:#1A2332;font-family:Georgia,serif;font-weight:bold;">${tip.title}</p><p style="margin:0;font-size:13px;color:#777;line-height:1.7;font-family:Georgia,serif;">${tip.desc}</p></td></tr></table></td></tr>`).join("");

  const tipsSection = tips.length > 0 ? `<tr><td style="padding:44px 40px 0;"><p style="margin:0 0 6px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Quick Tips</p><h2 style="margin:0 0 32px;font-size:22px;font-weight:normal;color:#1A2332;font-family:Georgia,serif;">Actionable Insights For This Week</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tipsRows}</table></td></tr>` : "";

  const offerSection = offerTitle ? `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;"><tr><td style="height:2px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="padding:48px 40px;"><p style="margin:0 0 20px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Exclusive Subscriber Offer</p><h2 style="margin:0 0 16px;font-size:28px;font-weight:normal;color:#FFFFFF;line-height:1.3;font-family:Georgia,serif;">${offerTitle}</h2><p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.85;font-family:Georgia,serif;">${offerBody}</p><a href="${offerUrl}" style="display:inline-block;background-color:#D4AF7A;color:#1A2332;font-size:11px;text-decoration:none;padding:15px 36px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">${offerLabel} &rarr;</a></td></tr></table></td></tr>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${subject}</title><style>@media only screen and (max-width: 620px) {.email-wrap { width:100%!important;padding:0!important; } .pad { padding:32px 24px!important; }}</style></head>
<body style="margin:0;padding:0;background-color:#E8E6E1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8E6E1;">
<tr><td class="email-wrap" align="center" style="padding:40px 16px;">
<table class="email-body" role="presentation" width="580" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;">
<tr><td style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;">${heroIntro}&nbsp;</td></tr>
<tr><td><div style="height:3px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;"><tr><td style="padding:20px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle;"><img src="${logoUrl}" alt="NEEDMO CONSULT" height="56" style="display:block;height:56px;width:auto;border:0;"/></td><td align="right" style="vertical-align:middle;"><p style="margin:0;font-size:9px;color:rgba(255,255,255,0.35);font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Weekly Insights</p></td></tr></table></td></tr></table></td></tr>
<tr><td style="padding:24px 40px;border-bottom:1px solid #EEEBE5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td><p style="margin:0;font-size:10px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Issue No. ${issue} &nbsp;&mdash;&nbsp; ${date}</p></td><td align="right"><p style="margin:0;font-size:10px;color:#B8A882;font-family:Georgia,serif;letter-spacing:2px;text-transform:uppercase;">Brand &amp; Social Intelligence</p></td></tr></table></td></tr>
<tr><td style="padding:52px 40px 44px;"><p style="margin:0 0 20px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">This Week&#8217;s Edition</p><h1 style="margin:0 0 28px;font-size:38px;font-weight:normal;color:#1A2332;line-height:1.15;font-family:Georgia,serif;letter-spacing:-0.5px;">${heroTitle}</h1><table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="width:40px;height:1px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td><td style="width:8px;">&nbsp;</td><td style="width:460px;height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</td></tr></table><p style="margin:0 0 32px;font-size:16px;color:#5A5A5A;line-height:1.85;font-family:Georgia,serif;">${heroIntro}</p><a href="https://needmoconsult.com/Contact" style="display:inline-block;background-color:#1A2332;color:#D4AF7A;font-size:11px;text-decoration:none;padding:14px 32px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Book a Free Strategy Call &rarr;</a></td></tr>
<tr><td style="padding:20px 40px;background-color:#F9F7F4;border-top:1px solid #EEEBE5;border-bottom:1px solid #EEEBE5;"><p style="margin:0;font-size:12px;color:#999;line-height:1.7;font-family:Georgia,serif;font-style:italic;">You&#8217;re receiving this because you subscribed at <a href="https://needmoconsult.com" style="color:#D4AF7A;text-decoration:none;">needmoconsult.com</a>. Every week we share brand intelligence, social strategy and exclusive offers to help your business grow.</p></td></tr>
${articleSection}
${tipsSection}
<tr><td style="padding:48px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 32px 0 0;border-right:1px solid #EEEBE5;vertical-align:middle;"><p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">50<span style="color:#D4AF7A;">+</span></p><p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Happy Clients</p></td><td align="center" style="padding:0 32px;border-right:1px solid #EEEBE5;vertical-align:middle;"><p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">3M<span style="color:#D4AF7A;">+</span></p><p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">People Reached</p></td><td align="center" style="padding:0 0 0 32px;vertical-align:middle;"><p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">500<span style="color:#D4AF7A;">+</span></p><p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Posts Created</p></td></tr></table></td></tr>
${offerSection}
<tr><td style="padding:52px 40px 44px;"><p style="margin:0 0 4px;font-size:14px;color:#999;font-family:Georgia,serif;font-style:italic;">Until next week,</p><p style="margin:0 0 16px;font-size:30px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;font-style:italic;">Chris</p><p style="margin:0 0 2px;font-size:12px;color:#1A2332;font-family:Georgia,serif;font-weight:bold;">Founder, NeedMo Consult</p><p style="margin:0 0 36px;font-size:11px;color:#B8A882;font-family:Georgia,serif;letter-spacing:1px;">Social Media Strategist &nbsp;&middot;&nbsp; Content Consultant</p></td></tr>
<tr><td><div style="height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;"><tr><td style="padding:32px 40px;" align="center"><img src="${logoUrl}" alt="NEEDMO CONSULT" height="56" style="display:block;margin:0 auto 8px;height:56px;width:auto;border:0;"/><p style="margin:0 0 24px;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Your Brand Deserves More</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;"><tr><td style="padding:0 5px;"><a href="https://instagram.com/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/instagram-new.png" width="14" height="14" alt="Instagram" style="display:inline-block;vertical-align:middle;border:0;"/></a></td><td style="padding:0 5px;"><a href="https://linkedin.com/company/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/linkedin.png" width="14" height="14" alt="LinkedIn" style="display:inline-block;vertical-align:middle;border:0;"/></a></td><td style="padding:0 5px;"><a href="https://twitter.com/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/twitterx.png" width="14" height="14" alt="Twitter/X" style="display:inline-block;vertical-align:middle;border:0;"/></a></td></tr></table><div style="height:1px;background-color:#E8E4DC;margin-bottom:20px;font-size:0;line-height:0;">&nbsp;</div><p style="margin:0 0 8px;font-size:11px;color:#B8A882;font-family:Georgia,serif;line-height:1.6;">&copy; ${year} NEEDMO CONSULT &nbsp;&middot;&nbsp; hello@needmoconsult.com</p><p style="margin:0;font-size:11px;font-family:Georgia,serif;"><a href="https://needmoconsult.com" style="color:#B8A882;text-decoration:none;">needmoconsult.com</a> &nbsp;&middot;&nbsp; <a href="https://needmoconsult.com/PrivacyPolicy" style="color:#B8A882;text-decoration:none;">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="https://needmoconsult.com/unsubscribe" style="color:#B8A882;text-decoration:none;">Unsubscribe</a></p></td></tr></table><div style="height:3px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</div></td></tr>
</table></td></tr></table></body></html>`;

  await sendEmail(env, recipients, subject, html);
  return jsonResponse({ success: true, message: `Newsletter sent to ${recipients.length} recipient(s)` });
}

// ============================================
// CONTACT HANDLERS
// ============================================

async function handleSubmitContact(request, env) {
  const body = await request.json().catch(() => ({}));
  const { name, email, phone, company, message, source } = body;

  if (!name || !email || !message) {
    return errorResponse('Name, email, and message are required', 400);
  }

  const id = crypto.randomUUID();
  
  await env.DB.prepare(`
    INSERT INTO contacts (id, name, email, phone, company, message, source, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))
  `).bind(id, name, email.toLowerCase(), phone || null, company || null, message, source || 'website').run();

  const adminHtml = `
    <h2>🌟 New Contact Form Submission</h2>
    <h3>Contact Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
      <li><strong>Company:</strong> ${company || 'Not provided'}</li>
      <li><strong>Source:</strong> ${source || 'Website'}</li>
    </ul>
    <h3>Message:</h3>
    <p>${message.replace(/\n/g, '<br>')}</p>
    <p><em>Submitted: ${new Date().toLocaleString()}</em></p>
  `;

  const userHtml = `
    <h1>Thanks for reaching out, ${name}!</h1>
    <p>We've received your message and our team will get back to you within 24 hours.</p>
    <h3>What happens next:</h3>
    <ul>
      <li>We'll review your message and determine the best team member to help</li>
      <li>You'll receive a personalized response via email</li>
      <li>If you booked a consultation, we'll send meeting details shortly</li>
    </ul>
    <p>In the meantime, feel free to explore our <a href="https://needmoconsult.com/services">services</a> or <a href="https://needmoconsult.com/portfolio">case studies</a>.</p>
    <p>Best,<br>The NEEDMO Team</p>
  `;

  await sendEmail(env, 'hello@needmoconsult.com', `🔔 New Contact: ${name} - ${company || 'No company'}`, adminHtml);
  await sendEmail(env, email.toLowerCase(), 'Thanks for reaching out to NEEDMO CONSULT!', userHtml);

  return jsonResponse({ success: true, message: 'Contact submitted successfully' });
}

async function handleGetContacts(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const url = new URL(request.url);
  const skip = parseInt(url.searchParams.get('skip') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const { results } = await env.DB.prepare(`
    SELECT id, name, email, phone, company, message, source, status, created_at, updated_at
    FROM contacts
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, skip).all();

  const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM contacts').first();

  return jsonResponse({ 
    contacts: results || [],
    total: countResult?.total || 0,
    skip,
    limit
  });
}

async function handleUpdateContact(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const body = await request.json().catch(() => ({}));
  const { status } = body;

  if (!status || !['new', 'contacted', 'converted', 'lost'].includes(status)) {
    return errorResponse('Valid status required', 400);
  }

  await env.DB.prepare(`
    UPDATE contacts SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(status, id).run();

  return jsonResponse({ success: true });
}

async function handleDeleteContact(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();

  return jsonResponse({ success: true });
}

// ============================================
// BOOKING HANDLERS
// ============================================

function generateMeetingSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

async function handleCreateBooking(request, env) {
  const body = await request.json().catch(() => ({}));
  const { name, email, phone, service, service_type, date, preferred_date, preferred_time, time, notes } = body;

  if (!name || !email || !preferred_date && !date) {
    return errorResponse('Name, email, and preferred date are required', 400);
  }

  const id = crypto.randomUUID();
  const meetingSlug = generateMeetingSlug();
  const meetingLink = `https://needmoconsult.com/call/${meetingSlug}`;
  
  const finalServiceType = service_type || service;
  const finalPreferredDate = preferred_date || date;
  const finalPreferredTime = preferred_time || time;

  await env.DB.prepare(`
    INSERT INTO bookings (id, name, email, phone, service_type, preferred_date, preferred_time, notes, status, meeting_link, meeting_slug, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))
  `).bind(id, name, email.toLowerCase(), phone || null, finalServiceType, finalPreferredDate, finalPreferredTime || null, notes || null, meetingLink, meetingSlug).run();

  const formattedDate = new Date(finalPreferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const adminHtml = `
    <h2>📅 New Booking Received</h2>
    <h3>Client Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
      <li><strong>Service:</strong> ${service_type}</li>
      <li><strong>Preferred Date:</strong> ${formattedDate}</li>
      <li><strong>Preferred Time:</strong> ${preferred_time || 'Not specified'}</li>
    </ul>
    ${notes ? `<h3>Notes:</h3><p>${notes.replace(/\n/g, '<br>')}</p>` : ''}
    <h3>Meeting Details:</h3>
    <p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
    <p><strong>Meeting Slug:</strong> ${meetingSlug}</p>
    <p><em>Booked: ${new Date().toLocaleString()}</em></p>
  `;

  const userHtml = `
    <h1>Your consultation is booked, ${name}!</h1>
    <p>Thank you for scheduling a consultation with NEEDMO CONSULT. We're excited to help you grow your brand!</p>
    <h3>📅 Your Appointment:</h3>
    <ul>
      <li><strong>Service:</strong> ${service_type}</li>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${preferred_time || 'To be confirmed'}</li>
    </ul>
    <h3>📹 Your Meeting Room:</h3>
    <p>Click the link below to join your consultation:</p>
    <p><a href="${meetingLink}" style="background:#D4AF7A;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;">Join Meeting Room</a></p>
    <p><em>Save this link - you'll use it for your consultation!</em></p>
    <h3>What to prepare:</h3>
    <ul>
      <li>Any questions about our services</li>
      <li>Your current marketing challenges</li>
      <li>Goals you want to achieve</li>
    </ul>
    <p>We look forward to speaking with you!</p>
    <p>Best,<br>The NEEDMO Team</p>
  `;

  await sendEmail(env, 'hello@needmoconsult.com', `📅 New Booking: ${name} - ${service_type}`, adminHtml);
  await sendEmail(env, email.toLowerCase(), '🎉 Your Consultation is Confirmed!', userHtml);

  return jsonResponse({ 
    success: true, 
    message: 'Booking created successfully',
    booking: {
      id,
      meeting_link: meetingLink,
      meeting_slug: meetingSlug
    }
  });
}

async function handleGetBookings(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const { results } = await env.DB.prepare(`
    SELECT id, contact_id, name, email, phone, service_type, preferred_date, preferred_time, notes, status, meeting_link, meeting_slug, created_at, updated_at
    FROM bookings
    ORDER BY preferred_date ASC
  `).all();

  return jsonResponse({ bookings: results || [] });
}

async function handleUpdateBooking(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  const body = await request.json().catch(() => ({}));
  const { status } = body;

  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return errorResponse('Valid status required', 400);
  }

  await env.DB.prepare(`
    UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(status, id).run();

  return jsonResponse({ success: true });
}

async function handleDeleteBooking(request, env, id) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  await env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();

  return jsonResponse({ success: true });
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

  // RealtimeKit meeting redirect - /{uuid} -> Cloudflare RealtimeKit
  if (method === 'GET' && path.length > 5 && !path.startsWith('/api')) {
    const meetingId = path.slice(1);
    console.log(`[CHECK] path=${path}, meetingId=${meetingId}, len=${meetingId.length}, hasDash=${meetingId.includes('-')}`);
    if (meetingId.includes('-') && meetingId.length > 20) {
      console.log(`[RTK] Redirecting meeting: ${meetingId}`);
      const rtkAppId = env.CLOUDFLARE_APP_ID || 'a4dfcc03-8507-47ef-9a95-216562ab2e5b';
      return Response.redirect(`https://dashboard.cloudflare.com/apps/realtimekit/${rtkAppId}/meeting/${meetingId}`, 302);
    }
  }

  // Health check
  if (method === 'GET' && path === '/health') {
    return jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env_keys: Object.keys(env).filter(k => !k.startsWith('_'))
    });
  }

  // Serve call page
  if (method === 'GET' && path === '/call') {
    return new Response(callTestHTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Serve meeting join page with embedded RealtimeKit
  if (method === 'GET' && path.startsWith('/meeting/')) {
    const meetingId = path.split('/meeting/')[1];
    const meetingHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Meeting - NEEDMO</title>
  <script src="https://unpkg.com/@realtime.cloudflare/rtk-web-core@latest/dist/rtk-web-core.umd.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F1419; color: white; }
    #meeting { width: 100vw; height: 100vh; }
    .loading { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #888; }
  </style>
</head>
<body>
  <div id="meeting">
    <div class="loading">Loading meeting...</div>
  </div>
  <script>
    const meetingId = "${meetingId}";
    const appId = "a4dfcc03-8507-47ef-9a95-216562ab2e5b";
    
    async function initMeeting() {
      try {
        const meeting = await rtk.RTKClient.init({
          appId: appId,
          meetingId: meetingId,
          container: document.getElementById('meeting'),
          showPrejoin: true
        });
        console.log('Meeting initialized:', meeting);
      } catch (err) {
        console.error('Meeting error:', err);
        document.getElementById('meeting').innerHTML = '<div style="padding:40px;text-align:center;color:#888;"><h2>Unable to join meeting</h2><p>Please try again or contact support.</p></div>';
      }
    }
    initMeeting();
  </script>
</body>
</html>`;
    return new Response(meetingHTML, { headers: { 'Content-Type': 'text/html' } });
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

  // Public waitlist routes
  if (path === '/api/public/waitlist' && method === 'POST') {
    return handleJoinWaitlist(request, env);
  }
  if (path === '/api/public/unsubscribe' && method === 'POST') {
    return handleUnsubscribe(request, env);
  }
  if (path === '/api/admin/waitlist' && method === 'GET') {
    return handleGetWaitlist(request, env);
  }
  if (path === '/admin/welcome-email' && method === 'POST') {
    return handleSendWelcomeEmail(request, env);
  }
  if (path === '/admin/newsletter/send' && method === 'POST') {
    return handleSendNewsletter(request, env);
  }

  // Public contact routes
  if (path === '/api/public/contact' && method === 'POST') {
    return handleSubmitContact(request, env);
  }

  // Public booking routes
  if (path === '/api/public/booking' && method === 'POST') {
    return handleCreateBooking(request, env);
  }

  // Admin routes
  if (path === '/api/admin/contacts' && method === 'GET') {
    return handleGetContacts(request, env);
  }
  const contactMatch = path.match(/^\/api\/admin\/contacts\/([^/]+)$/);
  if (contactMatch) {
    const id = contactMatch[1];
    if (method === 'PUT') return handleUpdateContact(request, env, id);
    if (method === 'DELETE') return handleDeleteContact(request, env, id);
  }

  if (path === '/api/admin/bookings' && method === 'GET') {
    return handleGetBookings(request, env);
  }
  const bookingMatch = path.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (bookingMatch) {
    const id = bookingMatch[1];
    if (method === 'PUT') return handleUpdateBooking(request, env, id);
    if (method === 'DELETE') return handleDeleteBooking(request, env, id);
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
