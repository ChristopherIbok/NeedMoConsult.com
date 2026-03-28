import { RtkMeeting, useRealtimeKit } from "@cloudflare/realtimekit-react";

export const APP_ID = import.meta.env.VITE_REALTIMEKIT_APP_ID;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class RealtimeKitClient {
  constructor(authToken, options = {}) {
    this.authToken = authToken;
    this.options = {
      video: options.video ?? true,
      audio: options.audio ?? true,
      screenShare: options.screenShare ?? true,
      ...options,
    };
    this.client = null;
    this.participants = [];
    this.listeners = new Map();
  }

  async initialize() {
    try {
      this.client = await useRealtimeKit(this.authToken, this.options);
      this.setupEventListeners();
      return this.client;
    } catch (error) {
      console.error("Failed to initialize RealtimeKit client:", error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.client) return;

    this.client.on("participant-joined", (participant) => {
      this.participants.push(participant);
      this.emit("participant-joined", participant);
    });

    this.client.on("participant-left", (participant) => {
      this.participants = this.participants.filter(p => p.id !== participant.id);
      this.emit("participant-left", participant);
    });

    this.client.on("participant-updated", (participant) => {
      const index = this.participants.findIndex(p => p.id === participant.id);
      if (index !== -1) {
        this.participants[index] = participant;
      }
      this.emit("participant-updated", participant);
    });

    this.client.on("error", (error) => {
      this.emit("error", error);
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => callback(data));
  }

  async toggleAudio(enabled) {
    if (this.client) {
      await this.client.setAudioEnabled(enabled);
    }
  }

  async toggleVideo(enabled) {
    if (this.client) {
      await this.client.setVideoEnabled(enabled);
    }
  }

  async toggleScreenShare(enabled) {
    if (this.client) {
      await this.client.setScreenShareEnabled(enabled);
    }
  }

  async startRecording() {
    if (this.client && this.client.startRecording) {
      return this.client.startRecording();
    }
    throw new Error("Recording not available");
  }

  async stopRecording() {
    if (this.client && this.client.stopRecording) {
      return this.client.stopRecording();
    }
    throw new Error("Recording not available");
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.participants = [];
    }
  }

  getParticipants() {
    return this.participants;
  }

  isConnected() {
    return this.client !== null;
  }
}

export const createRealtimeKitClient = (authToken, options) => {
  return new RealtimeKitClient(authToken, options);
};

export { RtkMeeting };
