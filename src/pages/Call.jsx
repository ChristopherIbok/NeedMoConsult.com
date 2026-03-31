import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { joinCall } from "@/lib/api";
import PreJoinScreen from "@/components/PreJoinScreen";
import MeetingRoom from "@/components/MeetingRoom";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modeParam = searchParams.get("mode") || "conference";
  const roleParam = searchParams.get("role") || "participant";
  const roomParam = searchParams.get("room") || "";

  const [mode, setMode] = useState(modeParam);
  const [role, setRole] = useState(roleParam);
  const [roomName, setRoomName] = useState(roomParam);

  const [authToken, setAuthToken] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [meetingClient, setMeetingClient] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const [, initClient] = useRealtimeKitClient();

  const isHost = role === "host";

  const handleJoin = useCallback(
    async ({ name, email, mode: joinMode, role: joinRole, roomName: joinRoomName }) => {
      if (!CLOUDFLARE_MEETING_ID) {
        setError("Meeting ID not configured");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await joinCall({
          name,
          email,
          mode: joinMode,
          role: joinRole,
          roomName: joinRoomName || undefined,
        });

        setMeetingData({
          ...data,
          userName: name,
          userRole: joinRole,
          mode: joinMode,
        });

        setMode(joinMode);
        setRole(joinRole);
        setRoomName(joinRoomName || "");
        setAuthToken(data.authToken);
        setHasJoined(true);

        initClient({
          authToken: data.authToken,
          defaults: { video: true, audio: true },
        })
          .then((returnedClient) => {
            console.log("returnedClient:", returnedClient);
            console.log("type:", typeof returnedClient);
            setMeetingClient(returnedClient);
          })
          .catch((clientErr) => {
            console.error("initClient error:", clientErr);
            setError("Failed to initialize the meeting client. Please try again.");
            setHasJoined(false);
            setAuthToken(null);
          });
      } catch (err) {
        console.error("Join error:", err);
        setError(err.message || "Failed to join. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [initClient]
  );

  const handleLeave = useCallback(() => {
    setHasJoined(false);
    setAuthToken(null);
    setMeetingData(null);
    setMeetingClient(null);
    setMode(modeParam);
    setRole(roleParam);
  }, [modeParam, roleParam]);

  // ── Config guard ──────────────────────────────────────────────────────────
  if (!CLOUDFLARE_MEETING_ID) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#1A2332] rounded-2xl p-8 max-w-md w-full text-center border border-white/5 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-white font-bold text-lg mb-2">Configuration Error</h1>
          <p className="text-white/40 text-sm mb-6">
            <code className="text-[#D4AF7A] bg-[#D4AF7A]/10 px-1 py-0.5 rounded text-xs">
              VITE_CLOUDFLARE_MEETING_ID
            </code>{" "}
            is not set in your environment.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-semibold py-3 rounded-xl transition-colors"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  // ── Loading bridge: joined but client not ready yet ───────────────────────
  if (hasJoined && authToken && !meetingClient) {
    return (
      <main className="min-h-screen bg-[#0A0F1A] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#D4AF7A] animate-spin" />
        <p className="text-white/40 text-sm">Connecting to meeting…</p>
      </main>
    );
  }

  // ── Active meeting ────────────────────────────────────────────────────────
  if (hasJoined && authToken && meetingClient) {
    return (
      <MeetingRoom
        meetingClient={meetingClient}
        isHost={isHost}
        onLeave={handleLeave}
        meetingName={meetingData?.roomName || roomName || "Video Conference"}
        roomName={roomName}
      />
    );
  }

  // ── Pre-join screen ───────────────────────────────────────────────────────
  return (
    <PreJoinScreen
      mode={mode}
      role={role}
      isHost={isHost}
      onJoin={handleJoin}
      loading={loading}
      error={error}
    />
  );
}

export default Call;