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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/95"
          onClick={onClose}
        >
          {/* Wrapper: Dynamic width based on orientation */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative z-10 w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden ${
              isVertical ? "max-w-[320px] sm:max-w-[400px]" : "max-w-full sm:max-w-5xl"
            }`}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1} 
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 sm:-top-10 right-0 sm:right-2 text-white/70 hover:text-white transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF7A] z-20 bg-black/50 rounded-full"
              aria-label="Close video modal"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            {/* Video Frame */}
            <div 
              className={`relative overflow-hidden rounded-2xl shadow-2xl bg-black ${
                isVertical ? "aspect-[9/16] w-full" : "aspect-video w-full"
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
            <div className="mt-3 bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 sm:px-5 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[#D4AF7A] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-1">
                    {item.client}
                  </p>
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight truncate">
                    {item.project}
                  </h3>
                  {item.description && (
                    <p className="text-white/50 text-xs sm:text-sm mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.results && Object.keys(item.results).length > 0 && (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {Object.entries(item.results).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2 min-w-[60px] sm:min-w-[70px]"
                      >
                        <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                          {value || "—"}
                        </span>
                        <span className="text-white/40 text-[8px] sm:text-[9px] uppercase font-medium whitespace-nowrap">
                          {key}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
