import React from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Settings,
  PhoneOff,
  MoreHorizontal,
  Grid,
  Smile,
  Circle,
  ChevronUp,
  Shield,
  Pin,
  PinOff,
  Copy,
  X,
  Check,
  AlertCircle,
  Lock,
  Clock,
  Send,
  Paperclip,
  Phone,
  Calendar,
  User,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Maximize,
  Minimize,
  ArrowLeft,
  ArrowRight,
  Mute,
  Unmute,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";

export const needmoIcons = {
  video_on: Video,
  video_off: VideoOff,
  mic_on: Mic,
  mic_off: MicOff,
  share_screen_start: Monitor,
  share_screen_stop: MonitorOff,
  participants: Users,
  chat: MessageSquare,
  settings: Settings,
  call_end: Phone,
  leave: PhoneOff,
  more: MoreHorizontal,
  grid_view: Grid,
  gallery_view: Grid,
  reactions: Smile,
  record: Circle,
  stop_record: Circle,
  security: Shield,
  pin: Pin,
  unpin: PinOff,
  copy: Copy,
  close: X,
  check: Check,
  warning: AlertCircle,
  lock: Lock,
  clock: Clock,
  send: Send,
  attach: Paperclip,
  phone: Phone,
  calendar: Calendar,
  profile: User,
  edit: Edit3,
  delete: Trash2,
  add: Plus,
  remove: Minus,
  maximize: Maximize,
  minimize: Minimize,
  back: ArrowLeft,
  forward: ArrowRight,
  mute: Mute,
  unmute: Unmute,
  play: Play,
  pause: Pause,
  volume: Volume2,
  volume_muted: VolumeX,
};

export function NeedMoIcon({ name, size = 20, className = "" }) {
  const IconComponent = needmoIcons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in needmoIcons`);
    return null;
  }
  return <IconComponent size={size} className={className} />;
}

export function createZoomStyleToolbar() {
  return {
    container: {
      background: "rgba(26, 35, 50, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "8px 16px",
      gap: "4px",
    },
    button: {
      borderRadius: "8px",
      padding: "8px 12px",
      transition: "all 0.15s ease",
      "&:hover": {
        background: "rgba(212, 175, 122, 0.1)",
      },
      "&:active": {
        transform: "scale(0.95)",
      },
    },
    buttonActive: {
      background: "rgba(212, 175, 122, 0.2)",
      color: "#D4AF7A",
    },
    buttonMuted: {
      background: "rgba(245, 101, 101, 0.2)",
      color: "#F56565",
    },
    buttonDanger: {
      background: "#F56565",
      color: "#FFFFFF",
    },
    icon: {
      size: "20px",
    },
    label: {
      fontSize: "11px",
      fontWeight: 500,
    },
  };
}

export const zoomColors = {
  background: {
    primary: "#1A2332",
    secondary: "#2D3748",
    hover: "#3A4A5E",
    dark: "#141414",
  },
  accent: {
    primary: "#D4AF7A",
    hover: "#C49A5E",
    blue: "#0E72ED",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#A0AEC0",
    muted: "#718096",
  },
  border: {
    default: "#4A5568",
    hover: "#D4AF7A",
  },
  status: {
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#F56565",
    recording: "#F56565",
  },
};

export const zoomLayout = {
  toolbar: {
    height: "60px",
    position: "bottom",
    padding: "8px 16px",
    gap: "4px",
  },
  sidebar: {
    width: "320px",
    position: "right",
    background: "rgba(26, 35, 50, 0.95)",
  },
  participant: {
    borderRadius: "8px",
    gap: "2px",
    nameFontSize: "12px",
    speakingBorderWidth: "2px",
  },
  gallery: {
    minTileWidth: "120px",
    maxTileWidth: "200px",
    gap: "4px",
  },
};

export default {
  needmoIcons,
  NeedMoIcon,
  createZoomStyleToolbar,
  zoomColors,
  zoomLayout,
};
