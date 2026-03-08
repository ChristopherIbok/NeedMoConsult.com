import React from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import NewsletterPopup from "@/components/ui/NewsletterPopup";

export default function Layout({ children }) {
  const isAdmin = window.location.pathname.toLowerCase().includes("/admin");

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
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        body {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      <div className="min-h-screen bg-white dark:bg-[#0F1419] transition-colors">
        {!isAdmin && <Header />}
        {children}
        {!isAdmin && <Footer />}
        {!isAdmin && <ScrollToTop />}
        {!isAdmin && <NewsletterPopup />}
      </div>
    </ThemeProvider>
  );
}