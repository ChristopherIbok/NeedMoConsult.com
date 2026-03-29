import { useEffect, useRef } from "react";
import { MicOff, VideoOff, User } from "lucide-react";

interface VideoTileProps {
  videoTrack?: MediaStreamTrack | null;
  audioTrack?: MediaStreamTrack | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  name: string;
  isSelf?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function VideoTile({
  videoTrack,
  audioTrack,
  isVideoEnabled,
  isAudioEnabled,
  name,
  isSelf = false,
  size = "md",
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attach video track to the video element
  useEffect(() => {
    if (!videoRef.current) return;
    if (videoTrack && isVideoEnabled) {
      const stream = new MediaStream([videoTrack]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.srcObject = null;
    }
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [videoTrack, isVideoEnabled]);

  // Attach remote audio track (never for self to avoid echo)
  useEffect(() => {
    if (isSelf || !audioRef.current) return;
    if (audioTrack && isAudioEnabled) {
      const stream = new MediaStream([audioTrack]);
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    } else {
      if (audioRef.current) audioRef.current.srcObject = null;
    }
    return () => {
      if (audioRef.current) audioRef.current.srcObject = null;
    };
  }, [audioTrack, isAudioEnabled, isSelf]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden bg-[#111827] border border-white/5
        flex items-center justify-center group
        ${size === "lg" ? "aspect-video w-full" : ""}
        ${size === "md" ? "aspect-video" : ""}
        ${size === "sm" ? "aspect-video" : ""}
      `}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isVideoEnabled && videoTrack ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
      />

      {/* Hidden audio for remote peers */}
      {!isSelf && <audio ref={audioRef} autoPlay playsInline className="hidden" />}

      {/* Avatar fallback when video is off */}
      {(!isVideoEnabled || !videoTrack) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#111827]">
          <div className="w-14 h-14 rounded-full bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 flex items-center justify-center">
            <span className="text-[#D4AF7A] font-bold text-lg tracking-wide">{initials}</span>
          </div>
          <span className="text-white/40 text-xs">{name}</span>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span className="text-white/80 text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
          {name}
          {isSelf && <span className="text-white/40 ml-1">(You)</span>}
        </span>
      </div>

      {/* Status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {!isAudioEnabled && (
          <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {!isVideoEnabled && (
          <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <VideoOff className="w-3 h-3 text-white/60" />
          </div>
        )}
      </div>

      {/* Speaking indicator (subtle border pulse when audio active) */}
      {isAudioEnabled && !isSelf && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#D4AF7A]/0 group-has-[audio:active]:border-[#D4AF7A]/60 pointer-events-none" />
      )}
    </div>
  );
}
