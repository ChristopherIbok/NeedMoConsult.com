import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users } from "lucide-react";

export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const callFrameRef = useRef(null);
  const dailyRef = useRef(null);
  
  const [status, setStatus] = useState("idle");
  const [roomUrl, setRoomUrl] = useState("");
  const [hostName, setHostName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHost, setIsHost] = useState(false);
  
  const action = searchParams.get("action");
  const incomingRoomUrl = searchParams.get("room");
  const incomingName = searchParams.get("name");

  const createRoom = async () => {
    if (!hostName.trim()) return;
    setIsHost(true);
    setStatus("creating");
    setError(null);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/public/room/create`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create room");
      }
      const data = await res.json();
      const shareUrl = `${window.location.origin}/call?room=${encodeURIComponent(data.url)}&name=${encodeURIComponent(hostName)}&host=true`;
      setRoomUrl(shareUrl);
      setStatus("waiting");
    } catch (err) {
      setError(err.message || "Failed to create room. Please try again.");
      setStatus("idle");
    }
  };

  const initCall = async (url, name, isHostUser = false) => {
    setIsConnecting(true);
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
        userName: name,
      });
      
      dailyRef.current = daily;
      
      daily.on("joined-meeting", () => {
        setIsConnecting(false);
        setStatus("connected");
      });
      
      daily.on("error", (e) => {
        console.error("Daily error:", e);
        setError("Connection error. Please try again.");
        setIsConnecting(false);
      });
      
      daily.on("left-meeting", () => {
        if (dailyRef.current) {
          dailyRef.current.destroy();
          dailyRef.current = null;
        }
        navigate("/");
      });
      
      await daily.join({ url });
    } catch (err) {
      setError("Failed to connect. Please check your link and try again.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (incomingRoomUrl && incomingName) {
      setIsHost(incomingRoomUrl.includes("host=true"));
      initCall(decodeURIComponent(incomingRoomUrl), incomingName);
    }
    
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

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Host: Create Room UI
  if (!incomingRoomUrl && action === "host") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Start a Meeting</h1>
            <p className="text-gray-400">Create a room and share the link</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="bg-[#0D1117] border-white/10 text-white h-12"
              />
            </div>

            <Button
              onClick={createRoom}
              disabled={!hostName.trim() || status === "creating"}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white h-12"
            >
              {status === "creating" ? "Creating..." : "Create Meeting"}
            </Button>
          </div>

          {status === "waiting" && roomUrl && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-white text-center mb-4">Share this link with your guest:</p>
              <div className="flex gap-2">
                <Input value={roomUrl} readOnly className="bg-[#0D1117] border-white/10 text-white text-sm" />
                <Button onClick={copyLink} variant="outline" className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={() => initCall(decodeURIComponent(roomUrl.split("room=")[1]?.split("&")[0]), hostName, true)}
                className="w-full mt-4 bg-[#D4AF7A] hover:bg-[#C49A5E] text-white"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Meeting
              </Button>
            </div>
          )}

          <Button onClick={() => navigate("/")} variant="outline" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      </main>
    );
  }

  // Join Room UI
  if (!incomingRoomUrl && action === "join") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join a Meeting</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Your Name</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="bg-[#0D1117] border-white/10 text-white h-12"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Room URL</label>
              <Input
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Paste meeting link"
                className="bg-[#0D1117] border-white/10 text-white h-12"
              />
            </div>

            <Button
              onClick={() => {
                const room = joinRoomId.includes("room=") ? decodeURIComponent(joinRoomId.split("room=")[1]?.split("&")[0]) : joinRoomId;
                initCall(room, hostName);
              }}
              disabled={!hostName.trim() || !joinRoomId.trim()}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white h-12"
            >
              Join Meeting
            </Button>
          </div>

          <Button onClick={() => navigate("/")} variant="outline" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      </main>
    );
  }

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
          <Button onClick={() => navigate("/")} className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-white">
            Return Home
          </Button>
        </div>
      </main>
    );
  }

  // Connecting
  if (isConnecting) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to your call...</p>
        </div>
      </main>
    );
  }

  // Main Call UI
  return (
    <main className="fixed inset-0 bg-[#0D1117] overflow-hidden">
      <SEO title="Video Call | NEEDMO CONSULT" robots="noindex" />
      
      <div ref={callFrameRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={leaveCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        {isHost && roomUrl && (
          <button
            onClick={copyLink}
            className="w-14 h-14 rounded-full bg-[#161B22] hover:bg-[#21262D] flex items-center justify-center transition-all text-white"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="absolute top-6 left-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50">
        <p className="text-white font-medium">NEEDMO Strategy Call</p>
        <p className="text-gray-400 text-sm">{status === "connected" ? "Connected" : "Connecting..."}</p>
      </div>
    </main>
  );
}
