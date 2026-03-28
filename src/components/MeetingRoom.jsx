import React, { useState, useEffect, useCallback } from "react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { RealtimeKitProvider } from "@cloudflare/realtimekit-react";
import Controls from "./Controls";
import {
  X,
  Settings,
  Maximize2,
  Minimize2,
  CircleDot,
} from "lucide-react";

export function MeetingRoom({
  client,
  authToken,
  isHost,
  onLeave,
  meetingName = "",
}) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (client) {
      client.on("participant-joined", (participant) => {
        setParticipants((prev) => [...prev, participant]);
      });

      client.on("participant-left", (participant) => {
        setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      });

      client.on("chat-message", (message) => {
        setChatMessages((prev) => [...prev, message]);
      });

      return () => {
        client.off("participant-joined");
        client.off("participant-left");
        client.off("chat-message");
      };
    }
  }, [client]);

  const handleToggleAudio = useCallback(async () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    if (client) {
      await client.setAudioEnabled(newState);
    }
  }, [client, isAudioEnabled]);

  const handleToggleVideo = useCallback(async () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    if (client) {
      await client.setVideoEnabled(newState);
    }
  }, [client, isVideoEnabled]);

  const handleToggleScreenShare = useCallback(async () => {
    const newState = !isScreenSharing;
    setIsScreenSharing(newState);
    if (client) {
      await client.setScreenShareEnabled(newState);
    }
  }, [client, isScreenSharing]);

  const handleToggleHand = useCallback(() => {
    setIsHandRaised(!isHandRaised);
    if (client && client.raiseHand) {
      client.raiseHand(!isHandRaised);
    }
  }, [client, isHandRaised]);

  const handleToggleParticipants = useCallback(() => {
    setShowParticipants(!showParticipants);
    if (showChat) setShowChat(false);
  }, [showParticipants, showChat]);

  const handleToggleChat = useCallback(() => {
    setShowChat(!showChat);
    if (showParticipants) setShowParticipants(false);
  }, [showParticipants, showChat]);

  const handleEndCall = useCallback(async () => {
    if (client) {
      await client.disconnect();
    }
    onLeave();
  }, [client, onLeave]);

  const handleStartRecording = useCallback(async () => {
    if (client && client.startRecording) {
      await client.startRecording();
      setIsRecording(true);
    }
  }, [client]);

  const handleStopRecording = useCallback(async () => {
    if (client && client.stopRecording) {
      await client.stopRecording();
      setIsRecording(false);
    }
  }, [client]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (!authToken || !client) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-white/40">Loading meeting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A2332]/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF7A]/10 flex items-center justify-center">
            <span className="text-[#D4AF7A] text-sm font-bold">N</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-sm">
              {meetingName || "Video Conference"}
            </h1>
            <p className="text-white/40 text-xs">
              {participants.length + 1} participants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full mr-2">
              <CircleDot className="w-3 h-3 text-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-medium">Recording</span>
            </div>
          )}

          {isHost && (
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          )}

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
          <div className="h-full bg-[#1A2332] rounded-2xl overflow-hidden border border-white/5">
            <RealtimeKitProvider value={client}>
              <RtkMeeting
                mode="grid"
                showSetupScreen={false}
                className="h-full"
              />
            </RealtimeKitProvider>
          </div>
        </div>

        {showParticipants && (
          <ParticipantPanel
            participants={participants}
            currentUser={{ isHost }}
            onClose={() => setShowParticipants(false)}
          />
        )}

        {showChat && (
          <ChatPanel
            messages={chatMessages}
            currentUser={{ name: "You" }}
            onSendMessage={(text) => {
              if (client && client.sendChatMessage) {
                client.sendChatMessage(text);
              }
            }}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>

      <div className="p-4 flex justify-center">
        <Controls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isHandRaised={isHandRaised}
          isHost={isHost}
          isRecording={isRecording}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={handleEndCall}
          onToggleParticipants={handleToggleParticipants}
          onToggleChat={handleToggleChat}
          onToggleHand={handleToggleHand}
          onSettings={() => {}}
          participantCount={participants.length + 1}
        />
      </div>
    </div>
  );
}

function ParticipantPanel({ participants, currentUser, onClose }) {
  const allParticipants = [
    { id: "self", name: "You (You)", isSelf: true, ...currentUser },
    ...participants.map((p) => ({ ...p, name: p.name || "Anonymous" })),
  ];

  return (
    <div className="w-72 bg-[#1A2332] border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-white font-medium text-sm">Participants</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {allParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center">
              <span className="text-[#D4AF7A] text-xs font-medium">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">
                {participant.name}
                {participant.isSelf && (
                  <span className="text-white/40 ml-1">(You)</span>
                )}
              </p>
              {participant.isHost && (
                <span className="text-[#D4AF7A] text-xs">Host</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!participant.audioEnabled && (
                <span className="text-white/30 text-xs">🔇</span>
              )}
              {!participant.videoEnabled && (
                <span className="text-white/30 text-xs">📷</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ messages, currentUser, onSendMessage, onClose }) {
  const [input, setInput] = useState("");
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="w-72 bg-[#1A2332] border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-white font-medium text-sm">Chat</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-white/30 text-center text-xs py-8">
            No messages yet
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="group">
              <div className="flex items-baseline gap-2 mb-1">
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

      <form onSubmit={handleSend} className="p-3 border-t border-white/5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/30"
        />
      </form>
    </div>
  );
}

export default MeetingRoom;
