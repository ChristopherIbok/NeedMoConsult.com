import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sun, Moon, Video, Layers, DollarSign, Grid, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { LogoHorizontal } from "@/components/brand/Logo";

const navItems = [
  { name: "Services", page: "Services", icon: Layers },
  { name: "Pricing", page: "Pricing", icon: DollarSign },
  { name: "Portfolio", page: "Portfolio", icon: Grid },
  { name: "About", page: "About", icon: Info },
  { name: "Contact", page: "Contact", icon: Mail },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // On home page hero (not scrolled), always use dark mode
  const isHomeHero = location.pathname === "/" || location.pathname === "/Home" || location.pathname === "/home";
  const isDark = isHomeHero && !isScrolled ? true : theme === "dark";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-[#0D1117]/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="site-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <LogoHorizontal size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className="text-sm font-medium transition-colors relative group"
                  style={{
                    color: isDark ? "#FFFFFF" : "#2D2D3A",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#D4AF7A"}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#FFFFFF" : "#2D2D3A"}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF7A] transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <motion.a
                href="https://meeting.needmoconsult.com"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.9 }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#D4AF7A]/20 transition-colors"
                aria-label="Start Video Call"
                title="Start Video Call"
              >
                <Video className="w-5 h-5 text-[#D4AF7A]" />
              </motion.a>

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
                      <Moon className="w-5 h-5 text-[#121C2D]" />
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
                <Button className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#121C2D] font-semibold px-6 transition-all hover:scale-105 btn-ripple">
                  Book Free Strategy Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D4AF7A]/15 bg-white/90 px-3 py-3 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#081018]/90 lg:hidden"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className="group flex h-12 w-12 items-center justify-center rounded-3xl border border-transparent bg-transparent text-[#8C7A5E] transition duration-200 hover:border-transparent hover:text-[#D4AF7A] active:scale-[0.98] dark:text-[#8C7A5E]"
                aria-label={item.name}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
