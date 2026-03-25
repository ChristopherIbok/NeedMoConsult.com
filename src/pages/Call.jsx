import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "@/lib/api";
import {
  useRealtimeKitClient,
  useRealtimeKitMeeting,
  RealtimeKitProvider,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import { Clock, Users, MoreVertical, Video, Circle, CircleDot } from "lucide-react";

const VideoSettingsModal = lazy(() => import("@/components/ui/VideoSettingsModal").then(m => ({ default: m.VideoSettingsModal })));

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

function MeetingInfoBar({ meetingTime, participantCount }) {
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

  return (
    <div className="absolute top-4 left-4 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
        <Clock className="w-4 h-4 text-[#D4AF7A]" />
        <span className="text-white text-sm font-medium">{timeLeft || "In progress"}</span>
      </div>
      {participantCount !== undefined && (
        <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4 text-[#D4AF7A]" />
          <span className="text-white text-sm font-medium">{participantCount} participants</span>
        </div>
      )}
    </div>
  );
}

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80",
];

function MeetingUI({ isHost, meetingTime, meetingName, meetingId }) {
  const { meeting } = useRealtimeKitMeeting();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState("IDLE");
  const [participantCount, setParticipantCount] = useState(0);
  const [videoEffect, setVideoEffect] = useState("none");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoBgRef = useRef(null);
  const currentMiddlewareRef = useRef(null);

  useEffect(() => {
    if (meeting?.recording) {
      const checkRecording = setInterval(() => {
        setRecordingState(meeting.recording.recordingState);
        setIsRecording(meeting.recording.recordingState === "RECORDING");
      }, 1000);
      return () => clearInterval(checkRecording);
    }
  }, [meeting]);

  useEffect(() => {
    const initVideoBackground = async () => {
      if (!meeting) return;
      
      try {
        await meeting.self.setVideoMiddlewareGlobalConfig({
          disablePerFrameCanvasRendering: true,
        });

        videoBgRef.current = await RealtimeKitVideoBackgroundTransformer.init({
          meeting,
          segmentationConfig: {
            pipeline: "webgl2",
          },
        });
      } catch (err) {
        console.error("Failed to init video background:", err);
      }
    };

    initVideoBackground();
  }, [meeting]);

  const applyVideoEffect = async (effect, value = null) => {
    if (!meeting || !videoBgRef.current) return;

    try {
      if (currentMiddlewareRef.current) {
        meeting.self.removeVideoMiddleware(currentMiddlewareRef.current);
        currentMiddlewareRef.current = null;
      }

      if (effect === "blur") {
        const blurMiddleware = await videoBgRef.current.createBackgroundBlurVideoMiddleware(value || 20);
        meeting.self.addVideoMiddleware(blurMiddleware);
        currentMiddlewareRef.current = blurMiddleware;
      } else if (effect === "image" && value) {
        const imageMiddleware = await videoBgRef.current.createStaticBackgroundVideoMiddleware(value);
        meeting.self.addVideoMiddleware(imageMiddleware);
        currentMiddlewareRef.current = imageMiddleware;
      }

      setVideoEffect(effect === "none" ? "none" : effect);
    } catch (err) {
      console.error("Failed to apply video effect:", err);
    }
  };

  const startRecording = async () => {
    if (!meetingId) {
      console.error("No meeting ID");
      return;
    }
    try {
      const result = await request("/public/realtimekit/start-recording", {
        method: "POST",
        body: JSON.stringify({
          meeting_id: meetingId,
        }),
      });
      console.log("Recording started:", result);
    } catch (err) {
      console.error("Start recording error:", err);
      alert("Failed to start recording: " + (err.message || "Unknown error"));
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

  return (
    <div className="w-full h-screen bg-[#0D1117] relative">
      <MeetingInfoBar meetingTime={meetingTime} participantCount={participantCount} />
      <div className="w-full h-full">
        <RtkMeeting
          mode="fill"
          meeting={meeting}
          showSetupScreen={true}
        />
      </div>
      {isHost && (
        <div className="absolute top-20 right-4 flex items-center gap-4 z-50">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <CircleDot className="w-4 h-4 animate-pulse" />
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/80 text-white hover:bg-red-600 transition-colors"
            >
              <Circle className="w-4 h-4" />
              Record
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-black/90 rounded-lg overflow-hidden shadow-xl min-w-[180px] z-50">
                <button
                  onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-white hover:bg-white/10 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Video Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <VideoSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          videoBgRef={videoBgRef}
          meeting={meeting}
          currentEffect={currentMiddlewareRef}
          onEffectChange={setVideoEffect}
        />
      </Suspense>
    </div>
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
          role: role,
          meetingName: meetingName.trim() || undefined,
          email: email.trim().toLowerCase()
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
      initClient({
        authToken,
        defaults: {
          recording: {
            videoConfig: {
              width: 1920,
              height: 1080,
            },
            fileNamePrefix: "consultation-{date}",
          },
        },
      })
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error("Init client error:", err);
          setError("Failed to connect to meeting. Please refresh and try again.");
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
        <MeetingUI isHost={isHost} meetingTime={meetingTime} meetingName={meetingName} meetingId={CLOUDFLARE_MEETING_ID} />
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
          {!isHost && (
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-[#1A2332] dark:text-white text-center text-lg outline-none focus:border-[#D4AF7A] transition-colors"
                autoFocus
                required
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
              required
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