import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useRealtimeKitClient, RealtimeKitProvider } from "@cloudflare/realtimekit-react";
import { joinCall } from "@/lib/api";
import PreJoinScreen from "@/components/PreJoinScreen";
import MeetingRoom from "@/components/MeetingRoom";
import WebinarRoom from "@/components/WebinarRoom";
import LivestreamRoom from "@/components/LivestreamRoom";

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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const [client, initClient] = useRealtimeKitClient();

  const isHost = role === "host";

  const handleJoin = useCallback(async ({ name, email, mode: joinMode, role: joinRole, roomName: joinRoomName, micEnabled, camEnabled }) => {
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
    } catch (err) {
      console.error("Join error:", err);
      setError(err.message || "Failed to join. Please try again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authToken) return;

    initClient({
      authToken,
      defaults: {
        video: true,
        audio: true,
      },
    })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Init client error:", err);
        setError("Failed to connect. Please refresh and try again.");
        setLoading(false);
      });
  }, [authToken, initClient]);

  const handleLeave = useCallback(() => {
    setHasJoined(false);
    setAuthToken(null);
    setMeetingData(null);
    setMode(modeParam);
    setRole(roleParam);
  }, [modeParam, roleParam]);

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

  if (hasJoined && authToken && client) {
    const renderRoom = () => {
      switch (mode) {
        case "webinar":
          return (
            <RealtimeKitProvider value={client}>
              <WebinarRoom
                client={client}
                authToken={authToken}
                role={meetingData?.userRole || role}
                onLeave={handleLeave}
                webinarName={roomName || meetingData?.roomName || ""}
              />
            </RealtimeKitProvider>
          );
        case "livestream":
          return (
            <LivestreamRoom
              client={client}
              authToken={authToken}
              role={meetingData?.userRole || role}
              onLeave={handleLeave}
              streamName={roomName || meetingData?.roomName || ""}
            />
          );
        case "conference":
        default:
          return (
            <RealtimeKitProvider value={client}>
              <MeetingRoom
                client={client}
                authToken={authToken}
                isHost={isHost}
                onLeave={handleLeave}
                meetingName={roomName || meetingData?.roomName || ""}
              />
            </RealtimeKitProvider>
          );
      }
    };

    return renderRoom();
  }

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
