import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const R2_BASE = "https://assets.needmoconsult.com";

export default function VideoPlayer({
  type = "youtube",
  videoId,
  src,
  poster,
  title = "Project video",
  startAt = 0,
  orientation = "horizontal",
}) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videoThumb, setVideoThumb] = useState(null);
  const videoRef = useRef(null);

  const videoSrc = src && !src.startsWith("http") ? `${R2_BASE}/${src}` : src;

  const thumbnailSrc = poster
    ? (poster.startsWith("http") ? poster : `${R2_BASE}/${poster}`)
    : type === "youtube"
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : videoThumb;

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
        color: "D4AF7A",
        autoplay: "1",
      });
      return `https://player.vimeo.com/video/${videoId}?${params}`;
    }
    return null;
  })();

  useEffect(() => {
    if (type === "self" && videoSrc) {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = videoSrc;
      video.muted = true;
      video.preload = "metadata";

      video.onloadeddata = () => {
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setVideoThumb(canvas.toDataURL("image/jpeg", 0.8));
      };

      video.onerror = () => {
        setVideoThumb(null);
      };
    }
  }, [type, videoSrc]);

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
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain"
              src={videoSrc}
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
              onLoad={() => setLoaded(true)}
            />
          )}
        </>
      )}
    </div>
  );
}
