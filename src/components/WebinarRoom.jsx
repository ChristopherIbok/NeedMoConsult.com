import React, { useState, useEffect, useCallback } from "react";
import Controls from "./Controls";
import {
  X,
  Users,
  Hand,
  MicOff,
  Star,
  HelpCircle,
  CircleDot,
  Pin,
  Minus,
} from "lucide-react";

export function WebinarRoom({
  client,
  authToken,
  role,
  onLeave,
  webinarName = "",
}) {
  const isHost = role === "host";
  const isModerator = role === "host" || role === "moderator";

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQA, setShowQA] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [qaQuestions, setQaQuestions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [spotlightedParticipant, setSpotlightedParticipant] = useState(null);

  useEffect(() => {
    if (client) {
      client.on("participant-joined", (participant) => {
        setParticipants((prev) => [...prev, participant]);
      });

      client.on("participant-left", (participant) => {
        setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      });

      client.on("qa-question", (question) => {
        setQaQuestions((prev) => [...prev, question]);
      });

      client.on("chat-message", (message) => {
        setChatMessages((prev) => [...prev, message]);
      });

      return () => {
        client.off("participant-joined");
        client.off("participant-left");
        client.off("qa-question");
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

  const handleEndCall = useCallback(async () => {
    if (client) {
      await client.disconnect();
    }
    onLeave();
  }, [client, onLeave]);

  const handleSpotlight = useCallback((participantId) => {
    setSpotlightedParticipant(
      spotlightedParticipant === participantId ? null : participantId
    );
  }, [spotlightedParticipant]);

  const handleRemoveParticipant = useCallback(async (participantId) => {
    if (client && client.removeParticipant) {
      await client.removeParticipant(participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    }
  }, [client]);

  const handleMuteParticipant = useCallback(async (participantId) => {
    if (client && client.muteParticipant) {
      await client.muteParticipant(participantId);
    }
  }, [client]);

  const handleToggleQA = useCallback(() => {
    setShowQA(!showQA);
    if (showChat) setShowChat(false);
  }, [showQA, showChat]);

  const handleToggleChat = useCallback(() => {
    setShowChat(!showChat);
    if (showQA) setShowQA(false);
  }, [showChat, showQA]);

  const handleSubmitQuestion = useCallback((question) => {
    if (client && client.submitQuestion) {
      client.submitQuestion(question);
    }
  }, [client]);

  const handleAnswerQuestion = useCallback((questionId, answer) => {
    if (client && client.answerQuestion) {
      client.answerQuestion(questionId, answer);
      setQaQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answered: true, answer } : q))
      );
    }
  }, [client]);

  if (!authToken || !client) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-white/40">Loading webinar...</div>
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
              {webinarName || "Webinar"}
            </h1>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Users className="w-3 h-3" />
              <span>{participants.length + 1} watching</span>
              <span className="text-[#D4AF7A]">• {role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF7A]/20 rounded-full">
              <CircleDot className="w-3 h-3 text-[#D4AF7A] animate-pulse" />
              <span className="text-[#D4AF7A] text-xs font-medium">Live</span>
            </div>
          )}

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showParticipants
                ? "bg-[#D4AF7A] text-[#1A2332]"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Users className="w-3 h-3 inline mr-1" />
            {participants.length + 1}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4">
          {isHost ? (
            <HostStageView
              participants={participants}
              client={client}
              spotlightedParticipant={spotlightedParticipant}
              onSpotlight={handleSpotlight}
              onRemove={handleRemoveParticipant}
              onMute={handleMuteParticipant}
            />
          ) : (
            <ParticipantStageView
              participants={participants}
              spotlightedParticipant={spotlightedParticipant}
            />
          )}
        </div>

        {showParticipants && (
          <WebinarParticipantPanel
            participants={participants}
            isHost={isHost}
            onClose={() => setShowParticipants(false)}
            onSpotlight={handleSpotlight}
            onRemove={handleRemoveParticipant}
            onMute={handleMuteParticipant}
          />
        )}

        {showQA && (
          <QAPanel
            questions={qaQuestions}
            isModerator={isModerator}
            onSubmitQuestion={handleSubmitQuestion}
            onAnswerQuestion={handleAnswerQuestion}
            onClose={() => setShowQA(false)}
          />
        )}

        {showChat && (
          <WebinarChatPanel
            messages={chatMessages}
            isModerator={isModerator}
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
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={handleEndCall}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
          onToggleChat={handleToggleChat}
          onToggleHand={handleToggleHand}
          onSettings={() => {}}
          showParticipants={true}
          showChat={true}
          participantCount={participants.length + 1}
        />
      </div>
    </div>
  );
}

