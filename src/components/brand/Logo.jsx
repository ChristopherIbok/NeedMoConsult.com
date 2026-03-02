import React from "react";
import { useTheme } from "@/components/ui/ThemeProvider";

/**
 * NEEDMO CONSULT Logo Component
 *
 * Variants:
 * - "horizontal"  : NEEDMO CONSULT side-by-side with icon (default, for header)
 * - "stacked"     : Icon above NEEDMO / CONSULT stacked (for hero/cards)
 * - "icon"        : NM monogram only (for favicon-sized, avatars)
 * - "footer"      : Always white version (for dark footer)
 *
 * Sizes: "sm" | "md" | "lg" | "xl"
 */

// ─── NM Monogram Icon ──────────────────────────────────────────────────────────
export function NMIcon({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NEEDMO CONSULT icon"
    >
      {/* Background square with rounded corners */}
      <rect width="40" height="40" rx="10" fill="#FF6B35" />

      {/* N letterform */}
      <path d="M7 30V10H11L19 22V10H23V30H19L11 18V30H7Z" fill="white" />

      {/* M letterform */}
      <path
        d="M25 30V10H29L33 20L37 10H37V10"
        fill="none"
        stroke="white"
        strokeWidth="0"
      />
      {/* Clean NM ligature paths */}
      <path
        d="M7 10V30H10.5V17.5L18.5 30H22V10H18.5V22.5L10.5 10H7Z"
        fill="white"
      />
      <path
        d="M24 10V30H27.2V17L30.5 24L33.8 17V30H37V10H33.4L30.5 17.8L27.6 10H24Z"
        fill="white"
      />
    </svg>
  );
}

// ─── Orange accent triangle ────────────────────────────────────────────────────
function AccentDot({ className = "" }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <rect width="8" height="8" rx="2" fill="#FF6B35" />
    </svg>
  );
}

// ─── Horizontal Logo (for header) ─────────────────────────────────────────────
export function LogoHorizontal({
  forceLight = false,
  forceDark = false,
  size = "md",
  className = "",
}) {
  const { theme } = useTheme() || { theme: "light" };
  const isDark = forceDark || (!forceLight && theme === "dark");

  const sizeMap = {
    sm: { icon: 28, needmo: "text-lg", consult: "text-sm", gap: "gap-2" },
    md: {
      icon: 34,
      needmo: "text-xl md:text-2xl",
      consult: "text-sm md:text-base",
      gap: "gap-2.5",
    },
    lg: { icon: 44, needmo: "text-3xl", consult: "text-lg", gap: "gap-3" },
    xl: { icon: 56, needmo: "text-4xl", consult: "text-xl", gap: "gap-4" },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`flex items-center ${s.gap} ${className}`}
      role="img"
      aria-label="NEEDMO CONSULT"
    >
      <NMIcon size={s.icon} />
      <div className="flex flex-col leading-none">
        <span
          className={`${s.needmo} font-black tracking-tight leading-none`}
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: isDark ? "#FFFFFF" : "#1A2332",
            letterSpacing: "-0.02em",
          }}
        >
          NEEDMO
        </span>
        <span
          className={`${s.consult} font-normal tracking-widest leading-none mt-0.5`}
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: isDark ? "#E0E0E0" : "#333333",
            letterSpacing: "0.18em",
            fontSize: "calc(0.52em)",
          }}
        >
          CONSULT
        </span>
      </div>
    </div>
  );
}

// ─── Stacked Logo (for hero / large display) ──────────────────────────────────
export function LogoStacked({
  forceLight = false,
  forceDark = false,
  size = "md",
  className = "",
}) {
  const { theme } = useTheme() || { theme: "light" };
  const isDark = forceDark || (!forceLight && theme === "dark");

  const sizeMap = {
    sm: { icon: 36, needmo: "text-2xl", consult: "text-xs", gap: "gap-1" },
    md: { icon: 48, needmo: "text-3xl", consult: "text-sm", gap: "gap-1.5" },
    lg: { icon: 64, needmo: "text-4xl", consult: "text-base", gap: "gap-2" },
    xl: { icon: 80, needmo: "text-5xl", consult: "text-lg", gap: "gap-2.5" },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`flex flex-col items-center text-center ${s.gap} ${className}`}
      role="img"
      aria-label="NEEDMO CONSULT"
    >
      <NMIcon size={s.icon} />
      <div className="flex flex-col items-center leading-none">
        <span
          className={`${s.needmo} font-black tracking-tight leading-none`}
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: isDark ? "#FFFFFF" : "#1A2332",
            letterSpacing: "-0.02em",
          }}
        >
          NEEDMO
        </span>
        <span
          className={`${s.consult} font-normal tracking-widest leading-none mt-1`}
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: isDark ? "#E0E0E0" : "#333333",
            letterSpacing: "0.22em",
          }}
        >
          CONSULT
        </span>
      </div>
    </div>
  );
}

// ─── Footer Logo (always white) ────────────────────────────────────────────────
export function LogoFooter({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      role="img"
      aria-label="NEEDMO CONSULT"
    >
      <NMIcon size={34} />
      <div className="flex flex-col leading-none">
        <span
          className="text-xl font-black tracking-tight leading-none"
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          NEEDMO
        </span>
        <span
          className="font-normal tracking-widest leading-none mt-0.5"
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            color: "#E0E0E0",
            letterSpacing: "0.18em",
            fontSize: "0.6rem",
          }}
        >
          CONSULT
        </span>
      </div>
    </div>
  );
}

// ─── Social Media Badge (400x400 concept, rendered as component) ───────────────
export function LogoBadge({ size = 120, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, #1A2332 0%, #2A3342 60%, #FF6B35 100%)",
      }}
    >
      <div className="flex flex-col items-center">
        <NMIcon size={size * 0.45} />
        <span
          className="font-black text-white mt-2"
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            fontSize: size * 0.12,
            letterSpacing: "-0.02em",
          }}
        >
          NEEDMO
        </span>
        <span
          className="font-normal text-white/80"
          style={{
            fontFamily: "'Montserrat', 'Poppins', sans-serif",
            fontSize: size * 0.055,
            letterSpacing: "0.2em",
          }}
        >
          CONSULT
        </span>
      </div>
    </div>
  );
}

// ─── Default export = main logo used throughout the app ───────────────────────
export default LogoHorizontal;
