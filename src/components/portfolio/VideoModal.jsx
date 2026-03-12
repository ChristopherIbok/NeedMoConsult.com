import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Heart, TrendingUp } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

/**
 * Full-screen video lightbox modal.
 * Pass `item` (portfolio object) to open, null to close.
 */
export default function VideoModal({ item, onClose }) {
  // ESC key to close
  useEffect(() => {
    if (!item) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF7A] rounded-full p-1"
              aria-label="Close video"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Video */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <VideoPlayer
                type={item.type || "youtube"}
                videoId={item.videoId}
                src={item.src}
                poster={item.thumbnail}
                orientation={item.orientation || "horizontal"}
                title={`${item.project} – ${item.client}`}
              />
            </div>

            {/* Info bar */}
            <div className="mt-4 bg-white/5 backdrop-blur rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[#D4AF7A] text-xs font-semibold uppercase tracking-widest mb-0.5">
                  {item.client}
                </p>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {item.project}
                </h3>
                {item.description && (
                  <p className="text-white/60 text-sm mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              {item.results && (
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  {Object.entries(item.results).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-white font-semibold text-sm">
                        {value}
                      </span>
                      <span className="text-white/50 text-xs capitalize">
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
