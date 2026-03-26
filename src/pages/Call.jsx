import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  MoreHorizontal,
  PhoneOff,
  Shield,
  ChevronUp,
  Circle,
  Clock,
  Lock,
  Smile,
  LayoutGrid,
  Settings,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

const CLOUDFLARE_MEETING_ID = import.meta.env.VITE_CLOUDFLARE_MEETING_ID;

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80",
];

/* ─────────────────────────────────────────────
   ELAPSED TIMER HOOK
───────────────────────────────────────────── */
function useElapsedTime(startTime) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(startTime)) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (h > 0) setElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      else setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return elapsed;
}

/* ─────────────────────────────────────────────
   TOOLBAR BUTTON
───────────────────────────────────────────── */
function ToolbarBtn({ icon: Icon, label, active, danger, disabled, onClick, hasChevron, chevronAction, redDot }) {
  return (
    <div className="relative flex flex-col items-center group">
      <div className="flex items-end">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px]
            ${danger
              ? "bg-red-500 hover:bg-red-600 text-white"
              : active
                ? "bg-[#D4AF7A]/20 text-[#D4AF7A]"
                : "text-white hover:bg-white/10"
            }
            ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <div className="relative">
            <Icon className="w-5 h-5" />
            {redDot && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-wide whitespace-nowrap leading-none">
            {label}
          </span>
        </button>
        {hasChevron && (
          <button
            onClick={chevronAction}
            className="mb-[18px] ml-0.5 p-0.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RECORDING BADGE
───────────────────────────────────────────── */
function RecordingBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span className="text-white text-xs font-semibold tracking-widest uppercase">Rec</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
function TopBar({ meetingName, elapsed, participantCount, isRecording, isHost, onSecurityClick }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3
                    bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
      {/* Left: meeting name + lock */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate max-w-[200px]">
              {meetingName || "Strategy Call"}
            </span>
            <Lock className="w-3.5 h-3.5 text-[#D4AF7A]" />
          </div>
          {elapsed && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-white/50" />
              <span className="text-white/50 text-xs font-mono">{elapsed}</span>
            </div>
          )}
        </div>
        {isRecording && <RecordingBadge />}
      </div>

      {/* Right: participant count */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {participantCount > 0 && (
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#D4AF7A]" />
            <span className="text-white text-xs font-medium">{participantCount}</span>
          </div>
        )}
        {isHost && (
          <button
            onClick={onSecurityClick}
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5
                       rounded-full text-white/70 hover:text-white transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#D4AF7A]" />
            <span className="text-xs font-medium">Security</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOTTOM TOOLBAR (zoom-style)
───────────────────────────────────────────── */
function BottomToolbar({
  isMuted, isVideoOff, isRecording, isHost,
  onMute, onVideo, onShare, onChat, onParticipants,
  onReactions, onRecord, onMore, onLeave,
  onMicSettings, onVideoSettings,
  chatOpen, participantsOpen,
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-40">
      {/* gradient fade */}
      <div className="h-28 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-4">
        {/* LEFT GROUP */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            icon={isMuted ? MicOff : Mic}
            label={isMuted ? "Unmute" : "Mute"}
            active={false}
            redDot={isMuted}
            onClick={onMute}
            hasChevron
            chevronAction={onMicSettings}
          />
          <ToolbarBtn
            icon={isVideoOff ? VideoOff : Video}
            label={isVideoOff ? "Start Video" : "Stop Video"}
            active={false}
            onClick={onVideo}
            hasChevron
            chevronAction={onVideoSettings}
          />
          {isHost && (
            <ToolbarBtn
              icon={Shield}
              label="Security"
              onClick={onMore}
            />
          )}
        </div>

        {/* CENTER GROUP */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            icon={Users}
            label="Participants"
            active={participantsOpen}
            onClick={onParticipants}
          />
          <ToolbarBtn
            icon={MessageSquare}
            label="Chat"
            active={chatOpen}
            onClick={onChat}
          />
          <ToolbarBtn
            icon={Monitor}
            label="Share Screen"
            onClick={onShare}
          />
          {isHost && (
            <ToolbarBtn
              icon={Circle}
              label={isRecording ? "Stop Rec" : "Record"}
              active={isRecording}
              redDot={isRecording}
              onClick={onRecord}
            />
          )}
          <ToolbarBtn
            icon={Smile}
            label="Reactions"
            onClick={onReactions}
          />
          <ToolbarBtn
            icon={LayoutGrid}
            label="View"
            onClick={onMore}
          />
          <ToolbarBtn
            icon={MoreHorizontal}
            label="More"
            onClick={onMore}
          />
        </div>

        {/* RIGHT GROUP – LEAVE */}
        <div className="flex items-center">
          <button
            onClick={onLeave}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white
                       px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150
                       shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDE PANEL (Chat / Participants)
───────────────────────────────────────────── */
function SidePanel({ title, onClose, children }) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-[320px] z-30
                    bg-[#1A2332]/95 backdrop-blur-md border-l border-white/10
                    flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <span className="text-white font-semibold text-sm">{title}</span>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REACTION OVERLAY
───────────────────────────────────────────── */
const REACTIONS = ["👍", "❤️", "😂", "😮", "👏", "🎉", "🔥", "✅"];

function ReactionsPanel({ onReact, onClose }) {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50
                    bg-[#1A2332]/95 backdrop-blur-md border border-white/10
                    rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">
      {REACTIONS.map((r) => (
        <button
          key={r}
          onClick={() => { onReact(r); onClose(); }}
          className="text-2xl hover:scale-125 transition-transform duration-150"
        >
          {r}
        </button>
      ))}
      <button onClick={onClose} className="ml-2 text-white/40 hover:text-white/80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING REACTION
───────────────────────────────────────────── */
function FloatingReactions({ reactions }) {
  return (
    <div className="absolute bottom-28 left-6 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full
                     animate-[floatUp_3s_ease-out_forwards]"
          style={{ animation: "floatUp 3s ease-out forwards" }}
        >
          <span className="text-lg">{r.emoji}</span>
          <span className="text-white/70 text-xs font-medium">{r.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN MEETING UI
───────────────────────────────────────────── */
function MeetingUI({ isHost, meetingTime, meetingName, meetingId }) {
  const { meeting } = useRealtimeKitMeeting();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const videoBgRef = useRef(null);
  const currentMiddlewareRef = useRef(null);
  const elapsed = useElapsedTime(meetingTime);

  /* recording state sync */
  useEffect(() => {
    if (!meeting?.recording) return;
    const id = setInterval(() => {
      setIsRecording(meeting.recording.recordingState === "RECORDING");
    }, 1000);
    return () => clearInterval(id);
  }, [meeting]);

  /* participant count sync */
  useEffect(() => {
    if (!meeting?.participants) return;
    const update = () => {
      const count = [...(meeting.participants.joined?.toArray?.() || [])].length;
      setParticipantCount(count || 1);
    };
    update();
    meeting.participants.joined?.on("participantJoined", update);
    meeting.participants.joined?.on("participantLeft", update);
    return () => {
      meeting.participants.joined?.off("participantJoined", update);
      meeting.participants.joined?.off("participantLeft", update);
    };
  }, [meeting]);

  /* init virtual background */
  useEffect(() => {
    if (!meeting) return;
    const init = async () => {
      try {
        await meeting.self.setVideoMiddlewareGlobalConfig({ disablePerFrameCanvasRendering: true });
        videoBgRef.current = await RealtimeKitVideoBackgroundTransformer.init({
          meeting,
          segmentationConfig: { pipeline: "webgl2" },
        });
      } catch (err) {
        console.error("VBG init error:", err);
      }
    };
    init();
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
    } catch (err) {
      console.error("Start recording error:", err);
    }
  };

  const stopRecording = async () => {
    try { await meeting?.recording?.stop(); } catch (err) { console.error(err); }
  };

  const handleRecord = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleReact = (emoji) => {
    const id = Date.now();
    setReactions((prev) => [...prev, { id, emoji, name: "You" }]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 3000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { id: Date.now(), text: chatInput, from: "You" }]);
    setChatInput("");
  };

  if (!meeting) return null;

  return (
    <>
      {/* global float-up keyframe */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px); }
        }
      `}</style>

      <div className="w-full h-screen bg-[#0D1117] relative flex overflow-hidden">
        {/* ── VIDEO AREA ── */}
        <div className="flex-1 relative overflow-hidden">
          <TopBar
            meetingName={meetingName}
            elapsed={elapsed}
            participantCount={participantCount}
            isRecording={isRecording}
            isHost={isHost}
          />

          {/* Actual Dyte/RTK video grid */}
          <div className="w-full h-full">
            <RtkMeeting mode="fill" meeting={meeting} showSetupScreen={false} />
          </div>

          <FloatingReactions reactions={reactions} />

          {reactionsOpen && (
            <ReactionsPanel onReact={handleReact} onClose={() => setReactionsOpen(false)} />
          )}

          <BottomToolbar
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isRecording={isRecording}
            isHost={isHost}
            onMute={() => setIsMuted((v) => !v)}
            onVideo={() => setIsVideoOff((v) => !v)}
            onShare={() => { /* screen share logic */ }}
            onChat={() => { setChatOpen((v) => !v); setParticipantsOpen(false); }}
            onParticipants={() => { setParticipantsOpen((v) => !v); setChatOpen(false); }}
            onReactions={() => setReactionsOpen((v) => !v)}
            onRecord={handleRecord}
            onMore={() => setSettingsOpen(true)}
            onLeave={() => { meeting.leaveRoom?.(); navigate("/"); }}
            onMicSettings={() => { }}
            onVideoSettings={() => setSettingsOpen(true)}
            chatOpen={chatOpen}
            participantsOpen={participantsOpen}
          />
        </div>

        {/* ── SIDE PANELS ── */}
        {chatOpen && (
          <SidePanel title="In-Meeting Chat" onClose={() => setChatOpen(false)}>
            <div className="flex flex-col h-full">
              <div className="flex-1 px-4 py-3 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-white/30 text-xs text-center mt-8">No messages yet</p>
                ) : (
                  chatMessages.map((m) => (
                    <div key={m.id} className="flex flex-col gap-0.5">
                      <span className="text-[#D4AF7A] text-xs font-semibold">{m.from}</span>
                      <span className="text-white/80 text-sm">{m.text}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendChat} className="px-3 pb-4 pt-2 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2
                               text-white text-xs outline-none focus:border-[#D4AF7A]/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </SidePanel>
        )}

        {participantsOpen && (
          <SidePanel title={`Participants (${participantCount})`} onClose={() => setParticipantsOpen(false)}>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center">
                    <span className="text-[#D4AF7A] text-xs font-bold">Y</span>
                  </div>
                  <span className="text-white text-sm">You (Host)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-white/40" />
                  <Video className="w-3.5 h-3.5 text-white/40" />
                </div>
              </div>
            </div>
          </SidePanel>
        )}
      </div>

      <VideoSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        videoBgRef={videoBgRef}
        meeting={meeting}
        currentEffect={currentMiddlewareRef}
        onEffectChange={() => { }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   PRE-JOIN SCREEN  (Zoom "preview" screen)
───────────────────────────────────────────── */
function PreJoinScreen({ isHost, onJoin, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* local camera preview */
  useEffect(() => {
    if (!camOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => { });
        }
      })
      .catch(() => { });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!isHost && !email.trim()) return;
    onJoin({ name: name.trim(), email: email.trim(), meetingName: meetingName.trim() });
  };

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      {/* subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#D4AF7A 1px, transparent 1px), linear-gradient(90deg, #D4AF7A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 w-full max-w-4xl items-center">
        {/* ── CAMERA PREVIEW ── */}
        <div className="flex-1 w-full max-w-lg">
          <div className="relative aspect-video bg-[#1A2332] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            {camOn ? (
              <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/10 flex items-center justify-center">
                  <VideoOff className="w-7 h-7 text-[#D4AF7A]/60" />
                </div>
                <span className="text-white/40 text-sm">Camera is off</span>
              </div>
            )}

            {/* preview controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={() => setMicOn((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${micOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCamOn((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${camOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
              >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* "preview" label */}
            <div className="absolute top-3 left-3 bg-black/50 px-2 py-0.5 rounded text-white/50 text-[10px] font-semibold uppercase tracking-widest">
              Preview
            </div>
          </div>

          <p className="text-white/30 text-xs text-center mt-3">
            {camOn ? "Others will see you like this" : "Start video when you're ready"}
          </p>
        </div>

        {/* ── JOIN FORM ── */}
        <div className="w-full max-w-sm">
          {/* Logo mark */}
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

          {/* device status indicators */}
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

/* ─────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────── */
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

  /* Config error */
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

  /* In-meeting */
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

  /* Pre-join */
  return (
    <PreJoinScreen
      isHost={isHost}
      onJoin={handleJoin}
      loading={loading}
      error={error}
    />
  );
}