import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Lazy-loaded video player with thumbnail-first approach.
 * Supports YouTube, Vimeo, and self-hosted videos.
 *
 * Props:
 *  - type: "youtube" | "vimeo" | "self"
 *  - videoId: YouTube or Vimeo video ID
 *  - src: URL for self-hosted video
 *  - poster: Thumbnail URL (auto-generated for YouTube if omitted)
 *  - title: Accessible title for the iframe
 *  - startAt: YouTube start time in seconds
 */
export default function VideoPlayer({
  type = "youtube",
  videoId,
  src,
  poster,
  title = "Project video",
  startAt = 0,
}) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  // Auto-thumbnail for YouTube
  const thumbnailSrc = poster
    ? poster
    : type === "youtube"
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  // Build embed URL
  const embedSrc = (() => {
    if (type === "youtube") {
      const params = new URLSearchParams({
        autoplay: "1",
        rel: "0",
        modestbranding: "1",
        controls: "1",
        color: "white",
        ...(startAt > 0 ? { start: String(startAt) } : {}),
      });
      return `https://www.youtube.com/embed/${videoId}?${params}`;
    }
    if (type === "vimeo") {
      const params = new URLSearchParams({
        title: "0",
        byline: "0",
        portrait: "0",
        color: "FF6B35",
        autoplay: "1",
        muted: "0",
      });
      return `https://player.vimeo.com/video/${videoId}?${params}`;
    }
    return null;
  })();

  const handlePlay = () => {
    // Respect prefers-reduced-motion
    setPlaying(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl bg-gray-900"
      style={{ aspectRatio: "16 / 9" }}
    >
      {!playing ? (
        <>
          {/* Thumbnail */}
          {thumbnailSrc && (
            <img
              src={thumbnailSrc}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Play Button */}
          <motion.button
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.97 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF7A] rounded-full"
            aria-label={`Play video: ${title}`}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="36" cy="36" r="36" fill="#D4AF7A" />
              <polygon points="28,20 28,52 54,36" fill="white" />
            </svg>
            
          </motion.button>
        </>
      ) : (
        <>
          {/* Loading shimmer behind iframe */}
          {!loaded && (
            <div className="absolute inset-0 bg-gray-900 transition-opacity duration-300" />
          )}

          {type === "self" ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              onCanPlay={() => setLoaded(true)}
              title={title}
            />
          ) : (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedSrc}
              title={title}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          )}
        </>
      )}
    </div>
  );
}
