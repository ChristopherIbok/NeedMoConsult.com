import React, { useState } from "react";
import { motion } from "framer-motion";

const R2_BASE = "https://assets.needmoconsult.com";

export default function VideoPlayer({
  type = "youtube",
  videoId,
  src,
  poster,
  title = "Project video",
  startAt = 0,
  orientation = "horizontal", // "horizontal" | "vertical"
}) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const thumbnailSrc = poster
    ? (poster.startsWith("http") ? poster : `${R2_BASE}/${poster}`)
    : type === "youtube"
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : self;

  const videoSrc = src && !src.startsWith("http") ? `${R2_BASE}/${src}` : src;

  const embedSrc = (() => {
    if (type === "youtube") {
      const params = new URLSearchParams({
        autoplay: "1", rel: "0", modestbranding: "1", controls: "1", color: "white",
        ...(startAt > 0 ? { start: String(startAt) } : {}),
      });
      return `https://www.youtube.com/embed/${videoId}?${params}`;
    }
    if (type === "vimeo") {
      const params = new URLSearchParams({
        title: "0", byline: "0", portrait: "0", color: "D4AF7A", autoplay: "1",
      });
      return `https://player.vimeo.com/video/${videoId}?${params}`;
    }
    return null;
  })();

  const aspectClass = orientation === "vertical" ? "aspect-[9/16]" : "aspect-[16/9]";

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-gray-900 ${aspectClass} max-h-[75vh]`}>
      {!playing ? (
        <>
          {thumbnailSrc && (
            <img
              src={thumbnailSrc}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <motion.button
            onClick={() => setPlaying(true)}
            whileTap={{ scale: 0.97 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF7A] rounded-full"
            aria-label={`Play video: ${title}`}
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:scale-110">
              <circle cx="36" cy="36" r="36" fill="#D4AF7A" />
              <polygon points="28,20 28,52 54,36" fill="white" />
            </svg>
          </motion.button>
        </>
      ) : (
        <>
          {!loaded && <div className="absolute inset-0 bg-gray-900 transition-opacity duration-300" />}
          {type === "self" ? (
            <video
              className="absolute inset-0 w-full h-full object-contain"
              src={videoSrc}
              poster={thumbnailSrc}
              controls autoPlay playsInline
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
              onLoad={() => setLoaded(true)}
            />
          )}
        </>
      )}
    </div>
  );
}
