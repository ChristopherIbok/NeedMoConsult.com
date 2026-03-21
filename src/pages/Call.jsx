import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SEO from "@/components/ui/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users } from "lucide-react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export default function Call() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Local video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  
  // State
  const [status, setStatus] = useState("idle"); // idle, creating, waiting, connected
  const [roomId, setRoomId] = useState("");
  const [hostName, setHostName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Get params
  const action = searchParams.get("action");
  const incomingRoomId = searchParams.get("room");
  const incomingName = searchParams.get("name");

  // Initialize WebRTC
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate
        }));
      }
    };
    
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("connected");
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        setError("Connection lost. Please refresh to try again.");
      }
    };
    
    return pc;
  }, []);

  // Start local video
  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      setError("Camera/microphone access denied. Please allow permissions.");
      return null;
    }
  };

  // Create room (host)
  const createRoom = async () => {
    if (!hostName.trim()) return;
    setIsHost(true);
    setStatus("creating");
    setError(null);
    
    const stream = await startLocalVideo();
    if (!stream) return;
    
    // Connect to signaling server
    const apiUrl = import.meta.env.VITE_API_URL;
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, "")}/ws/call`;
    
    console.log("Connecting to:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    // Timeout for connection
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        setError("Connection timeout. Please ensure the backend is deployed with WebSocket support.");
        ws.close();
      }
    }, 10000);
    
    ws.onopen = async () => {
      clearTimeout(connectionTimeout);
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "create" }));
    };
    
    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received:", msg.type);
      
      if (msg.type === "room-created") {
        setRoomId(msg.roomId);
        setStatus("waiting");
      } else if (msg.type === "peer-joined") {
        // Host creates offer when guest joins
        const pc = createPeerConnection();
        pcRef.current = pc;
        
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        ws.send(JSON.stringify({ type: "offer", sdp: offer }));
      } else if (msg.type === "answer") {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      } else if (msg.type === "ice-candidate") {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.candidate));
      } else if (msg.type === "peer-left") {
        setError("Guest has left the call.");
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        setStatus("waiting");
      }
    };
    
    ws.onerror = (e) => {
      clearTimeout(connectionTimeout);
      console.error("WebSocket error:", e);
      setError("Connection failed. Please ensure the backend is deployed with WebSocket support (Render redeploy needed).");
    };
  };

  // Join room (guest)
  const joinRoom = async () => {
    if (!joinRoomId.trim()) return;
    if (!incomingName) {
      setError("Name required to join");
      return;
    }
    setIsHost(false);
    setIsJoining(true);
    setError(null);
    
    const stream = await startLocalVideo();
    if (!stream) return;
    
    const apiUrl = import.meta.env.VITE_API_URL;
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, "")}/ws/call`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        setError("Connection timeout. Backend may not support WebSockets yet.");
        ws.close();
      }
    }, 10000);
    
    ws.onopen = async () => {
      clearTimeout(connectionTimeout);
      ws.send(JSON.stringify({ type: "join", roomId: joinRoomId }));
    };
    
    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      
      if (msg.type === "joined") {
        setStatus("waiting");
      } else if (msg.type === "offer") {
        const pc = createPeerConnection();
        pcRef.current = pc;
        
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        ws.send(JSON.stringify({ type: "answer", sdp: answer }));
      } else if (msg.type === "ice-candidate") {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.candidate));
      } else if (msg.type === "peer-left") {
        setError("Host has left the call.");
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        setStatus("idle");
      } else if (msg.type === "error") {
        setError(msg.message);
        setStatus("idle");
      }
    };
    
    ws.onerror = () => {
      setError("Connection error. Room may not exist.");
    };
  };

  // Auto-join if room ID in URL
  useEffect(() => {
    if (incomingRoomId && incomingName) {
      setJoinRoomId(incomingRoomId);
      setHostName(incomingName);
      setIsHost(false);
      joinRoom();
    }
    
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Copy link
  const copyLink = () => {
    const link = `${window.location.origin}/call?room=${roomId}&name=${hostName}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Leave call
  const leaveCall = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "leave" }));
      wsRef.current.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    navigate("/");
  };

  // Create Room UI
  if (!incomingRoomId && action === "host") {
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

          {status === "waiting" && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-white text-center mb-4">Share this link with your guest:</p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/call?room=${roomId}&name=${hostName}`}
                  readOnly
                  className="bg-[#0D1117] border-white/10 text-white text-sm"
                />
                <Button onClick={copyLink} variant="outline" className="shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-gray-400 text-sm text-center mt-4">Waiting for guest to join...</p>
              <div className="flex justify-center mt-4">
                <div className="w-8 h-8 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin" />
              </div>
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
  if (!incomingRoomId && action === "join") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#D4AF7A]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join a Meeting</h1>
            <p className="text-gray-400">Enter the room code or use a link</p>
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
              <label className="text-sm text-gray-400 mb-2 block">Room Code</label>
              <Input
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room code"
                className="bg-[#0D1117] border-white/10 text-white h-12"
              />
            </div>

            <Button
              onClick={joinRoom}
              disabled={!hostName.trim() || !joinRoomId.trim() || isJoining}
              className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-white h-12"
            >
              {isJoining ? "Joining..." : "Join Meeting"}
            </Button>
          </div>

          <Button onClick={() => navigate("/")} variant="outline" className="w-full mt-4">
            Cancel
          </Button>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
        <div className="bg-[#161B22] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Call Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-white">
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  // Connecting state
  if (status === "creating" || isJoining) {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF7A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Setting up your call...</p>
          <p className="text-gray-400 text-sm mt-2">Please allow camera and microphone access</p>
        </div>
      </main>
    );
  }

  // Waiting for peer
  if (status === "waiting" && !status === "connected") {
    return (
      <main className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-[#D4AF7A]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isHost ? "Waiting for Guest" : "Connecting..."}
          </h2>
          <p className="text-gray-400 mb-6">
            {isHost 
              ? "Share your link or wait for someone to join"
              : "Setting up video connection..."
            }
          </p>
          
          {isHost && roomId && (
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Your meeting link:</p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/call?room=${roomId}&name=${hostName}`}
                  readOnly
                  className="bg-[#0D1117] border-white/10 text-white text-sm"
                />
                <Button onClick={copyLink} variant="outline" size="icon">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
          
          <Button onClick={leaveCall} variant="outline" className="text-white">
            Leave Call
          </Button>
        </div>
      </main>
    );
  }

  // Main call UI
  return (
    <main className="fixed inset-0 bg-[#0D1117] overflow-hidden">
      <SEO title="Video Call | NEEDMO CONSULT" description="Join your scheduled strategy call" robots="noindex" />
      
      {/* Remote Video */}
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {status !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#161B22]">
            <p className="text-gray-400">Waiting for other participant...</p>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="absolute bottom-24 right-4 w-40 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isVideoOn && (
          <div className="absolute inset-0 bg-[#161B22] flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

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

        {isHost && roomId && (
          <button
            onClick={copyLink}
            className="w-14 h-14 rounded-full bg-[#161B22] hover:bg-[#21262D] flex items-center justify-center transition-all text-white"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Info badge */}
      <div className="absolute top-6 left-6 bg-[#161B22]/80 backdrop-blur-sm rounded-xl px-4 py-2 z-50">
        <p className="text-white font-medium">NEEDMO Strategy Call</p>
        <p className="text-gray-400 text-sm">{status === "connected" ? "Connected" : "Connecting..."}</p>
      </div>
    </main>
  );
}
