import { useState, useEffect } from "react";
import { RealtimeKitProvider, useRealtimeKitClient, useRealtimeKitSelector } from "@cloudflare/realtimekit-react";

const API_URL = "https://api.needmoconsult.com";

function Meeting({ token, meetingId, onLeave }) {
  const [client, loadClient] = useRealtimeKitClient();
  const roomJoined = useRealtimeKitSelector((m) => m.self?.roomJoined);
  const self = useRealtimeKitSelector((m) => m.self);
  const participantCount = useRealtimeKitSelector((m) => m.participants?.count || 0);

  useEffect(() => {
    if (token && !client) {
      loadClient({
        authToken: token,
        defaults: { video: true, audio: true },
      });
    }
  }, [token, client, loadClient]);

  useEffect(() => {
    if (client && meetingId) {
      client.meeting?.joinRoom();
    }
  }, [client, meetingId]);

  const handleLeave = () => {
    client?.meeting?.leaveRoom();
    onLeave?.();
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Connecting to meeting...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <span className="text-slate-400">Participants:</span> {participantCount}
        </div>
        <button
          onClick={handleLeave}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Leave Meeting
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {self && (
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-2">You</div>
            <div className="text-white mb-2">{self.name || "You"}</div>
            <div className="flex gap-2">
              <button
                onClick={() => self?.audioEnabled ? self?.disableAudio() : self?.enableAudio()}
                className={`px-3 py-1 rounded ${self?.audioEnabled ? 'bg-green-600' : 'bg-red-600'}`}
              >
                {self?.audioEnabled ? 'Mute' : 'Unmute'}
              </button>
              <button
                onClick={() => self?.videoEnabled ? self?.disableVideo() : self?.enableVideo()}
                className={`px-3 py-1 rounded ${self?.videoEnabled ? 'bg-green-600' : 'bg-red-600'}`}
              >
                {self?.videoEnabled ? 'Stop Video' : 'Start Video'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-slate-500 text-sm text-center">
        Status: {roomJoined ? "Joined" : roomJoined === false ? "Not joined" : "Connecting..."}
      </div>
    </div>
  );
}

export default function Call() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roomSlug, setRoomSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [rtkToken, setRtkToken] = useState(null);
  const [activeMeetingId, setActiveMeetingId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomSlug(room);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        localStorage.setItem('needmo_token', data.access_token);
        setName(data.user?.name || name);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!token) {
      setError("Please login first");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/meetings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: name || "Meeting", isInstant: true }),
      });
      const data = await res.json();
      
      if (data.meeting?.id) {
        await joinRtkMeeting(data.meeting.id);
      } else {
        setError("Failed to create meeting");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRtkMeeting = async (meetingId) => {
    try {
      const res = await fetch(`${API_URL}/api/realtimekit/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ meetingId, name: name || "User" }),
      });
      const data = await res.json();
      
      if (data.authToken) {
        setRtkToken(data.authToken);
        setActiveMeetingId(meetingId);
      } else {
        setError(data.error || "Failed to join meeting");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinMeeting = () => {
    if (!roomSlug) {
      setError("Enter a meeting link");
      return;
    }
    if (!token) {
      setError("Please login first");
      return;
    }
    joinRtkMeeting(roomSlug);
  };

  const handleLeaveMeeting = () => {
    setRtkToken(null);
    setActiveMeetingId(null);
  };

  if (rtkToken && activeMeetingId) {
    return (
      <RealtimeKitProvider>
        <Meeting 
          token={rtkToken} 
          meetingId={activeMeetingId} 
          onLeave={handleLeaveMeeting} 
        />
      </RealtimeKitProvider>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">NeedMo Meeting</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
              placeholder="Enter your name"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="mt-4">
          <label className="block text-slate-400 mb-1">Meeting ID</label>
          <input
            type="text"
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2"
            placeholder="Enter meeting ID"
          />
        </div>

        <button
          onClick={handleJoinMeeting}
          disabled={loading || !roomSlug || !token}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 disabled:opacity-50"
        >
          Join Meeting
        </button>

        <button
          onClick={handleCreateMeeting}
          disabled={loading || !token}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 disabled:opacity-50"
        >
          Create New Meeting
        </button>

        <p className="text-slate-500 text-sm mt-6 text-center">
          Powered by Cloudflare RealtimeKit
        </p>
      </div>
    </div>
  );
}
