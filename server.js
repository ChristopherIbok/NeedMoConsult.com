/**
 * server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight Express backend for the CallPage.
 *
 * This server acts as a secure proxy between your React frontend and the
 * Cloudflare RealtimeKit REST API, keeping your API credentials server-side.
 *
 * Endpoints:
 *   POST /api/call/join  { roomName, displayName }
 *     → Creates or retrieves a meeting for the roomName
 *     → Adds a participant and returns their authToken
 *     → Response: { authToken, meetingId, roomName }
 *
 * Required .env variables (server-side only — never exposed to the browser):
 *   CLOUDFLARE_ACCOUNT_ID      — Your Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN       — Bearer token with Realtime Admin permission
 *   CLOUDFLARE_REALTIMEKIT_APP_ID  — Your RealtimeKit App ID
 *   REALTIMEKIT_PRESET_NAME    — Preset name for participants (e.g. "group_call_host")
 *   PORT                       — Server port (default: 3001)
 *
 * Run:
 *   npm install express cors dotenv node-fetch
 *   node server.js
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

// ─── Cloudflare API config ────────────────────────────────────────────────────

const CF_ACCOUNT_ID   = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN    = process.env.CLOUDFLARE_API_TOKEN;
const RTK_APP_ID      = process.env.CLOUDFLARE_REALTIMEKIT_APP_ID;
const PRESET_NAME     = process.env.REALTIMEKIT_PRESET_NAME ?? "group_call_host";

const RTK_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/realtime/kit/${RTK_APP_ID}`;

function cfHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${CF_API_TOKEN}`,
  };
}

// ─── In-memory meeting registry (replace with DB for production) ──────────────
// Maps roomName → meetingId
const meetingRegistry = new Map();

// ─── Helper: create a new RealtimeKit meeting ─────────────────────────────────

async function createMeeting(roomName) {
  const res = await fetch(`${RTK_BASE}/meetings`, {
    method: "POST",
    headers: cfHeaders(),
    body: JSON.stringify({
      title: roomName,
      // Optional: record_on_start: false
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create meeting: ${res.status} ${body}`);
  }

  const json = await res.json();
  // Cloudflare response: { result: { id, title, ... }, success, errors, messages }
  return json.result ?? json.data ?? json;
}

// ─── Helper: add participant to a meeting → get authToken ─────────────────────

async function addParticipant(meetingId, displayName) {
  const res = await fetch(`${RTK_BASE}/meetings/${meetingId}/participants`, {
    method: "POST",
    headers: cfHeaders(),
    body: JSON.stringify({
      name: displayName,
      preset_name: PRESET_NAME,
      // Optional: custom_participant_id: crypto.randomUUID()
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to add participant: ${res.status} ${body}`);
  }

  const json = await res.json();
  const data = json.result ?? json.data ?? json;

  // authToken lives at data.token or data.auth_token depending on API version
  const authToken = data.token ?? data.auth_token ?? data.authToken;
  if (!authToken) {
    throw new Error("Cloudflare response did not include an authToken. Check your preset name.");
  }

  return { authToken, participantId: data.id };
}

// ─── POST /api/call/join ──────────────────────────────────────────────────────

app.post("/api/call/join", async (req, res) => {
  const { roomName, displayName } = req.body ?? {};

  if (!roomName || typeof roomName !== "string" || roomName.trim().length === 0) {
    return res.status(400).json({ message: "roomName is required." });
  }
  if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
    return res.status(400).json({ message: "displayName is required." });
  }

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !RTK_APP_ID) {
    console.error("[server] Missing Cloudflare env vars");
    return res.status(500).json({ message: "Server misconfiguration: missing Cloudflare credentials." });
  }

  try {
    const normalizedRoom = roomName.trim().toLowerCase().replace(/\s+/g, "-");

    // Reuse existing meeting for same roomName, or create a new one
    let meetingId = meetingRegistry.get(normalizedRoom);

    if (!meetingId) {
      console.log(`[server] Creating new meeting for room: ${normalizedRoom}`);
      const meeting = await createMeeting(normalizedRoom);
      meetingId = meeting.id;
      meetingRegistry.set(normalizedRoom, meetingId);
      console.log(`[server] Meeting created: ${meetingId}`);
    } else {
      console.log(`[server] Reusing existing meeting ${meetingId} for room: ${normalizedRoom}`);
    }

    const { authToken, participantId } = await addParticipant(meetingId, displayName.trim());
    console.log(`[server] Participant added: ${participantId} to meeting ${meetingId}`);

    return res.json({
      authToken,
      meetingId,
      roomName: normalizedRoom,
    });
  } catch (err) {
    console.error("[server] /api/call/join error:", err);
    return res.status(500).json({
      message: err.message ?? "Internal server error.",
    });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appId: RTK_APP_ID ? `${RTK_APP_ID.slice(0, 8)}…` : "NOT SET",
    accountId: CF_ACCOUNT_ID ? `${CF_ACCOUNT_ID.slice(0, 6)}…` : "NOT SET",
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "3001", 10);
app.listen(PORT, () => {
  console.log(`\n✅  RealtimeKit backend running at http://localhost:${PORT}`);
  console.log(`   App ID : ${RTK_APP_ID ?? "⚠️  NOT SET"}`);
  console.log(`   Preset : ${PRESET_NAME}\n`);
});
