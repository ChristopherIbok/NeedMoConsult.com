import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";

const STATIC_ROOM_URL = "https://needmo.daily.co/consult";

export default function Call() {
  const navigate = useNavigate();
  
  const callFrameRef = useRef(null);
  const dailyRef = useRef(null);
  
  const [status, setStatus] = useState("idle"); // idle, connecting, connected
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const initCall = async (userName) => {
    setStatus("connecting");
    setError(null);
    
    try {
      const DailyIframe = await import("@daily-co/daily-js").then(m => m.default);
      
      const daily = DailyIframe.createFrame(callFrameRef.current, {
        iframeStyle: {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "0",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        showParticipantsBar: true,
        userName: userName,
      });
      
      dailyRef.current = daily;
      
      daily.on("joined-meeting", () => {
        setStatus("connected");
      });
      
      daily.on("error", (e) => {
        console.error("Daily error:", e);
        setError("Connection error. Please try again.");
        setStatus("idle");
      });
      
      daily.on("left-meeting", () => {
        if (dailyRef.current) {
          dailyRef.current.destroy();
          dailyRef.current = null;
        }
        navigate("/");
      });
      
      await daily.join({ url: STATIC_ROOM_URL });
    } catch (err) {
      setError("Failed to connect. Please check your link and try again.");
      setStatus("idle");
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    initCall(name.trim());
  };

  useEffect(() => {
    return () => {
      if (dailyRef.current) {
        dailyRef.current.destroy();
      }
    };
  }, []);

  const toggleVideo = () => {
    if (dailyRef.current) {
      dailyRef.current.setLocalVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (dailyRef.current) {
      dailyRef.current.setLocalAudio(!isAudioOn);
      setIsAudioOn(!isAudioOn);
    }
  };

  const leaveCall = () => {
    if (dailyRef.current) {
      dailyRef.current.leave();
      dailyRef.current.destroy();
      dailyRef.current = null;
    }
    navigate("/");
  };

  // Error State
  if (error) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Unable to Join Call</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-semibold py-3 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Connecting
  if (status === "connecting") {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Joining meeting...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up video</p>
        </div>
      </main>
    );
  }

  // Join Form
  if (status === "idle") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Strategy Call</h1>
            <p className="text-gray-400">Enter your name to join the meeting</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg outline-none focus:border-[#D4AF7A] transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A2332] font-semibold py-3 rounded-xl transition-colors text-lg"
            >
              Join Meeting
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-4 text-gray-400 hover:text-white py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </main>
    );
  }

  // Main Call UI
  return (
    <main className="fixed inset-0 bg-[#0D1117] overflow-hidden">
      <SEO title="Video Call | NEEDMO CONSULT" robots="noindex" />
      
      <div ref={callFrameRef} className="absolute inset-0 w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isAudioOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={leaveCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Info badge */}
      <div className="absolute top-6 left-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50">
        <p className="text-white font-medium">NEEDMO Strategy Call</p>
        <p className="text-gray-400 text-sm">{status === "connected" ? "Connected" : "Connecting..."}</p>
      </div>
    </main>
  );
}
