import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  MessageSquare,
  Users,
  Heart,
  Eye,
  Settings,
  Maximize2,
  Minimize2,
  Radio,
  CircleDot,
  Send,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";

export function LivestreamRoom({
  client,
  authToken: _authToken,
  role,
  onLeave,
  streamName = "",
}) {
  const isHost = role === "host";

  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [likes, setLikes] = useState(0);
  const [streamQuality, setStreamQuality] = useState("auto");
  const [isMuted, setIsMuted] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (client) {
      client.on("viewer-count", (count) => {
        setViewerCount(count);
      });

      client.on("chat-message", (message) => {
        setChatMessages((prev) => [...prev, message]);
      });

      client.on("like", () => {
        setLikes((prev) => prev + 1);
      });

      return () => {
        client.off("viewer-count");
        client.off("chat-message");
        client.off("like");
      };
    }
  }, [client]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setConnectionQuality(["good", "fair", "good"][Math.floor(Math.random() * 3)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleGoLive = useCallback(async () => {
    if (client && client.goLive) {
      await client.goLive();
      setIsLive(true);
    } else {
      setIsLive(true);
    }
  }, [client]);

  const handleEndStream = useCallback(async () => {
    if (client && client.endStream) {
      await client.endStream();
    }
    setIsLive(false);
    onLeave();
  }, [client, onLeave]);

  const handleLike = useCallback(() => {
    if (client && client.like) {
      client.like();
    }
    setLikes((prev) => prev + 1);
  }, [client]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (chatInput.trim() && client && client.sendChatMessage) {
      client.sendChatMessage(chatInput.trim());
      setChatInput("");
    }
  }, [client, chatInput]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A2332]/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF7A]/10 flex items-center justify-center">
            <span className="text-[#D4AF7A] text-sm font-bold">N</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-sm">
              {streamName || "Livestream"}
            </h1>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              {isLive ? (
                <span className="flex items-center gap-1 text-red-400">
                  <CircleDot className="w-3 h-3 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  Offline
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {viewerCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            connectionQuality === "good" 
              ? "text-green-400 bg-green-400/10" 
              : "text-yellow-400 bg-yellow-400/10"
          }`}>
            <Wifi className="w-3 h-3" />
            {connectionQuality}
          </div>

          <select
            value={streamQuality}
            onChange={(e) => setStreamQuality(e.target.value)}
            className="bg-white/10 text-white text-xs px-2 py-1.5 rounded-lg outline-none border-none"
          >
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
          </select>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-white/60" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white/60" />
            )}
          </button>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          <div className="h-full bg-[#1A2332] rounded-2xl overflow-hidden border border-white/5 relative">
            {isLive ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#D4AF7A] text-3xl font-medium">
                      {streamName?.charAt(0) || "S"}
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg mb-2">
                    {streamName || "Livestream"}
                  </p>
                  <p className="text-white/40 text-sm">
                    {viewerCount.toLocaleString()} watching
                  </p>
                </div>
              </div>
            ) : isHost ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-4">
                    <Radio className="w-10 h-10 text-[#D4AF7A]" />
                  </div>
                  <p className="text-white font-medium text-lg mb-2">
                    Ready to go live
                  </p>
                  <p className="text-white/40 text-sm mb-6">
                    Start streaming when you're ready
                  </p>
                  <button
                    onClick={handleGoLive}
                    className="px-6 py-3 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl transition-colors"
                  >
                    Go Live
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Radio className="w-10 h-10 text-white/30" />
                  </div>
                  <p className="text-white/40 text-lg">
                    Stream hasn't started yet
                  </p>
                </div>
              </div>
            )}

            {isLive && !isHost && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            )}

            {isLive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/80 hover:bg-pink-500 text-white rounded-full transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-medium">{likes.toLocaleString()}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <LivestreamChat
            messages={chatMessages}
            onSendMessage={(text) => {
              if (client && client.sendChatMessage) {
                client.sendChatMessage(text);
              }
            }}
            onClose={() => setShowChat(false)}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendMessage={handleSendMessage}
          />
        )}

        {showViewers && (
          <ViewerList
            viewerCount={viewerCount}
            onClose={() => setShowViewers(false)}
          />
        )}
      </div>

      <div className="p-4 flex justify-center">
        {isHost ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1A2332]/95 backdrop-blur-sm rounded-2xl border border-white/10">
            {isLive ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
                  <CircleDot className="w-3 h-3 text-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-medium">Live</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Eye className="w-4 h-4" />
                  {viewerCount.toLocaleString()}
                </div>
                <button
                  onClick={handleEndStream}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  End Stream
                </button>
              </>
            ) : (
              <button
                onClick={handleGoLive}
                className="px-6 py-2.5 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold rounded-xl transition-colors"
              >
                Go Live
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1A2332]/95 backdrop-blur-sm rounded-2xl border border-white/10">
            <button
              onClick={() => setShowViewers(!showViewers)}
              className={`p-2.5 rounded-xl transition-colors ${
                showViewers
                  ? "bg-[#D4AF7A] text-[#1A2332]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2.5 rounded-xl transition-colors ${
                showChat
                  ? "bg-[#D4AF7A] text-[#1A2332]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-xl transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">{likes.toLocaleString()}</span>
            </button>

            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function handleEndCall() {
  window.location.href = "/";
}

function LivestreamChat({
  messages,
  onSendMessage,
  onClose,
  chatInput,
  setChatInput,
  handleSendMessage,
}) {
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-80 bg-[#1A2332] border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-white font-medium text-sm">Live Chat</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-white/30 text-center text-xs py-8">
            No messages yet. Be the first to chat!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="group">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[#D4AF7A] text-xs font-medium">
                  {msg.senderName || "Anonymous"}
                </span>
                <span className="text-white/30 text-xs">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-white/80 text-sm">{msg.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-[#0D1117] border border-white/10 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/30"
          />
          <button
            type="submit"
            className="p-2 bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ViewerList({ viewerCount, onClose }) {
  return (
    <div className="w-72 bg-[#1A2332] border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-white font-medium text-sm">Viewers</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-2">
            <Eye className="w-8 h-8 text-[#D4AF7A]" />
          </div>
          <p className="text-white font-bold text-2xl">
            {viewerCount.toLocaleString()}
          </p>
          <p className="text-white/40 text-xs">people watching</p>
        </div>

        <p className="text-white/30 text-center text-xs">
          Viewer list is only visible to the host
        </p>
      </div>
    </div>
  );
}

export default LivestreamRoom;
