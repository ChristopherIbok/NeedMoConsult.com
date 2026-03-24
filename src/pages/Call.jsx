import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

function MeetingUI({ isHost }) {
  const { meeting } = useRealtimeKitMeeting();
  const [viewMode, setViewMode] = useState("grid");

  if (!meeting) {
    return null;
  }

  return (
    <div className="relative">
      <RtkMeeting
        mode="fill"
        meeting={meeting}
        showSetupScreen={true}
        gridLayout={viewMode === "spotlight" ? "column" : "row"}
      />
      {isHost && (
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "grid" ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-black/50 text-white hover:bg-black/70"
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setViewMode("spotlight")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "spotlight" ? "bg-[#D4AF7A] text-[#1A2332]" : "bg-black/50 text-white hover:bg-black/70"
            }`}
          >
            Spotlight
          </button>
        </div>
      )}
    </div>
  );
}

export default function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "participant";
  const [authToken, setAuthToken] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const [client, initClient] = useRealtimeKitClient();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await request("/public/realtimekit/verify", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (data.verified) {
        setVerified(true);
        setName(data.name || "");
      } else {
        setError("Email not found in our contacts. Please contact us first.");
      }
    } catch (err) {
      setError("Failed to verify email. Please try again.");
    }
    setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !CLOUDFLARE_MEETING_ID) return;

    setLoading(true);
    setError(null);

    try {
      const data = await request("/public/realtimekit/join", {
        method: "POST",
        body: JSON.stringify({ 
          name: name.trim(), 
          meetingId: CLOUDFLARE_MEETING_ID,
          role: role,
          email: verified ? email.trim().toLowerCase() : undefined
        }),
      });
      setAuthToken(data.authToken);
    } catch (err) {
      console.error("RealtimeKit Join Error:", err);
      setError("Failed to join meeting. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      initClient({ authToken }).then(() => {
        setLoading(false);
      });
    }
  }, [authToken, initClient]);

  const isHost = role === "host";

  if (!CLOUDFLARE_MEETING_ID) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#161B22] rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <h1 className="text-xl font-bold text-[#1A2332] dark:text-white mb-2">Configuration Error</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Cloudflare meeting ID not configured. Set VITE_CLOUDFLARE_MEETING_ID in your environment.
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
      <main className="fixed inset-0 bg-white dark:bg-[#0D1117] overflow-hidden">
        <SEO title={`${role === 'host' ? 'Host' : 'Video'} Call | NEEDMO CONSULT`} />
        <RealtimeKitProvider value={client}>
          <MeetingUI isHost={isHost} />
        </RealtimeKitProvider>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-[#0D1117] dark:to-[#161B22] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161B22] rounded-3xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/10 dark:bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#D4AF7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
            {isHost ? "Start Meeting (Host)" : "Join Strategy Call"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isHost ? "You have host privileges for this meeting" : "Enter your email to join the meeting"}
          </p>
        </div>

        {!isHost && !verified ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1A2332] dark:text-white text-center text-lg outline-none focus:border-[#D4AF7A] transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A2332] font-semibold py-3 rounded-xl transition-colors text-lg"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1A2332] dark:text-white text-center text-lg outline-none focus:border-[#D4AF7A] transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A2332] font-semibold py-3 rounded-xl transition-colors text-lg"
            >
              {loading ? "Connecting..." : isHost ? "Start Meeting" : "Join Meeting"}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 text-gray-500 dark:text-gray-400 hover:text-[#1A2332] dark:hover:text-white py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}