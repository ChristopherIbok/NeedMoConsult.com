import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { LogoHorizontal } from "@/components/brand/Logo";
import { LogoBadge } from "@/components/brand/Logo";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { name: "Home", page: "Home" },
  { name: "Services", page: "Services" },
  { name: "Pricing", page: "Pricing" },
  { name: "Portfolio", page: "Portfolio" },
  { name: "Blog", page: "Blog" },
  { name: "About", page: "About" },
  { name: "Contact", page: "Contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === "dark";

  // Menu colors based on theme
  const menuBg       = isDark ? "rgba(26, 35, 50, 0.97)" : "#F7F7F7";
  const menuText     = isDark ? "#FFFFFF" : "#1A2332";
  const menuMuted    = isDark ? "rgba(255,255,255,0.5)" : "rgba(26,35,50,0.5)";
  const menuBorder   = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,35,50,0.1)";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-[#0F1419]/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center">
              <LogoHorizontal size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className="text-sm font-medium text-[#333333] dark:text-gray-300 hover:text-[#D4AF7A] dark:hover:text-[#D4AF7A] transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF7A] transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                whileTap={{ rotate: 180, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "light" ? (
                    <motion.span
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5 text-[#1A2332]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5 text-white" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link to={createPageUrl("Contact")} className="hidden md:block">
                <Button className="bg-[#D4AF7A] hover:bg-[#E55A2B] text-white font-semibold px-6 transition-all hover:scale-105 btn-ripple">
                  Book Free Strategy Call
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-[#1A2332] dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay — outside <header> to escape backdrop-blur stacking context */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ backgroundColor: menuBg }}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-6 h-16"
              style={{ borderBottom: `1px solid ${menuBorder}` }}
            >
              <LogoHorizontal size="md" forceLight={isDark} forceDark={!isDark} />
              <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors"
                  style={{ color: menuMuted }}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {/* Close */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors"
                  style={{ color: menuText }}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col px-8 pt-8 gap-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 text-2xl font-bold transition-colors active:scale-[0.98] hover:text-[#D4AF7A]"
                    style={{
                      color: menuText,
                      borderBottom: `1px solid ${menuBorder}`,
                    }}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* CTA at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Link
                to={createPageUrl("Contact")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full bg-[#D4AF7A] hover:bg-[#E55A2B] text-white font-bold py-4 text-lg min-h-[56px] active:scale-[0.98] transition-transform">
                  Book Free Strategy Call
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
