import React, { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
export default function VideoModal({ item, onClose }) {
  const videoRef = useRef(null);
  // 1. Accessibility: Auto-focus the video to start playback/interaction
  useEffect(() => {
    if (item && videoRef.current) {
      videoRef.current.focus();
    }
  }, [item]);
  // 2. Event Listener & Scroll Control: Using useCallback to keep the function identity stable
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);
  useEffect(() => {
    if (!item) return;
    document.addEventListener("keydown", handleKeyDown);
    // Hide scrollbar to prevent layout shifting/scroll jumps
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore scrollbar on unmount
      document.body.style.overflow = ""; 
    };
  }, [item, handleKeyDown]);
  // Determine layout style based on content
  const isVertical = item?.orientation === "vertical" || item?.aspect === "9:16";
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
          {/* Wrapper: Dynamic width based on orientation */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative z-10 w-full flex flex-col ${
              isVertical ? "max-w-[400px]" : "max-w-5xl"
            }`}
            onClick={(e) => e.stopPropagation()}
            // Accessible ref assigned to the video wrapper
            tabIndex={-1} 
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 md:-right-10 md:top-0 text-white/70 hover:text-white transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF7A]"
              aria-label="Close video modal"
            >
              <X className="w-8 h-8" />
            </button>
            {/* Video Frame: Using aspect-ratio */}
            <div 
              className={`relative overflow-hidden rounded-2xl shadow-2xl bg-black ${
                isVertical ? "aspect-[9/16] w-full" : "aspect-video"
              }`}
            >
              {/* Augmented VideoPlayer with ref for focus */}
              <div ref={videoRef}>
                <VideoPlayer
                  type={item.type || "youtube"}
                  videoId={item.videoId}
                  src={item.src}
                  poster={item.thumbnail}
                  orientation={item.orientation || "horizontal"}
                  title={`${item.project} – ${item.client}`}
                />
              </div>
            </div>
            {/* Info Bar */}
            <div className="mt-3 bg-[#1A1A1A] border border-white/5 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[#D4AF7A] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                  {item.client}
                </p>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {item.project}
                </h3>
                {item.description && (
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              {item.results && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {Object.entries(item.results).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col items-start bg-white/5 rounded-lg px-3 py-2 min-w-[70px]"
                    >
                      <span className="text-white font-bold text-sm">
                        {value}
                      </span>
                      <span className="text-white/40 text-[9px] uppercase font-medium">
                        {key}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
