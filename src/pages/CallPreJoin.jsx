import React, { useEffect, useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  AlertCircle,
  Check,
} from "lucide-react";

export default function PreJoinScreen({ isHost, onJoin, loading, error }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

            <div className="absolute top-3 left-3 bg-black/50 px-2 py-0.5 rounded text-white/50 text-[10px] font-semibold uppercase tracking-widest">
              Preview
            </div>
          </div>

          <p className="text-white/30 text-xs text-center mt-3">
            {camOn ? "Others will see you like this" : "Start video when you're ready"}
          </p>
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
