import React from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import NewsletterPopup from "@/components/ui/NewsletterPopup";

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.toLowerCase().includes("/admin");

  return (
    <ThemeProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');

        body, h1, h2, h3, h4, h5, h6 {
          font-family: 'Figtree', system-ui, sans-serif;
        }
        p, span, a, li, input, textarea, select, button {
          font-family: 'Figtree', system-ui, sans-serif;
        }
        input, select, textarea {
          font-size: 16px !important;
        }
        body {
          -webkit-overflow-scrolling: touch;
          overflow-x: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ── Global spacing system (Twilio-style) ──────────────────────
           Use these classes throughout the site for consistent padding.
           .site-container  → centered max-width wrapper with safe side padding
           .section-y       → generous vertical section breathing room
           .section-y-sm    → tighter vertical padding for smaller sections
        ─────────────────────────────────────────────────────────────── */

        .site-container {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        @media (min-width: 640px) {
          .site-container {
            padding-left: 40px;
            padding-right: 40px;
          }
        }

        @media (min-width: 1024px) {
          .site-container {
            padding-left: 64px;
            padding-right: 64px;
          }
        }

        @media (min-width: 1280px) {
          .site-container {
            padding-left: 80px;
            padding-right: 80px;
          }
        }

        .section-y {
          padding-top: 64px;
          padding-bottom: 64px;
        }

        @media (min-width: 768px) {
          .section-y {
            padding-top: 96px;
            padding-bottom: 96px;
          }
        }

        @media (min-width: 1024px) {
          .section-y {
            padding-top: 120px;
            padding-bottom: 120px;
          }
        }

        .section-y-sm {
          padding-top: 40px;
          padding-bottom: 40px;
        }

        @media (min-width: 768px) {
          .section-y-sm {
            padding-top: 64px;
            padding-bottom: 64px;
          }
        }

        /* ── Prevent any direct child of body from bleeding edge ─────── */
        img, video {
          max-width: 100%;
        }

        /* ── Safe tap targets on mobile ──────────────────────────────── */
        button, a {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
      <div className="min-h-screen bg-white dark:bg-[#0D1117] transition-colors">
        {!isAdmin && <Header />}
        {children}
        {!isAdmin && <Footer />}
        {!isAdmin && <ScrollToTop />}
        {!isAdmin && <NewsletterPopup />}
      </div>
    </ThemeProvider>
  );
}
