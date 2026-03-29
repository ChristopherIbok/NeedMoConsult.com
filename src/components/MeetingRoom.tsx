import { useState, useCallback } from "react";
import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from "@cloudflare/realtimekit-react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Users, MoreHorizontal, Copy, Check,
} from "lucide-react";
import VideoTile from "./VideoTile";

interface MeetingRoomProps {
  roomName: string;
  onLeave: () => void;
}

export default function MeetingRoom({ roomName, onLeave }: MeetingRoomProps) {
  const { meeting } = useRealtimeKitMeeting();

  // ─── Self state ────────────────────────────────────────────────────────────
  const selfName = useRealtimeKitSelector((m) => m.self.name);
  const selfVideoEnabled = useRealtimeKitSelector((m) => m.self.videoEnabled);
  const selfAudioEnabled = useRealtimeKitSelector((m) => m.self.audioEnabled);
  const selfVideoTrack = useRealtimeKitSelector((m) => m.self.videoTrack);
  const selfAudioTrack = useRealtimeKitSelector((m) => m.self.audioTrack);

  // ─── Remote participants ───────────────────────────────────────────────────
  // `participants.joined` is a Map<string, Peer>
  const joinedMap = useRealtimeKitSelector((m) => m.participants.joined);
  const participants = joinedMap ? Array.from(joinedMap.values()) : [];

  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // ─── Controls ──────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!meeting) return;
    if (selfAudioEnabled) {
      meeting.self.disableAudio();
    } else {
      meeting.self.enableAudio();
    }
  }, [meeting, selfAudioEnabled]);

  const toggleCamera = useCallback(() => {
    if (!meeting) return;
    if (selfVideoEnabled) {
      meeting.self.disableVideo();
    } else {
      meeting.self.enableVideo();
    }
  }, [meeting, selfVideoEnabled]);

  const handleLeave = useCallback(async () => {
    if (!meeting) return;
    await meeting.leaveRoom();
    onLeave();
  }, [meeting, onLeave]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomName).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Grid layout helper ────────────────────────────────────────────────────
  const totalPeers = participants.length; // remote only
  const gridClass =
    totalPeers === 0
      ? "grid-cols-1"
      : totalPeers === 1
      ? "grid-cols-2"
      : totalPeers <= 3
      ? "grid-cols-2"
      : totalPeers <= 8
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className="min-h-screen bg-[#0A0F1A] flex flex-col">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 flex items-center justify-center">
            <Video className="w-4 h-4 text-[#D4AF7A]" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold leading-none">{roomName}</p>
            <p className="text-white/30 text-xs mt-0.5">
              {participants.length + 1} participant{participants.length !== 0 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10
                       text-white/50 hover:text-white/80 text-xs transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Room ID"}</span>
          </button>
          <button
            onClick={() => setShowParticipants((v) => !v)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
              ${showParticipants ? "bg-[#D4AF7A]/20 text-[#D4AF7A]" : "bg-white/5 hover:bg-white/10 text-white/50"}`}
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <main className="flex-1 p-4 overflow-auto">
          {totalPeers === 0 ? (
            // Waiting state: just show self full
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-lg">
                <VideoTile
                  videoTrack={selfVideoTrack}
                  audioTrack={selfAudioTrack}
                  isVideoEnabled={selfVideoEnabled}
                  isAudioEnabled={selfAudioEnabled}
                  name={selfName ?? "You"}
                  isSelf
                  size="lg"
                />
              </div>
              <div className="text-center">
                <p className="text-white/40 text-sm">Waiting for others to join…</p>
                <p className="text-white/20 text-xs mt-1">Share the Room ID above to invite participants</p>
              </div>
            </div>
          ) : (
            // Active call grid
            <div className={`grid ${gridClass} gap-3 auto-rows-fr`}>
              {/* Self tile */}
              <VideoTile
                videoTrack={selfVideoTrack}
                audioTrack={selfAudioTrack}
                isVideoEnabled={selfVideoEnabled}
                isAudioEnabled={selfAudioEnabled}
                name={selfName ?? "You"}
                isSelf
                size="md"
              />

              {/* Remote participant tiles */}
              {participants.map((peer) => (
                <VideoTile
                  key={peer.id}
                  videoTrack={peer.videoTrack}
                  audioTrack={peer.audioTrack}
                  isVideoEnabled={peer.videoEnabled}
                  isAudioEnabled={peer.audioEnabled}
                  name={peer.name ?? "Participant"}
                  size="md"
                />
              ))}
            </div>
          )}
        </main>

        {/* Participants sidebar */}
        {showParticipants && (
          <aside className="w-64 border-l border-white/5 bg-[#0D1117] p-4 overflow-auto shrink-0">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
              Participants ({participants.length + 1})
            </h3>
            <ul className="space-y-2">
              {/* Self */}
              <li className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5">
                <div className="w-7 h-7 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center text-[#D4AF7A] text-xs font-bold shrink-0">
                  {(selfName ?? "Y").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate">{selfName ?? "You"}</p>
                  <p className="text-white/30 text-[10px]">You (Host)</p>
                </div>
                <div className="flex items-center gap-1">
                  {!selfAudioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                  {!selfVideoEnabled && <VideoOff className="w-3 h-3 text-white/30" />}
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
      </div>

      {/* ── Control bar ───────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-center gap-3 py-4 px-6 border-t border-white/5">
        {/* Mic */}
        <button
          onClick={toggleMic}
          title={selfAudioEnabled ? "Mute" : "Unmute"}
          className={`group flex flex-col items-center gap-1`}
        >
          <span
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150
              ${selfAudioEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
              }`}
          >
            {selfAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </span>
          <span className="text-white/30 text-[10px]">{selfAudioEnabled ? "Mute" : "Unmute"}</span>
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={selfVideoEnabled ? "Stop Video" : "Start Video"}
          className="flex flex-col items-center gap-1"
        >
          <span
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150
              ${selfVideoEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
              }`}
          >
            {selfVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </span>
          <span className="text-white/30 text-[10px]">{selfVideoEnabled ? "Stop Video" : "Start Video"}</span>
        </button>

        {/* Spacer */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* End call */}
        <button
          onClick={handleLeave}
          title="Leave call"
          className="flex flex-col items-center gap-1"
        >
          <span className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all duration-150 shadow-lg shadow-red-600/30">
            <PhoneOff className="w-5 h-5" />
          </span>
          <span className="text-white/30 text-[10px]">Leave</span>
        </button>

        {/* More options (placeholder) */}
        <button
          title="More options"
          className="flex flex-col items-center gap-1 opacity-50"
        >
          <span className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 flex items-center justify-center transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </span>
          <span className="text-white/20 text-[10px]">More</span>
        </button>
      </footer>
    </div>
  );
}
