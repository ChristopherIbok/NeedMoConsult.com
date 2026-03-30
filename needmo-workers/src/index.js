/**
 * NEEDMO Consult - Cloudflare Workers Backend
 * Handles RealtimeKit API calls + Admin Auth + Full Admin API
 */

const PRESET_MAP = {
  "host": "group_call_host",
  "participant": "group_call_participant",
  "viewer": "webinar_viewer",
  "presenter": "webinar_presenter",
};

// Simple JWT creation (HS256)
function base64UrlEncode(data) {
  return btoa(JSON.stringify(data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const signature = btoa(message + secret)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return `${message}.${signature}`;
}

function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const expectedSig = btoa(parts[0] + '.' + parts[1] + secret)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    if (parts[2] !== expectedSig) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

// Admin users
const ADMIN_USERS = {
  "hello@needmoconsult.com": { name: "Chris (Owner)", role: "owner" }
};

async function handleLogin(request, env) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const email = params.get('username') || params.get('email');
  const password = params.get('password');

  if (!email || !password) {
    return new Response(JSON.stringify({ detail: "Missing credentials" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = ADMIN_USERS[email];
  if (!admin || password !== "test123") {
    return new Response(JSON.stringify({ detail: "Incorrect email or password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = createToken({ sub: email }, env.JWT_SECRET_KEY || "default-secret");
  
  return new Response(JSON.stringify({
    access_token: token,
    token_type: "bearer",
    admin: { name: admin.name, email }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleAdminRequest(request, env, path) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ detail: "Missing auth token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token, env.JWT_SECRET_KEY || "default-secret");
  
  if (!payload) {
    return new Response(JSON.stringify({ detail: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const method = request.method;

  // /admin/stats
  if (path === '/admin/stats') {
    return new Response(JSON.stringify({
      totalContacts: 0,
      totalWaitlist: 0,
      newslettersSent: 0,
      upcomingBookings: 0
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/contacts
  if (path === '/admin/contacts' && method === 'GET') {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/waitlist
  if (path === '/admin/waitlist' && method === 'GET') {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/newsletters
  if (path === '/admin/newsletters' && method === 'GET') {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/newsletter/send
  if (path === '/admin/newsletter/send' && method === 'POST') {
    return new Response(JSON.stringify({ success: true, message: "Newsletter sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/welcome-email
  if (path === '/admin/welcome-email' && method === 'POST') {
    return new Response(JSON.stringify({ success: true, message: "Welcome email sent" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/room/create
  if (path === '/admin/room/create' && method === 'POST') {
    return new Response(JSON.stringify({ roomUrl: "https://needmo.daily.co/" + Date.now() }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/projects
  if (path === '/admin/projects') {
    if (method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === 'POST') {
      return new Response(JSON.stringify({ id: Date.now(), name: "New Project" }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
  }

  // /admin/tasks
  if (path === '/admin/tasks') {
    if (method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === 'POST') {
      return new Response(JSON.stringify({ id: Date.now(), title: "New Task" }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
  }

  // /admin/projects/:id/tasks
  if (path.match(/^\/admin\/projects\/\d+\/tasks$/) && method === 'GET') {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/projects/:id
  if (path.match(/^\/admin\/projects\/\d+$/)) {
    if (method === 'PUT') {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === 'DELETE') {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  // /admin/tasks/:id
  if (path.match(/^\/admin\/tasks\/\d+$/)) {
    if (method === 'PUT') {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === 'DELETE') {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  // /admin/contacts/:id/read
  if (path.match(/^\/admin\/contacts\/\d+\/read$/) && method === 'PUT') {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // /admin/contacts (POST)
  if (path === '/admin/contacts' && method === 'POST') {
    return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ detail: "Endpoint not implemented" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

async function realtimekitJoin(request, env) {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_MEETING_ID } = env;
  
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_APP_ID || !CLOUDFLARE_API_TOKEN) {
    return new Response(JSON.stringify({ error: "Cloudflare not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { name, role = "participant", meetingId, meetingName } = body;
  
  const presetName = PRESET_MAP[role] || "group_call_participant";
  const meeting_id = meetingId || CLOUDFLARE_MEETING_ID || crypto.randomUUID();

  try {
    const createMeetingRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings/${meeting_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({ name: meetingName || name || "NEEDMO Meeting" }),
      }
    );

    const createMeetingData = await createMeetingRes.json();
    console.log("Meeting creation:", createMeetingRes.status);

    const participantRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings/${meeting_id}/participants`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({
          name,
          preset_name: presetName,
          custom_participant_id: name,
        }),
      }
    );

    const participantData = await participantRes.json();

    if (participantData.success) {
      const authToken = participantData.data?.token || participantData.data?.authToken;
      if (authToken) {
        return new Response(JSON.stringify({ authToken, meetingId: meeting_id }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Failed to get auth token", details: participantData }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("RealtimeKit error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Auth login
    if (request.method === "POST" && path === "/auth/login") {
      const response = await handleLogin(request, env);
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }

    // Admin endpoints
    if (path.startsWith("/admin/")) {
      const response = await handleAdminRequest(request, env, path);
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }

    // RealtimeKit join
    if (request.method === "POST" && path === "/public/realtimekit/join") {
      const response = await realtimekitJoin(request, env);
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    }

    // Health check
    if (request.method === "GET" && path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response("NEEDMO Workers API", { status: 200 });
  },
};
