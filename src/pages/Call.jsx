import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import { VideoSettingsModal } from "@/components/ui/VideoSettingsModal";
import {
  Clock,
  Users,
  Video,
  Circle,
  Shield,
  ChevronUp,
  Info,
  Lock,
  Wifi,
  X,
} from "lucide-react";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

/* ─────────────────────────────────────────────
   TOP BAR  – meeting name, elapsed time, security
───────────────────────────────────────────── */
function TopBar({ meetingTime, meetingName, isRecording, participantCount }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!meetingTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(meetingTime)) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        h > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [meetingTime]);

  return (
    <div className="zoom-topbar">
      {/* Left – meeting info */}
      <div className="zoom-topbar-left">
        <span className="zoom-meeting-name">{meetingName || "Strategy Call"}</span>
        {elapsed && (
          <span className="zoom-chip">
            <Clock size={12} />
            {elapsed}
          </span>
        )}
        {isRecording && (
          <span className="zoom-chip zoom-chip--rec">
            <span className="zoom-rec-dot" />
            REC
          </span>
        )}
      </div>

      {/* Right – status badges */}
      <div className="zoom-topbar-right">
        {participantCount > 0 && (
          <span className="zoom-chip">
            <Users size={12} />
            {participantCount}
          </span>
        )}
        <span className="zoom-chip zoom-chip--secure">
          <Lock size={12} />
          Encrypted
        </span>
        <span className="zoom-chip">
          <Wifi size={12} />
          HD
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOTTOM TOOLBAR  – grouped controls like Zoom
───────────────────────────────────────────── */
function ToolbarButton({ icon, label, onClick, active, danger, chevron, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "zoom-btn",
        active ? "zoom-btn--active" : "",
        danger ? "zoom-btn--danger" : "",
        disabled ? "zoom-btn--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="zoom-btn-icon">{icon}</span>
      <span className="zoom-btn-label">{label}</span>
      {chevron && (
        <span className="zoom-btn-chevron">
          <ChevronUp size={10} />
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   FULL MEETING UI
───────────────────────────────────────────── */
function MeetingUI({ isHost, meetingTime, meetingName, meetingId }) {
  const { meeting } = useRealtimeKitMeeting();
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoEffect, setVideoEffect] = useState("none");
  const videoBgRef = useRef(null);
  const currentMiddlewareRef = useRef(null);
  const menuRef = useRef(null);

  /* Close menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Recording state poll */
  useEffect(() => {
    if (!meeting?.recording) return;
    const id = setInterval(() => {
      setIsRecording(meeting.recording.recordingState === "RECORDING");
    }, 1000);
    return () => clearInterval(id);
  }, [meeting]);

  /* Participant count */
  useEffect(() => {
    if (!meeting?.participants) return;
    const update = () =>
      setParticipantCount(meeting.participants.joined?.size ?? 0);
    update();
    meeting.participants.joined?.on?.("participantJoined", update);
    meeting.participants.joined?.on?.("participantLeft", update);
    return () => {
      meeting.participants.joined?.off?.("participantJoined", update);
      meeting.participants.joined?.off?.("participantLeft", update);
    };
  }, [meeting]);

  /* Virtual background init */
  useEffect(() => {
    if (!meeting) return;
    (async () => {
      try {
        await meeting.self.setVideoMiddlewareGlobalConfig({
          disablePerFrameCanvasRendering: true,
        });
        videoBgRef.current = await RealtimeKitVideoBackgroundTransformer.init({
          meeting,
          segmentationConfig: { pipeline: "webgl2" },
        });
      } catch (err) {
        console.error("VBG init failed:", err);
      }
    })();
  }, [meeting]);

  const applyVideoEffect = async (effect, value = null) => {
    if (!meeting || !videoBgRef.current) return;
    try {
      if (currentMiddlewareRef.current) {
        meeting.self.removeVideoMiddleware(currentMiddlewareRef.current);
        currentMiddlewareRef.current = null;
      }
      if (effect === "blur") {
        const mw = await videoBgRef.current.createBackgroundBlurVideoMiddleware(value || 20);
        meeting.self.addVideoMiddleware(mw);
        currentMiddlewareRef.current = mw;
      } else if (effect === "image" && value) {
        const mw = await videoBgRef.current.createStaticBackgroundVideoMiddleware(value);
        meeting.self.addVideoMiddleware(mw);
        currentMiddlewareRef.current = mw;
      }
      setVideoEffect(effect === "none" ? "none" : effect);
    } catch (err) {
      console.error("Effect error:", err);
    }
  };

  const startRecording = async () => {
    if (!meetingId) return;
    try {
      await request("/public/realtimekit/start-recording", {
        method: "POST",
        body: JSON.stringify({ meeting_id: meetingId }),
      });
      alert("Recording started!");
    } catch (err) {
      alert("Failed to start recording: " + (err.message || "Unknown error"));
    }
  };

  const stopRecording = async () => {
    if (!meeting?.recording) return;
    try { await meeting.recording.stop(); } catch (err) { console.error(err); }
  };

  if (!meeting) return null;

  return (
    <>
      <style>{meetingStyles}</style>
      <div className="zoom-shell">
        {/* ── Top bar ── */}
        <TopBar
          meetingTime={meetingTime}
          meetingName={meetingName}
          isRecording={isRecording}
          participantCount={participantCount}
        />

        {/* ── Video canvas ── */}
        <div className="zoom-canvas">
          <RtkMeeting mode="fill" meeting={meeting} showSetupScreen={true} />
        </div>

        {/* ── Bottom toolbar ── */}
        <div className="zoom-toolbar">
          {/* Group: A/V controls */}
          <div className="zoom-toolbar-group">
            <ToolbarButton icon={<Video size={20} />} label="Video" chevron active />
          </div>

          {/* Group: Participants / Info */}
          <div className="zoom-toolbar-group">
            <ToolbarButton
              icon={<Users size={20} />}
              label={`Participants${participantCount ? ` (${participantCount})` : ""}`}
            />
            <ToolbarButton icon={<Info size={20} />} label="Meeting Info" />
          </div>

          {/* Group: Host tools */}
          {isHost && (
            <div className="zoom-toolbar-group" ref={menuRef}>
              <ToolbarButton
                icon={<Circle size={20} />}
                label={isRecording ? "Stop Rec" : "Record"}
                active={isRecording}
                danger={isRecording}
                onClick={isRecording ? stopRecording : startRecording}
              />
              <ToolbarButton
                icon={<Shield size={20} />}
                label="Security"
                onClick={() => setSettingsOpen(true)}
              />
            </div>
          )}

          {/* Group: End call */}
          <div className="zoom-toolbar-group zoom-toolbar-group--end">
            <button className="zoom-end-btn">End</button>
          </div>
        </div>

        {/* ── Video Settings Modal ── */}
        <VideoSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          videoBgRef={videoBgRef}
          meeting={meeting}
          currentEffect={currentMiddlewareRef}
          onEffectChange={setVideoEffect}
        />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   JOIN / LOBBY SCREEN
───────────────────────────────────────────── */
export default function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "participant";
  const meetingTime = searchParams.get("time") || null;
  const isHost = role === "host";

  const [authToken, setAuthToken] = useState(null);
  const [name, setName] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [client, initClient] = useRealtimeKitClient();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !CLOUDFLARE_MEETING_ID) return;
    if (!isHost && !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await request("/public/realtimekit/join", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          meetingId: CLOUDFLARE_MEETING_ID,
          role,
          meetingName: meetingName.trim() || undefined,
          email: email.trim().toLowerCase(),
        }),
      });
      setAuthToken(data.authToken);
    } catch (err) {
      setError("Failed to join meeting. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken) return;
    initClient({
      authToken,
      defaults: {
        recording: {
          videoConfig: { width: 1920, height: 1080 },
          fileNamePrefix: "consultation-{date}",
        },
      },
    })
      .then(() => setLoading(false))
      .catch(() => {
        setError("Failed to connect. Please refresh and try again.");
        setLoading(false);
      });
  }, [authToken, initClient]);

  if (!CLOUDFLARE_MEETING_ID) {
    return (
      <>
        <style>{lobbyStyles}</style>
        <main className="zoom-lobby">
          <div className="zoom-lobby-card">
            <div className="zoom-lobby-icon zoom-lobby-icon--error">
              <X size={28} />
            </div>
            <h1 className="zoom-lobby-title">Configuration Error</h1>
            <p className="zoom-lobby-sub">
              Set <code>VITE_CLOUDFLARE_MEETING_ID</code> in your environment to continue.
            </p>
            <button onClick={() => navigate("/")} className="zoom-lobby-btn zoom-lobby-btn--primary">
              Go Home
            </button>
          </div>
        </main>
      </>
    );
  }

  if (authToken && client) {
    return (
      <RealtimeKitProvider value={client}>
        <MeetingUI
          isHost={isHost}
          meetingTime={meetingTime}
          meetingName={meetingName}
          meetingId={CLOUDFLARE_MEETING_ID}
        />
      </RealtimeKitProvider>
    );
  }

  return (
    <>
      <style>{lobbyStyles}</style>
      <main className="zoom-lobby">
        {/* ── Card ── */}
        <div className="zoom-lobby-card">
          {/* Header */}
          <div className="zoom-lobby-header">
            <div className="zoom-lobby-icon">
              <Video size={26} />
            </div>
            <h1 className="zoom-lobby-title">
              {isHost ? "Start Meeting" : "Join Meeting"}
            </h1>
            <p className="zoom-lobby-sub">
              {isHost
                ? "You have host privileges for this session"
                : "Enter your details to join the call"}
            </p>
          </div>

          {/* Role badge */}
          <div className="zoom-lobby-badge">
            <Shield size={13} />
            {isHost ? "Host" : "Participant"}
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="zoom-lobby-form">
            {/* Host: optional meeting name */}
            {isHost && (
              <div className="zoom-field-group">
                <label className="zoom-field-label">Meeting name</label>
                <input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="e.g. Q2 Strategy Review"
                  className="zoom-field-input"
                />
              </div>
            )}

            {/* Participant: email */}
            {!isHost && (
              <div className="zoom-field-group">
                <label className="zoom-field-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="zoom-field-input"
                  autoFocus
                  required
                />
              </div>
            )}

            {/* Display name */}
            <div className="zoom-field-group">
              <label className="zoom-field-label">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name"
                className="zoom-field-input"
                autoFocus={isHost}
                required
              />
            </div>

            {error && <p className="zoom-field-error">{error}</p>}

            {/* Actions */}
            <div className="zoom-lobby-actions">
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="zoom-lobby-btn zoom-lobby-btn--primary"
              >
                {loading
                  ? "Connecting…"
                  : isHost
                  ? "Start Meeting"
                  : "Join Meeting"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="zoom-lobby-btn zoom-lobby-btn--ghost"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Footer info */}
          <div className="zoom-lobby-footer">
            <Lock size={12} />
            End-to-end encrypted · HD video
          </div>
        </div>
      </main>
    </>
  );
}

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const meetingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .zoom-shell {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background: #1c1c1c;
    overflow: hidden;
  }

  /* ── Top bar ── */
  .zoom-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 48px;
    background: #1c1c1c;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    z-index: 20;
    flex-shrink: 0;
  }
  .zoom-topbar-left,
  .zoom-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .zoom-meeting-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin-right: 4px;
  }
  .zoom-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.65);
    font-size: 11.5px;
    font-weight: 500;
  }
  .zoom-chip--secure { color: #4ade80; background: rgba(74,222,128,0.1); }
  .zoom-chip--rec { color: #f87171; background: rgba(248,113,113,0.12); }
  .zoom-rec-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #f87171;
    animation: recBlink 1s ease-in-out infinite;
  }
  @keyframes recBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Canvas ── */
  .zoom-canvas {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* ── Toolbar ── */
  .zoom-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 20px;
    height: 72px;
    background: #242424;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
    z-index: 20;
  }
  .zoom-toolbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 8px;
    border-right: 1px solid rgba(255,255,255,0.08);
  }
  .zoom-toolbar-group:first-child { padding-left: 0; }
  .zoom-toolbar-group:last-child { border-right: none; }
  .zoom-toolbar-group--end {
    margin-left: auto;
    border-right: none;
    padding-right: 0;
  }

  /* Toolbar buttons */
  .zoom-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    min-width: 72px;
    outline: none;
  }
  .zoom-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .zoom-btn--active { color: #fff; }
  .zoom-btn--danger  { color: #f87171; }
  .zoom-btn--danger:hover { background: rgba(248,113,113,0.1); }
  .zoom-btn--disabled { opacity: 0.35; cursor: not-allowed; }
  .zoom-btn-icon { display: flex; align-items: center; justify-content: center; }
  .zoom-btn-label { font-size: 11px; font-weight: 500; white-space: nowrap; line-height: 1; }
  .zoom-btn-chevron {
    position: absolute;
    top: 6px; right: 6px;
    color: rgba(255,255,255,0.35);
  }

  /* End button */
  .zoom-end-btn {
    padding: 9px 22px;
    border-radius: 8px;
    border: none;
    background: #e8382b;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .zoom-end-btn:hover { background: #c9271b; transform: scale(1.02); }
  .zoom-end-btn:active { transform: scale(0.98); }
`;

const lobbyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .zoom-lobby {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #111;
  }

  /* ── Card ── */
  .zoom-lobby-card {
    width: 100%;
    max-width: 420px;
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 36px 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 0;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  }

  /* ── Header ── */
  .zoom-lobby-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 20px;
  }
  .zoom-lobby-icon {
    width: 60px; height: 60px;
    border-radius: 16px;
    background: #0b5cff;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    margin-bottom: 16px;
  }
  .zoom-lobby-icon--error { background: #c9271b; }
  .zoom-lobby-title {
    font-size: 21px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
  }
  .zoom-lobby-sub {
    font-size: 13.5px;
    color: rgba(255,255,255,0.45);
    margin: 0;
    line-height: 1.5;
  }

  /* ── Role badge ── */
  .zoom-lobby-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: center;
    padding: 4px 14px;
    border-radius: 999px;
    background: rgba(11,92,255,0.12);
    color: #6ea8fe;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    margin-bottom: 24px;
  }

  /* ── Form ── */
  .zoom-lobby-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .zoom-field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .zoom-field-label {
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .zoom-field-input {
    width: 100%;
    background: #2a2a2a;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .zoom-field-input::placeholder { color: rgba(255,255,255,0.25); }
  .zoom-field-input:focus { border-color: #0b5cff; }
  .zoom-field-error {
    font-size: 13px;
    color: #f87171;
    text-align: center;
    margin: -4px 0;
  }

  /* ── Actions ── */
  .zoom-lobby-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .zoom-lobby-btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s, transform 0.1s;
    outline: none;
  }
  .zoom-lobby-btn:active { transform: scale(0.99); }
  .zoom-lobby-btn--primary {
    background: #0b5cff;
    color: #fff;
  }
  .zoom-lobby-btn--primary:hover:not(:disabled) { background: #0a50e0; }
  .zoom-lobby-btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .zoom-lobby-btn--ghost {
    background: transparent;
    color: rgba(255,255,255,0.45);
  }
  .zoom-lobby-btn--ghost:hover { color: rgba(255,255,255,0.75); }

  /* ── Footer ── */
  .zoom-lobby-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 20px;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
  }
`;