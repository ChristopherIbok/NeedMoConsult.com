import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import {
  RtkUiProvider,
  RtkControlbar,
  RtkParticipantsAudio,
  RtkParticipantTile,
  RtkNameTag,
  RtkAudioVisualizer,
  RtkAvatar,
  RtkSetupScreen,
} from "@cloudflare/realtimekit-react-ui";
import { Clock, Users, ChevronDown } from "lucide-react";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

function MeetingInfoBar({ meetingTime, participantCount, showNames }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!meetingTime) return;
    
    const updateTimer = () => {
      const start = new Date(meetingTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);
      
      if (diff < 0) {
        setTimeLeft("Starting soon");
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [meetingTime]);

  if (!showNames) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
        <Clock className="w-4 h-4 text-[#D4AF7A]" />
        <span className="text-white text-sm font-medium">{timeLeft || "In progress"}</span>
      </div>
      {showNames && participantCount !== undefined && (
        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4 text-[#D4AF7A]" />
          <span className="text-white text-sm font-medium">{participantCount} participants</span>
        </div>
      )}
    </div>
  );
}

function MeetingUI({ isHost, meetingTime, meetingName }) {
  const { meeting } = useRealtimeKitMeeting();
  const [viewMode, setViewMode] = useState("grid");
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState("IDLE");
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (meeting?.recording) {
      const checkRecording = setInterval(() => {
        setRecordingState(meeting.recording.recordingState);
        setIsRecording(meeting.recording.recordingState === "RECORDING");
      }, 1000);
      return () => clearInterval(checkRecording);
    }
  }, [meeting]);

  const startRecording = async () => {
    if (!meeting?.recording) return;
    try {
      await meeting.recording.start();
    } catch (err) {
      console.error("Start recording error:", err);
      alert("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!meeting?.recording) return;
    try {
      await meeting.recording.stop();
    } catch (err) {
      console.error("Stop recording error:", err);
    }
  };

  if (!meeting) {
    return null;
  }

  const joinedParticipants = useRealtimeKitSelector((m) => m.participants.joined);
  const selfParticipant = useRealtimeKitSelector((m) => m.self);
  const allParticipants = selfParticipant ? [selfParticipant, ...(joinedParticipants?.toArray() || [])] : [];

  const renderParticipant = (participant, index) => (
    <RtkParticipantTile
      key={participant.id}
      participant={participant}
      meeting={meeting}
      nameTagPosition="bottom-left"
    >
      <RtkNameTag participant={participant} meeting={meeting}>
        <RtkAudioVisualizer
          participant={participant}
          hideMuted={true}
          size="sm"
        />
      </RtkNameTag>
      <RtkAvatar participant={participant} />
    </RtkParticipantTile>
  );

  const gridClass = viewMode === "spotlight" 
    ? "grid grid-cols-1 gap-2 p-2 h-full"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 h-full";

  return (
    <RtkUiProvider meeting={meeting}>
      <RtkParticipantsAudio meeting={meeting} preloadedAudioElem={document.createElement("audio")} />
      <div className="w-full h-screen bg-[#0D1117] relative flex flex-col">
        <MeetingInfoBar meetingTime={meetingTime} participantCount={participantCount} showNames={showNames} />
        <div className="flex-1 overflow-auto">
          <div className={gridClass}>
            {allParticipants.map(renderParticipant)}
          </div>
        </div>
        <div className="bg-[#1A2332] px-4 py-3">
          <RtkControlbar meeting={meeting} variant="solid" />
        </div>
        {isHost && (
          <div className="absolute top-20 right-4 flex items-center gap-4 z-50">
            <div className="relative">
              <button
                onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                View
                <ChevronDown className={`w-4 h-4 transition-transform ${viewDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {viewDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-black/90 rounded-lg overflow-hidden shadow-xl">
                  <button
                    onClick={() => { setViewMode("grid"); setViewDropdownOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      viewMode === "grid" ? "bg-[#D4AF7A] text-[#1A2332]" : "text-white hover:bg-white/10"
                    }`}
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => { setViewMode("spotlight"); setViewDropdownOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      viewMode === "spotlight" ? "bg-[#D4AF7A] text-[#1A2332]" : "text-white hover:bg-white/10"
                    }`}
                  >
                    Spotlight
                  </button>
                  <div className="border-t border-white/20" />
                  <button
                    onClick={() => { setShowNames(!showNames); setViewDropdownOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      showNames ? "bg-[#D4AF7A] text-[#1A2332]" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {showNames ? "Hide Names" : "Show Names"}
                  </button>
                </div>
              )}
            </div>
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-4 h-4 rounded-full bg-red-500 animate-pulse transition-colors"
                title="Stop Recording"
              />
            )}
          </div>
        )}
      </div>
    </RtkUiProvider>
  );
}

export default function Call() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "participant";
  const meetingTime = searchParams.get("time") || null;
  const [authToken, setAuthToken] = useState(null);
  const [name, setName] = useState("");
  const [meetingName, setMeetingName] = useState("");
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
          meetingName: meetingName.trim() || undefined,
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
      <RealtimeKitProvider value={client}>
        <MeetingUI isHost={isHost} meetingTime={meetingTime} meetingName={meetingName} />
      </RealtimeKitProvider>
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
            {isHost && (
              <div>
                <input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="Meeting name (optional)"
                  className="w-full bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1A2332] dark:text-white text-center text-lg outline-none focus:border-[#D4AF7A] transition-colors"
                />
              </div>
            )}
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