function HostStageView({
  participants,
  client,
  spotlightedParticipant,
  onSpotlight,
  onRemove,
  onMute,
}) {
  const hosts = participants.filter((p) => p.role === "host");
  const speakers = participants.filter((p) => p.role === "speaker");

  return (
    <div className="h-full bg-[#1A2332] rounded-2xl overflow-hidden border border-white/5 p-4">
      <h3 className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">
        Stage
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {hosts.map((participant) => (
          <div
            key={participant.id}
            className={`relative aspect-video bg-[#0D1117] rounded-xl overflow-hidden border-2 ${
              spotlightedParticipant === participant.id
                ? "border-[#D4AF7A]"
                : "border-transparent"
            }`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center">
                <span className="text-[#D4AF7A] text-lg font-medium">
                  {participant.name?.charAt(0) || "H"}
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded">
                {participant.name}
              </span>
              <div className="flex items-center gap-1">
                {!participant.audioEnabled && (
                  <MicOff className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button
                onClick={() => onSpotlight(participant.id)}
                className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg"
                title={spotlightedParticipant === participant.id ? "Unspotlight" : "Spotlight"}
              >
                {spotlightedParticipant === participant.id ? (
                  <Minus className="w-3 h-3 text-[#D4AF7A]" />
                ) : (
                  <Pin className="w-3 h-3 text-white" />
                )}
              </button>
              <button
                onClick={() => onMute(participant.id)}
                className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg"
                title="Mute"
              >
                <MicOff className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={() => onRemove(participant.id)}
                className="p-1.5 bg-red-500/50 hover:bg-red-500 rounded-lg"
                title="Remove"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {speakers.length > 0 && (
        <>
          <h3 className="text-white/60 text-xs font-medium mt-6 mb-3 uppercase tracking-wider">
            Speakers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {speakers.map((participant) => (
              <SpeakerTile
                key={participant.id}
                participant={participant}
                onSpotlight={() => onSpotlight(participant.id)}
                onMute={() => onMute(participant.id)}
                onRemove={() => onRemove(participant.id)}
              />
            ))}
          </div>
        </>
      )}

      <h3 className="text-white/60 text-xs font-medium mt-6 mb-3 uppercase tracking-wider">
        Attendees ({participants.filter((p) => !p.role).length})
      </h3>
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {participants
          .filter((p) => !p.role)
          .slice(0, 20)
          .map((participant) => (
            <div
              key={participant.id}
              className="aspect-square bg-[#0D1117] rounded-lg flex items-center justify-center relative group"
            >
              <span className="text-white/60 text-xs">
                {participant.name?.charAt(0) || "?"}
              </span>
              {participant.handRaised && (
                <Hand className="absolute top-1 right-1 w-3 h-3 text-[#D4AF7A]" />
              )}
            </div>
          ))}
        {participants.filter((p) => !p.role).length > 20 && (
          <div className="aspect-square bg-[#0D1117] rounded-lg flex items-center justify-center">
            <span className="text-white/40 text-xs">
              +{participants.filter((p) => !p.role).length - 20}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakerTile({ participant, onSpotlight, onMute, onRemove }) {
  return (
    <div className="aspect-video bg-[#0D1117] rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white text-sm">
            {participant.name?.charAt(0) || "S"}
          </span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded truncate">
          {participant.name}
        </span>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button
          onClick={onSpotlight}
          className="p-1 bg-black/50 hover:bg-black/70 rounded"
        >
          <Pin className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={onMute}
          className="p-1 bg-black/50 hover:bg-black/70 rounded"
        >
          <MicOff className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={onRemove}
          className="p-1 bg-red-500/50 hover:bg-red-500 rounded"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}

function ParticipantStageView({ participants, spotlightedParticipant }) {
  const hosts = participants.filter((p) => p.role === "host");

  return (
    <div className="h-full bg-[#1A2332] rounded-2xl overflow-hidden border border-white/5 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {spotlightedParticipant ? (
          <div className="col-span-full aspect-video bg-[#0D1117] rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-[#D4AF7A] text-2xl font-medium">
                  {spotlightedParticipant.name?.charAt(0) || "H"}
                </span>
              </div>
              <p className="text-white font-medium">
                {spotlightedParticipant.name}
              </p>
              {spotlightedParticipant.role === "host" && (
                <span className="text-[#D4AF7A] text-xs">Host</span>
              )}
            </div>
          </div>
        ) : hosts.length > 0 ? (
          hosts.map((host) => (
            <div
              key={host.id}
              className="aspect-video bg-[#0D1117] rounded-xl flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#D4AF7A]/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-[#D4AF7A] text-xl font-medium">
                    {host.name?.charAt(0) || "H"}
                  </span>
                </div>
                <p className="text-white text-sm">{host.name}</p>
                <span className="text-[#D4AF7A] text-xs">Host</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center text-white/40">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
}

function WebinarParticipantPanel({
  participants,
  isHost,
  onClose,
  onSpotlight,
  onRemove,
  onMute,
}) {
  const allParticipants = [
    { id: "self", name: "You", role: isHost ? "host" : "participant" },
    ...participants,
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
                {participant.id === "self" && (
                  <span className="text-white/40 ml-1">(You)</span>
                )}
              </p>
              {participant.role === "host" && (
                <span className="text-[#D4AF7A] text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" /> Host
                </span>
              )}
            </div>

            {isHost && participant.id !== "self" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSpotlight(participant.id)}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Spotlight"
                >
                  <Pin className="w-3 h-3 text-white/60" />
                </button>
                <button
                  onClick={() => onMute(participant.id)}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Mute"
                >
                  <MicOff className="w-3 h-3 text-white/60" />
                </button>
                <button
                  onClick={() => onRemove(participant.id)}
                  className="p-1 hover:bg-red-500/20 rounded"
                  title="Remove"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QAPanel({
  questions,
  isModerator,
  onSubmitQuestion,
  onAnswerQuestion,
  onClose,
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmitQuestion(input.trim());
      setInput("");
    }
  };

  const answeredQuestions = questions.filter((q) => q.answered);
  const pendingQuestions = questions.filter((q) => !q.answered);

  return (
    <div className="w-80 bg-[#1A2332] border-l border-white/5 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-white font-medium text-sm">Q&A</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {!isModerator && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-white/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF7A]/60 placeholder:text-white/30"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingQuestions.length > 0 && (
          <>
            <h3 className="text-white/60 text-xs font-medium uppercase">
              Pending ({pendingQuestions.length})
            </h3>
            {pendingQuestions.map((q) => (
              <div key={q.id} className="bg-[#0D1117] rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-[#D4AF7A] mt-0.5" />
                  <p className="text-white text-sm flex-1">{q.text}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{q.author}</span>
                  {isModerator && (
                    <button className="text-[#D4AF7A] text-xs hover:underline">
                      Answer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {answeredQuestions.length > 0 && (
          <>
            <h3 className="text-white/60 text-xs font-medium uppercase mt-4">
              Answered ({answeredQuestions.length})
            </h3>
            {answeredQuestions.map((q) => (
              <div key={q.id} className="bg-[#0D1117] rounded-lg p-3">
                <p className="text-white text-sm mb-2">{q.text}</p>
                <div className="border-t border-white/10 pt-2">
                  <p className="text-[#D4AF7A] text-xs">{q.answer}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {questions.length === 0 && (
          <p className="text-white/30 text-center text-xs py-8">
            No questions yet
          </p>
        )}
      </div>
    </div>
  );
}

function WebinarChatPanel({
  messages,
  isModerator,
  onSendMessage,
  onClose,
}) {
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
                {msg.isHost && <Star className="w-3 h-3 text-[#D4AF7A]" />}
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

export default WebinarRoom;
