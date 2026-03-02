import React from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import NewsletterPopup from "@/components/ui/NewsletterPopup";

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <style>{`
		@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
		body, h1, h2, h3, h4, h5, h6 {
		  font-family: 'Montserrat', 'Poppins', system-ui, sans-serif;
		}
		p, span, a, li, input, textarea, select, button {
		  font-family: 'Inter', system-ui, sans-serif;
		}
		/* Prevent iOS zoom on input focus */
		input, select, textarea {
		  font-size: 16px !important;
		}
		/* Reduce motion for accessibility */
		@media (prefers-reduced-motion: reduce) {
		  *, *::before, *::after {
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		  }
		}
		/* Smooth momentum scrolling on iOS */
		body {
		  -webkit-overflow-scrolling: touch;
		}
	  `}</style>
      <div className="min-h-screen bg-white dark:bg-[#0F1419] transition-colors">
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
        <NewsletterPopup />
      </div>
    </ThemeProvider>
  );
}
