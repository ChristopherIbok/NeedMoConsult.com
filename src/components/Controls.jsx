import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Hand,
  CircleDot,
} from "lucide-react";

export function Controls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isHandRaised,
  isHost,
  isRecording = false,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onToggleParticipants,
  onToggleChat,
  onToggleHand,
  onSettings,
  showParticipants = true,
  showChat = true,
  showScreenShare = true,
  participantCount = 0,
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-3 bg-[#1A2332]/95 backdrop-blur-sm rounded-2xl border border-white/10 ${className}`}
    >
      <div className="flex items-center gap-2">
        <ControlButton
          isActive={isAudioEnabled}
          onClick={onToggleAudio}
          icon={isAudioEnabled ? Mic : MicOff}
          label={isAudioEnabled ? "Mute" : "Unmute"}
          variant={isAudioEnabled ? "default" : "danger"}
        />

        <ControlButton
          isActive={isVideoEnabled}
          onClick={onToggleVideo}
          icon={isVideoEnabled ? Video : VideoOff}
          label={isVideoEnabled ? "Stop Video" : "Start Video"}
          variant={isVideoEnabled ? "default" : "danger"}
        />

        {showScreenShare && (
          <ControlButton
            isActive={isScreenSharing}
            onClick={onToggleScreenShare}
            icon={MonitorUp}
            label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            variant={isScreenSharing ? "active" : "default"}
          />
        )}

        <ControlButton
          isActive={isHandRaised}
          onClick={onToggleHand}
          icon={Hand}
          label={isHandRaised ? "Lower Hand" : "Raise Hand"}
          variant={isHandRaised ? "active" : "default"}
          show={!isHost}
        />

        <div className="w-px h-8 bg-white/10 mx-1" />

        {showParticipants && (
          <ControlButton
            isActive={false}
            onClick={onToggleParticipants}
            icon={Users}
            label={`Participants (${participantCount})`}
            badge={participantCount > 0 ? participantCount : null}
          />
        )}

        {showChat && (
          <ControlButton
            isActive={false}
            onClick={onToggleChat}
            icon={MessageSquare}
            label="Chat"
          />
        )}

        <ControlButton
          isActive={false}
          onClick={onSettings}
          icon={Settings}
          label="Settings"
        />
      </div>

      <div className="w-px h-8 bg-white/10 mx-1" />

      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
          <CircleDot className="w-3 h-3 text-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-medium">Recording</span>
        </div>
      )}

      <button
        onClick={onEndCall}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors ml-2"
      >
        <PhoneOff className="w-4 h-4" />
        {isHost ? "End Meeting" : "Leave"}
      </button>
    </div>
  );
}

function ControlButton({
  isActive,
  onClick,
  icon: Icon,
  label,
  variant = "default",
  show = true,
  badge = null,
}) {
  if (!show) return null;

  const baseClasses =
    "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-150";

  const variantClasses = {
    default: "bg-white/10 hover:bg-white/20 text-white",
    active: "bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332]",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} group`}
      title={label}
    >
      <Icon className="w-5 h-5" />
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF7A] text-[#1A2332] text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

export default Controls;
