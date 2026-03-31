import React, { useState, useCallback, useRef, useEffect } from "react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import {
  RealtimeKitProvider,
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from "@cloudflare/realtimekit-react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MonitorUp, Users, MessageSquare, Hand,
  Maximize2, Minimize2, CircleDot, Settings,
  X, Copy, Check, Send,
} from "lucide-react";

// ─── Inner component (must live inside RealtimeKitProvider) ───────────────────
function MeetingRoomInner({ isHost, onLeave, meetingName, roomName }) {
  const { meeting } = useRealtimeKitMeeting();
  
  // SDK-driven self state
  const selfName        = useRealtimeKitSelector((m) => m.self?.name);
  const selfAudio       = useRealtimeKitSelector((m) => m.self?.audioEnabled);
  const selfVideo       = useRealtimeKitSelector((m) => m.self?.videoEnabled);
  const selfJoined      = useRealtimeKitSelector((m) => m.self?.roomJoined);
  const joinedMap       = useRealtimeKitSelector((m) => m.participants?.joined);
  const participants    = joinedMap ? Array.from(joinedMap.values()) : [];

  // Local UI state
  const [isScreenSharing,  setIsScreenSharing]  = useState(false);
  const [isHandRaised,     setIsHandRaised]      = useState(false);
  const [isRecording,      setIsRecording]       = useState(false);
  const [isFullscreen,     setIsFullscreen]      = useState(false);
  const [showParticipants, setShowParticipants]  = useState(false);
  const [showChat,         setShowChat]          = useState(false);
  const [copied,           setCopied]            = useState(false);
  const [chatMessages,     setChatMessages]      = useState([]);
  const [chatInput,        setChatInput]         = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ─── Controls ──────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!meeting) return;
    selfAudio ? meeting.self.disableAudio() : meeting.self.enableAudio();
  }, [meeting, selfAudio]);

  const toggleCamera = useCallback(() => {
    if (!meeting) return;
    selfVideo ? meeting.self.disableVideo() : meeting.self.enableVideo();
  }, [meeting, selfVideo]);

  const toggleScreenShare = useCallback(async () => {
    if (!meeting) return;
    if (!meeting.self?.roomJoined) {
      console.warn("Cannot screen share: not joined yet");
      return;
    }
    try {
      if (isScreenSharing) {
        await meeting.self.disableScreenShare?.();
      } else {
        await meeting.self.enableScreenShare?.();
      }
      setIsScreenSharing((v) => !v);
    } catch (e) {
      console.error("Screen share error:", e);
    }
  }, [meeting, isScreenSharing]);

  const toggleHand = useCallback(() => {
    setIsHandRaised((v) => !v);
    meeting?.raiseHand?.(!isHandRaised);
  }, [meeting, isHandRaised]);

  const toggleRecording = useCallback(async () => {
    if (!meeting || !isHost) return;
    try {
      if (isRecording) {
        await meeting.stopRecording?.();
        setIsRecording(false);
      } else {
        await meeting.startRecording?.();
        setIsRecording(true);
      }
    } catch (e) {
      console.error("Recording error:", e);
    }
  }, [meeting, isHost, isRecording]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleLeave = useCallback(async () => {
    if (meeting) await meeting.leaveRoom?.();
    onLeave();
  }, [meeting, onLeave]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomName || meetingName || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    meeting?.sendChatMessage?.(chatInput.trim());
    setChatMessages((prev) => [
      ...prev,
      { senderName: selfName || "You", text: chatInput.trim(), timestamp: Date.now() },
    ]);
    setChatInput("");
  };

  const togglePanel = (panel) => {
    if (panel === "participants") {
      setShowParticipants((v) => !v);
      setShowChat(false);
    } else {
      setShowChat((v) => !v);
      setShowParticipants(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0F1A] flex flex-col select-none">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0D1117]/90 backdrop-blur-sm border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 flex items-center justify-center">
            <span className="text-[#D4AF7A] text-sm font-bold">N</span>
          </div>
          <div>
            <h1 className="text-white/90 text-sm font-semibold leading-none">
              {meetingName || "Video Conference"}
            </h1>
            <p className="text-white/30 text-xs mt-0.5">
              {participants.length + 1} participant{participants.length !== 0 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 rounded-full border border-red-500/20">
              <CircleDot className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="text-red-400 text-xs font-medium">REC</span>
            </div>
          )}

          {/* Host recording button */}
          {isHost && (
            <button
              onClick={toggleRecording}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs rounded-lg transition-all"
            >
              {isRecording ? "Stop Rec" : "Record"}
            </button>
          )}

          {/* Copy room ID */}
          <button
            onClick={copyRoomId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-xs transition-all"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-green-400" />
              : <Copy className="w-3.5 h-3.5" />
            }
            <span>{copied ? "Copied!" : "Copy ID"}</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            {isFullscreen
              ? <Minimize2 className="w-4 h-4" />
              : <Maximize2 className="w-4 h-4" />
            }
          </button>

          {/* Settings (placeholder) */}
          <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video grid — Cloudflare's reliable prebuilt renderer */}
        <main className="flex-1 p-3 overflow-hidden">
          <div className="h-full bg-[#1A2332] rounded-2xl border border-white/5 overflow-hidden">
            <RtkMeeting mode="fill" showSetupScreen={false} />
          </div>
          {/* Debug info */}
          <div className="mt-2 text-xs text-white/30">
            Self: {selfName} | Audio: {String(selfAudio)} | Video: {String(selfVideo)} | Joined: {String(selfJoined)}
          </div>
        </main>

        {/* ── Participants panel ──────────────────────────────────────────── */}
        {showParticipants && (
          <aside className="w-64 bg-[#0D1117] border-l border-white/5 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                Participants ({participants.length + 1})
              </h2>
              <button onClick={() => setShowParticipants(false)} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-2 space-y-1">
              {/* Self */}
              <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                <div className="w-7 h-7 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center text-[#D4AF7A] text-xs font-bold shrink-0">
                  {(selfName ?? "Y").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate">{selfName ?? "You"}</p>
                  <p className="text-[#D4AF7A]/60 text-[10px]">{isHost ? "Host" : "Participant"}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!selfAudio && <MicOff className="w-3 h-3 text-red-400" />}
                  {!selfVideo && <VideoOff className="w-3 h-3 text-white/30" />}
                </div>
              </li>
              {/* Remote peers */}
              {participants.map((peer) => (
                <li key={peer.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold shrink-0">
                    {(peer.name ?? "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs truncate">{peer.name ?? "Participant"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!peer.audioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                    {!peer.videoEnabled && <VideoOff className="w-3 h-3 text-white/30" />}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* ── Chat panel ─────────────────────────────────────────────────── */}
        {showChat && (
          <aside className="w-72 bg-[#0D1117] border-l border-white/5 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Chat</h2>
              <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-white/20 text-center text-xs py-8">No messages yet</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[#D4AF7A] text-xs font-medium">{msg.senderName}</span>
                      <span className="text-white/20 text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message…"
                className="flex-1 bg-[#1A2332] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#D4AF7A]/40 placeholder:text-white/20"
              />
              <button
                onClick={sendChat}
                className="w-8 h-8 rounded-lg bg-[#D4AF7A]/20 hover:bg-[#D4AF7A]/30 flex items-center justify-center text-[#D4AF7A] transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── Control bar ──────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-center gap-2 py-4 px-6 border-t border-white/5 bg-[#0D1117]/80 backdrop-blur-sm shrink-0">
        <ControlBtn
          active={selfAudio}
          icon={selfAudio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          label={selfAudio ? "Mute" : "Unmute"}
          danger={!selfAudio}
          onClick={toggleMic}
        />
        <ControlBtn
          active={selfVideo}
          icon={selfVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          label={selfVideo ? "Stop Video" : "Start Video"}
          danger={!selfVideo}
          onClick={toggleCamera}
        />
        <ControlBtn
          active={isScreenSharing}
          icon={<MonitorUp className="w-5 h-5" />}
          label="Share"
          onClick={toggleScreenShare}
        />
        <ControlBtn
          active={isHandRaised}
          icon={<Hand className="w-5 h-5" />}
          label="Raise Hand"
          onClick={toggleHand}
        />

        <div className="w-px h-8 bg-white/10 mx-1" />

        <ControlBtn
          active={showParticipants}
          icon={<Users className="w-5 h-5" />}
          label="People"
          onClick={() => togglePanel("participants")}
        />
        <ControlBtn
          active={showChat}
          icon={<MessageSquare className="w-5 h-5" />}
          label="Chat"
          onClick={() => togglePanel("chat")}
        />

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* End call */}
        <button onClick={handleLeave} className="flex flex-col items-center gap-1">
          <span className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/30">
            <PhoneOff className="w-5 h-5" />
          </span>
          <span className="text-white/30 text-[10px]">Leave</span>
        </button>
      </footer>
    </div>
  );
}

// ─── Reusable control button ──────────────────────────────────────────────────
function ControlBtn({ icon, label, onClick, active = true, danger = false }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <span
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150
          ${danger
            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
            : active
            ? "bg-[#D4AF7A]/15 hover:bg-[#D4AF7A]/25 text-[#D4AF7A]"
            : "bg-white/10 hover:bg-white/20 text-white"
          }`}
      >
        {icon}
      </span>
      <span className="text-white/30 text-[10px]">{label}</span>
    </button>
  );
}

// ─── Public wrapper — provides the RealtimeKit context ───────────────────────
export default function MeetingRoom({ meetingClient, isHost, onLeave, meetingName, roomName }) {
  if (!meetingClient) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
        <p className="text-white/30 text-sm">Connecting…</p>
      </div>
    );
  }

  return (
    <RealtimeKitProvider value={meetingClient}>
      <MeetingRoomInner
        isHost={isHost}
        onLeave={onLeave}
        meetingName={meetingName}
        roomName={roomName}
      />
    </RealtimeKitProvider>
  );
}