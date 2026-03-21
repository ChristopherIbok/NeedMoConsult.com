import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Maximize, Copy, Check, Link2 } from "lucide-react";
import { request } from "@/lib/api";

export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const callFrameRef = useRef(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [showHostPanel, setShowHostPanel] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [hostName, setHostName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const action = searchParams.get("action");
  const existingRoomUrl = searchParams.get("room");
  const userName = searchParams.get("name") || "Guest";

  useEffect(() => {
    if (existingRoomUrl) {
      initCall(existingRoomUrl, userName);
    }
  }, [existingRoomUrl, userName]);

  const createRoom = async () => {
    if (!hostName.trim()) return;
    setIsCreatingRoom(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/public/room/create`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create room");
      }
      const data = await res.json();
      const shareUrl = `${window.location.origin}/call?room=${encodeURIComponent(data.url)}&name=${encodeURIComponent(hostName)}`;
      setRoomUrl(shareUrl);
      setShowHostPanel(true);
    } catch (err) {
      setError(err.message || "Failed to create room. Please try again.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const initCall = async (url, name) => {
    let daily = null;
    setIsConnecting(true);

    try {
      const DailyIframe = await import("@daily-co/daily-js").then((m) => m.default);
      
      daily = DailyIframe.createFrame(callFrameRef.current, {
        iframeStyle: {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "0",
          zIndex: "1",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        showParticipantsBar: true,
        showSettingsButton: true,
        userName: name,
      });

      window.daily = daily;

      daily.on("joined-meeting", () => {
        setIsConnecting(false);
        setIsInCall(true);
        updateParticipantCount(daily);
      });

      daily.on("participant-joined", () => updateParticipantCount(daily));
      daily.on("participant-left", () => updateParticipantCount(daily));

      daily.on("error", (e) => {
        setError("Connection error. Please try again.");
        setIsConnecting(false);
      });

      await daily.join({ url });
    } catch (err) {
      setError("Failed to connect. Please check your link and try again.");
      setIsConnecting(false);
    }
  };

  const updateParticipantCount = (daily) => {
    if (daily?.participants) {
      const count = Object.keys(daily.participants()).length;
      setParticipantCount(count);
    }
  };

  const toggleVideo = () => {
    window.daily?.setLocalVideo(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    window.daily?.setLocalAudio(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  };

  const leaveCall = () => {
    window.daily?.leave();
    window.daily?.destroy();
    navigate("/");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showHostPanel) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Meeting Ready!</h1>
            <p className="text-gray-400">Share this link with your guest to start the call</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Your Meeting Link</label>
              <div className="flex gap-2">
                <Input
                  value={roomUrl}
                  readOnly
                  className="bg-[#0D1117] border-white/10 text-white"
                />
                <Button onClick={copyLink} variant="outline" className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => initCall(roomUrl.split("room=")[1]?.split("&")[0], hostName)}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white h-12"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Meeting Now
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <p className="text-sm text-gray-400">
              <strong className="text-white">Tip:</strong> Copy the link and send it to your guest via email or messaging app. 
              When they're ready, you can start the meeting and they'll join automatically.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (action === "host" && !existingRoomUrl) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Start a Meeting</h1>
            <p className="text-gray-400">Create a room and get a link to share</p>
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
              disabled={!hostName.trim() || isCreatingRoom}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white h-12"
            >
              {isCreatingRoom ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Video className="w-4 h-4 mr-2" />
              )}
              Create Meeting
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    );
  }

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

  if (isConnecting) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to your call...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up video and audio</p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-[#0D1117] overflow-hidden">
      <SEO title="Video Call | NEEDMO CONSULT" description="Join your scheduled strategy call" robots="noindex" />
      
      <div ref={callFrameRef} className="w-full h-full" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button onClick={toggleAudio} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOn ? "bg-[#161B22] hover:bg-[#21262D] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button onClick={leaveCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all text-white">
          <PhoneOff className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-[#161B22] flex items-center justify-center text-white">
          <Users className="w-5 h-5" />
        </div>

        <button onClick={() => window.daily?.toggleFullscreen()} className="w-14 h-14 rounded-full bg-[#161B22] hover:bg-[#21262D] flex items-center justify-center transition-all text-white">
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-6 left-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50">
        <p className="text-white font-medium">NEEDMO Strategy Call</p>
        <p className="text-gray-400 text-sm">{participantCount} participant{participantCount !== 1 ? "s" : ""}</p>
      </div>

      <button onClick={copyLink} className="absolute top-6 right-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50 flex items-center gap-2 hover:bg-[#21262D] transition-colors">
        <Link2 className="w-4 h-4 text-[#D4AF7A]" />
        <span className="text-white text-sm">Copy Link</span>
      </button>
    </main>
  );
}
