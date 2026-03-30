/**
 * NEEDMO API - Cloudflare Workers
 * Fresh implementation with proper error handling
 */

const ALLOWED_ORIGINS = "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function errorResponse(message, status = 500) {
  console.error(`[ERROR] ${status}: ${message}`);
  return jsonResponse({ error: message }, status);
}

// Simple JWT functions
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
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

// Admin users - UPDATE THESE
const ADMIN_USERS = {
  "hello@needmoconsult.com": { name: "Chris", password: "test123", role: "owner" },
};

async function handleAuthLogin(request, env) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const email = params.get('username') || params.get('email');
    const password = params.get('password');

    console.log(`[AUTH] Login attempt: ${email}`);

    if (!email || !password) {
      return errorResponse("Missing email or password", 400);
    }

    const admin = ADMIN_USERS[email];
    if (!admin || admin.password !== password) {
      return errorResponse("Invalid credentials", 401);
    }

    const token = createToken({ sub: email }, env.JWT_SECRET_KEY || "secret");
    console.log(`[AUTH] Login success: ${email}`);

    return jsonResponse({
      access_token: token,
      token_type: "bearer",
      admin: { name: admin.name, email }
    });
  } catch (e) {
    return errorResponse(`Login error: ${e.message}`);
  }
}

function requireAuth(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing auth token", status: 401 };
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token, env.JWT_SECRET_KEY || "secret");
  if (!payload) {
    return { error: "Invalid token", status: 401 };
  }
  return { payload };
}

async function handleAdminStats(request, env) {
  const auth = requireAuth(request, env);
  if (auth.error) return errorResponse(auth.error, auth.status);

  return jsonResponse({
    totalContacts: 0,
    totalWaitlist: 0,
    newslettersSent: 0,
    upcomingBookings: 0
  });
}

async function handleRealtimekitJoin(request, env) {
  try {
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_MEETING_ID } = env;

    console.log(`[REALTIMEKIT] Join request`);
    console.log(`[REALTIMEKIT] Account ID: ${CLOUDFLARE_ACCOUNT_ID ? 'set' : 'MISSING'}`);
    console.log(`[REALTIMEKIT] App ID: ${CLOUDFLARE_APP_ID ? 'set' : 'MISSING'}`);
    console.log(`[REALTIMEKIT] Token: ${CLOUDFLARE_API_TOKEN ? 'set' : 'MISSING'}`);

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_APP_ID || !CLOUDFLARE_API_TOKEN) {
      return errorResponse("Cloudflare not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, CLOUDFLARE_API_TOKEN in wrangler secrets", 500);
    }

    const body = await request.json();
    const { name, role = "participant", meetingId } = body;

    console.log(`[REALTIMEKIT] Name: ${name}, Role: ${role}, MeetingId: ${meetingId}`);

    const presetMap = {
      "host": "group_call_host",
      "participant": "group_call_participant",
      "viewer": "webinar_viewer",
      "presenter": "webinar_presenter",
    };

    const presetName = presetMap[role] || "group_call_participant";
    const meeting_id = meetingId || CLOUDFLARE_MEETING_ID;

    if (!meeting_id) {
      return errorResponse("No meeting ID provided", 400);
    }

    // Create or get meeting
    console.log(`[REALTIMEKIT] Creating meeting: ${meeting_id}`);
    const meetingRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${CLOUDFLARE_APP_ID}/meetings/${meeting_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: JSON.stringify({ name: name || "NEEDMO Meeting" }),
      }
    );

    const meetingData = await meetingRes.json();
    console.log(`[REALTIMEKIT] Meeting response: ${meetingRes.status}`);

    if (!meetingData.success) {
      console.error(`[REALTIMEKIT] Meeting error:`, meetingData);
    }

    // Add participant
    console.log(`[REALTIMEKIT] Adding participant: ${name}`);
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
    console.log(`[REALTIMEKIT] Participant response: ${participantRes.status}`);

    if (!participantData.success) {
      console.error(`[REALTIMEKIT] Participant error:`, participantData);
      return errorResponse(`Failed to join: ${participantData.errors?.[0]?.message || 'Unknown error'}`);
    }

    const authToken = participantData.data?.token || participantData.data?.authToken;
    if (!authToken) {
      return errorResponse("No auth token in response");
    }

    console.log(`[REALTIMEKIT] Success! Auth token received`);
    return jsonResponse({ authToken, meetingId: meeting_id });

  } catch (e) {
    console.error(`[REALTIMEKIT] Exception:`, e);
    return errorResponse(`Error: ${e.message}`);
  }
}

// Route handler
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  console.log(`[REQUEST] ${method} ${path}`);

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (method === "GET" && path === "/health") {
    return jsonResponse({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: {
        hasAccountId: !!env.CLOUDFLARE_ACCOUNT_ID,
        hasAppId: !!env.CLOUDFLARE_APP_ID,
        hasApiToken: !!env.CLOUDFLARE_API_TOKEN,
        hasMeetingId: !!env.CLOUDFLARE_MEETING_ID,
      }
    });
  }

  // Auth login
  if (method === "POST" && path === "/auth/login") {
    return handleAuthLogin(request, env);
  }

  // Admin stats
  if (method === "GET" && path === "/admin/stats") {
    return handleAdminStats(request, env);
  }

  // RealtimeKit join
  if (method === "POST" && path === "/realtimekit/join") {
    return handleRealtimekitJoin(request, env);
  }

  // 404
  return errorResponse(`Not found: ${path}`, 404);
}

export default {
  fetch: (request, env, ctx) => handleRequest(request, env, ctx).catch(e => 
    errorResponse(`Unhandled: ${e.message}`)
  ),
};
