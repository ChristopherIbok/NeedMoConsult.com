import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Maximize } from "lucide-react";

export default function Call() {
  const [searchParams] = useSearchParams();
  const callFrameRef = useRef(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);

  const roomUrl = searchParams.get("room");
  const userName = searchParams.get("name") || "Guest";
  const isHost = searchParams.get("host") === "true";

  useEffect(() => {
    let daily = null;

    const initCall = async () => {
      if (!roomUrl) {
        setError("No room URL provided. Please use the link from your booking confirmation.");
        setIsConnecting(false);
        return;
      }

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
          showScreenShareButton: true,
          showSettingsButton: true,
          userName: userName,
        });

        window.daily = daily;

        daily.on("joined-meeting", () => {
          setIsConnecting(false);
          updateParticipantCount(daily);
        });

        daily.on("participant-joined", () => {
          updateParticipantCount(daily);
        });

        daily.on("participant-left", () => {
          updateParticipantCount(daily);
        });

        daily.on("error", (e) => {
          console.error("Daily.co error:", e);
          setError("Connection error. Please check your internet and try again.");
          setIsConnecting(false);
        });

        await daily.join({ url: roomUrl });
      } catch (err) {
        console.error("Failed to initialize call:", err);
        setError("Failed to connect to the meeting. Please check your link and try again.");
        setIsConnecting(false);
      }
    };

    const updateParticipantCount = (daily) => {
      if (daily && daily.participants) {
        const participants = daily.participants();
        const count = Object.keys(participants).length;
        setParticipantCount(count);
      }
    };

    initCall();

    return () => {
      if (daily) {
        daily.destroy();
        window.daily = null;
      }
    };
  }, [roomUrl, userName]);

  const toggleVideo = () => {
    if (window.daily) {
      window.daily.setLocalVideo(isVideoOn ? false : true);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (window.daily) {
      window.daily.setLocalAudio(isAudioOn ? false : true);
      setIsAudioOn(!isAudioOn);
    }
  };

  const leaveCall = () => {
    if (window.daily) {
      window.daily.leave();
      window.daily.destroy();
    }
    window.location.href = "/";
  };

  if (error) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Unable to Join Call</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={leaveCall} className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-white">
            Return Home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-[#0D1117] overflow-hidden">
      <SEO
        title="Video Call | NEEDMO CONSULT"
        description="Join your scheduled strategy call"
        robots="noindex"
      />
      
      <div ref={callFrameRef} className="w-full h-full" />

      {isConnecting && (
        <div className="absolute inset-0 bg-[#0D1117] flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Connecting to your call...</p>
            <p className="text-gray-400 text-sm mt-2">Setting up video and audio</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isAudioOn 
              ? "bg-[#161B22] hover:bg-[#21262D] text-white" 
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isVideoOn 
              ? "bg-[#161B22] hover:bg-[#21262D] text-white" 
              : "bg-red-500 hover:bg-red-600 text-white"
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

        <div className="w-14 h-14 rounded-full bg-[#161B22] flex items-center justify-center text-white">
          <Users className="w-5 h-5" />
        </div>

        <button
          onClick={() => window.daily?.toggleFullscreen()}
          className="w-14 h-14 rounded-full bg-[#161B22] hover:bg-[#21262D] flex items-center justify-center transition-all text-white"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-6 left-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50">
        <p className="text-white font-medium">NEEDMO Strategy Call</p>
        <p className="text-gray-400 text-sm">{participantCount} participant{participantCount !== 1 ? "s" : ""}</p>
      </div>

      {isHost && (
        <div className="absolute top-6 right-6 bg-[#D4AF7A]/20 border border-[#D4AF7A] rounded-xl px-4 py-2 z-50">
          <p className="text-[#D4AF7A] font-medium text-sm">Host Controls</p>
        </div>
      )}
    </main>
  );
}
