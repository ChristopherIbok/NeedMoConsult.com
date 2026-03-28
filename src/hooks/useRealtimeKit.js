import { useState, useEffect, useCallback, useRef } from "react";
import { useRealtimeKitClient, RealtimeKitProvider } from "@cloudflare/realtimekit-react";

export function useRealtimeKit() {
  const [client, setClient] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const initClient = useRealtimeKitClient();
  const clientRef = useRef(null);

  const initialize = useCallback(async (authToken, defaults = {}) => {
    if (!authToken) {
      setError("No auth token provided");
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const rtkClient = await initClient({
        authToken,
        defaults: {
          video: defaults.video ?? true,
          audio: defaults.audio ?? true,
        },
      });

      clientRef.current = rtkClient;
      setClient(rtkClient);
      setIsInitialized(true);
      setIsConnecting(false);

      return rtkClient;
    } catch (err) {
      console.error("Failed to initialize RealtimeKit:", err);
      setError(err.message || "Failed to connect to the meeting");
      setIsConnecting(false);
      return null;
    }
  }, [initClient]);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.disconnect();
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
      clientRef.current = null;
      setClient(null);
      setIsInitialized(false);
      setParticipants([]);
    }
  }, []);

  const toggleAudio = useCallback(async (enabled) => {
    if (clientRef.current?.setAudioEnabled) {
      await clientRef.current.setAudioEnabled(enabled);
    }
  }, []);

  const toggleVideo = useCallback(async (enabled) => {
    if (clientRef.current?.setVideoEnabled) {
      await clientRef.current.setVideoEnabled(enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async (enabled) => {
    if (clientRef.current?.setScreenShareEnabled) {
      await clientRef.current.setScreenShareEnabled(enabled);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect().catch(console.error);
      }
    };
  }, []);

  return {
    client,
    isInitialized,
    isConnecting,
    error,
    participants,
    initialize,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    Provider: RealtimeKitProvider,
  };
}

export default useRealtimeKit;
