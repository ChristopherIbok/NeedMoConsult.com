import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Users,
  Radio,
  Globe,
  Check,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const MODES = {
  conference: {
    id: "conference",
    label: "Video Conference",
    description: "Interactive meeting with up to 12 participants",
    icon: Users,
  },
  webinar: {
    id: "webinar",
    label: "Webinar",
    description: "One-to-many presentation with Q&A",
    icon: Radio,
  },
  livestream: {
    id: "livestream",
    label: "Livestream",
    description: "Broadcast to unlimited viewers",
    icon: Globe,
  },
};

const ROLES = {
  host: { id: "host", label: "Host", description: "Full control over the meeting" },
  participant: { id: "participant", label: "Participant", description: "Can interact and speak" },
  viewer: { id: "viewer", label: "Viewer", description: "Watch-only mode" },
};

export function PreJoinScreen({
  mode: initialMode = "conference",
  role: initialRole = "participant",
  onJoin,
  loading,
  error,
  isHost = false,
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomName, setRoomName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (camOn && !streamRef.current) {
      initializeMedia();
    }
    return () => {
      stopMedia();
    };
  }, [camOn, selectedVideoDevice, selectedAudioDevice]);

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: selectedVideoDevice
          ? { deviceId: { exact: selectedVideoDevice } }
          : true,
        audio: selectedAudioDevice
          ? { deviceId: { exact: selectedAudioDevice } }
          : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        video: deviceList.filter((d) => d.kind === "videoinput"),
        audio: deviceList.filter((d) => d.kind === "audioinput"),
      });
    } catch (err) {
      console.error("Failed to get media devices:", err);
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const requiresEmail = mode === "webinar" || mode === "livestream";
    if (requiresEmail && !email.trim()) return;

    onJoin({
      name: name.trim(),
      email: email.trim(),
      mode,
      role: isHost ? role : initialRole,
      roomName: roomName.trim(),
      micEnabled: micOn,
      camEnabled: camOn,
    });
  };

  const canSelectRole = isHost && mode !== "livestream";

  return (
    <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#D4AF7A 1px, transparent 1px), linear-gradient(90deg, #D4AF7A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Join or Start a Call
          </h1>
          <p className="text-white/50 text-sm">
            Select your meeting type and enter your details
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative aspect-video bg-[#1A2332] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              {camOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/10 flex items-center justify-center">
                    <VideoOff className="w-7 h-7 text-[#D4AF7A]/60" />
                  </div>
                  <span className="text-white/40 text-sm">Camera is off</span>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <ControlBtn
                  active={micOn}
                  onClick={() => setMicOn(!micOn)}
                  icon={micOn ? Mic : MicOff}
                  variant={micOn ? "default" : "danger"}
                />
                <ControlBtn
                  active={camOn}
                  onClick={() => setCamOn(!camOn)}
                  icon={camOn ? Video : VideoOff}
                  variant={camOn ? "default" : "danger"}
                />
                <ControlBtn
                  active={showSettings}
                  onClick={() => setShowSettings(!showSettings)}
                  icon={Settings}
                />
              </div>

              {showSettings && (
                <div className="absolute top-4 right-4 bg-[#1A2332]/95 backdrop-blur-sm rounded-xl p-4 w-64 border border-white/10">
                  <h3 className="text-white text-sm font-medium mb-3">
                    Device Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">
                        Camera
                      </label>
                      <select
                        value={selectedVideoDevice}
                        onChange={(e) => setSelectedVideoDevice(e.target.value)}
                        className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#D4AF7A]/60"
                      >
                        <option value="">Default Camera</option>
                        {devices.video.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs mb-1 block">
                        Microphone
                      </label>
                      <select
                        value={selectedAudioDevice}
                        onChange={(e) => setSelectedAudioDevice(e.target.value)}
                        className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#D4AF7A]/60"
                      >
                        <option value="">Default Microphone</option>
                        {devices.audio.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-4 justify-center">
              <StatusIndicator active={micOn} icon={Mic} label={micOn ? "Mic on" : "Muted"} />
              <div className="w-px h-4 bg-white/10" />
              <StatusIndicator active={camOn} icon={Video} label={camOn ? "Camera on" : "Camera off"} />
            </div>
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-[#1A2332] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-[#D4AF7A]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-none">
                    {isHost ? "Start Meeting" : "Join Meeting"}
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">
                    {isHost ? "You are the host" : "Enter your details to join"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/50 text-xs font-medium mb-2 block">
                    Meeting Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(MODES).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          mode === m.id
                            ? "bg-[#D4AF7A]/20 border-[#D4AF7A] text-[#D4AF7A]"
                            : "bg-[#0D1117] border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <m.icon className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs font-medium">{m.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {canSelectRole && (
                  <div>
                    <label className="text-white/50 text-xs font-medium mb-2 block">
                      Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(ROLES)
                        .filter((r) => r.id !== "viewer")
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`p-2 rounded-xl border text-center transition-all ${
                              role === r.id
                                ? "bg-[#D4AF7A]/20 border-[#D4AF7A] text-[#D4AF7A]"
                                : "bg-[#0D1117] border-white/10 text-white/60 hover:border-white/20"
                            }`}
                          >
                            <span className="text-xs font-medium">{r.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {isHost && (
                  <div>
                    <label className="text-white/50 text-xs font-medium mb-1.5 block">
                      Room Name (optional)
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g. Strategy Call Q2"
                      className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/20 transition-colors"
                    />
                  </div>
                )}

                {(mode === "webinar" || mode === "livestream") && (
                  <div>
                    <label className="text-white/50 text-xs font-medium mb-1.5 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/20 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-white/50 text-xs font-medium mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/20 transition-colors"
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
                  disabled={
                    !name.trim() ||
                    ((mode === "webinar" || mode === "livestream") && !email.trim()) ||
                    loading
                  }
                  className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] disabled:opacity-40 disabled:cursor-not-allowed text-[#1A2332] font-bold py-3.5 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-[#D4AF7A]/20 mt-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#1A2332]/30 border-t-[#1A2332] rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {isHost ? "Start Meeting" : "Join Meeting"}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ControlBtn({ active, onClick, icon: Icon, variant = "default" }) {
  const variantClasses = {
    default: "bg-white/20 hover:bg-white/30 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        variantClasses[variant]
      } ${active ? "" : "bg-red-500 hover:bg-red-600 text-white"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function StatusIndicator({ active, icon: Icon, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${active ? "text-white/40" : "text-red-400"}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}

export default PreJoinScreen;
