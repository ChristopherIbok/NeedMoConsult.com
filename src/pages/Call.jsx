import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { AlertCircle } from "lucide-react";
import MeetingUI from "./CallMeeting";
import PreJoinScreen from "./CallPreJoin";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

export default function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "participant";
  const meetingTime = searchParams.get("time") || null;

  const [authToken, setAuthToken] = useState(null);
  const [joinData, setJoinData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [client, initClient] = useRealtimeKitClient();
  const isHost = role === "host";

  const handleJoin = async ({ name, email, meetingName }) => {
    if (!CLOUDFLARE_MEETING_ID) return;
    setLoading(true);
    setError(null);
    try {
      const data = await request("/public/realtimekit/join", {
        method: "POST",
        body: JSON.stringify({
          name,
          meetingId: CLOUDFLARE_MEETING_ID,
          role,
          meetingName: meetingName || undefined,
          email: email?.toLowerCase(),
        }),
      });
      setJoinData({ name, meetingName });
      setAuthToken(data.authToken);
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join meeting. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken) return;
    initClient({
      authToken,
      defaults: {
        video: true,
        audio: true,
        mediaConfiguration: {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
        recording: {
          videoConfig: { width: 1920, height: 1080 },
          fileNamePrefix: "consultation-{date}",
        },
      },
    })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Init client error:", err);
        setError("Failed to connect. Please refresh and try again.");
        setLoading(false);
      });
  }, [authToken, initClient]);

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

  if (authToken && client) {
    return (
      <RealtimeKitProvider value={client}>
        <MeetingUI
          isHost={isHost}
          meetingTime={meetingTime}
          meetingName={joinData?.meetingName}
          meetingId={CLOUDFLARE_MEETING_ID}
        />
      </RealtimeKitProvider>
    );
  }

  return (
    <PreJoinScreen
      isHost={isHost}
      onJoin={handleJoin}
      loading={loading}
      error={error}
    />
  );
}
