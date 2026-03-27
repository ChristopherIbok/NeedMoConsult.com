import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { AlertCircle, Video, Mic, MicOff, VideoOff, Settings, Check } from "lucide-react";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

function PreJoinScreen({ isHost, onJoin, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isHost && !email.trim()) return;
    onJoin({ name: name.trim(), email: email.trim(), meetingName: meetingName.trim() });
  };

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#D4AF7A 1px, transparent 1px), linear-gradient(90deg, #D4AF7A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 w-full max-w-4xl items-center">
        <div className="flex-1 w-full max-w-lg">
          <div className="relative aspect-video bg-[#1A2332] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/10 flex items-center justify-center">
                <VideoOff className="w-7 h-7 text-[#D4AF7A]/60" />
              </div>
              <span className="text-white/40 text-sm">Camera preview</span>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMicOn((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${micOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setCamOn((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${camOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
              >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button type="button" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-[#D4AF7A]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                {isHost ? "Start Meeting" : "Join Meeting"}
              </h1>
              <p className="text-white/40 text-xs mt-0.5">
                {isHost ? "You are the host" : "Enter your details to join"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isHost && (
              <div>
                <label className="text-white/50 text-xs font-medium mb-1.5 block">Meeting Name</label>
                <input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="e.g. Strategy Call Q2"
                  className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm outline-none focus:border-[#D4AF7A]/60
                             placeholder:text-white/20 transition-colors"
                />
              </div>
            )}

            {!isHost && (
              <div>
                <label className="text-white/50 text-xs font-medium mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm outline-none focus:border-[#D4AF7A]/60
                             placeholder:text-white/20 transition-colors"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3
                           text-white text-sm outline-none focus:border-[#D4AF7A]/60
                           placeholder:text-white/20 transition-colors"
                autoFocus={isHost}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || (!isHost && !email.trim()) || loading}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] disabled:opacity-40 disabled:cursor-not-allowed
                         text-[#1A2332] font-bold py-3.5 rounded-xl transition-all duration-150
                         text-sm shadow-lg shadow-[#D4AF7A]/20 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1A2332]/30 border-t-[#1A2332] rounded-full animate-spin" />
                  Connecting…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {isHost ? "Start Meeting" : "Join Meeting"}
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/5">
            <div className={`flex items-center gap-1.5 text-xs ${micOn ? "text-white/40" : "text-red-400"}`}>
              {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{micOn ? "Mic on" : "Muted"}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className={`flex items-center gap-1.5 text-xs ${camOn ? "text-white/40" : "text-red-400"}`}>
              {camOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              <span>{camOn ? "Camera on" : "Camera off"}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "participant";

  const [authToken, setAuthToken] = useState(null);
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
        <RtkMeeting mode="fill" showSetupScreen={false} />
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