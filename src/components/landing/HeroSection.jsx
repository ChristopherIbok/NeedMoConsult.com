import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HeroSection() {
  const [region, setRegion] = useState("your region");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const detectRegion = async () => {
      const cachedRegion = sessionStorage.getItem("user-region");
      if (cachedRegion) { setRegion(cachedRegion); return; }
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_name) {
          setRegion(data.country_name);
          sessionStorage.setItem("user-region", data.country_name);
        }
      } catch {
        setRegion("worldwide");
      }
    };
    detectRegion();
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-[#F9F7F4] to-white dark:from-[#0F1419] dark:to-[#1A2332]">

      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1A2332 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute w-64 h-64 rounded-full bg-[#D4AF7A] opacity-[0.07] -top-16 -left-16" />
        <div className="floating-shape-reverse absolute w-48 h-48 rounded-full bg-[#1A2332] dark:bg-white opacity-[0.04] top-1/2 right-0 translate-x-1/2" />
        <div
          className="floating-shape absolute w-32 h-32 rounded-full bg-[#D4AF7A] opacity-[0.08] bottom-20 left-1/3"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="site-container w-full py-12 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-7"
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[#D4AF7A] text-xs sm:text-sm font-semibold uppercase tracking-widest"
            >
              Serving clients in {region} and beyond
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A2332] dark:text-white leading-[1.15]"
            >
              Your Brand
              <br />
              <span className="relative inline-block">
                Deserves More
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#D4AF7A] rounded-full" />
              </span>
              .
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-[#555555] dark:text-gray-300 leading-relaxed max-w-xl"
            >
              NeedMo Consult is a strategic social media agency helping
              businesses, creators, and brands turn their online presence into
              real growth — with content that performs, strategies that work,
              and results you can measure.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to={createPageUrl("Contact")} className="block">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#D4AF7A] hover:bg-[#C49A5E] active:scale-[0.98] text-[#1A2332] font-semibold px-8 py-4 text-base sm:text-lg transition-all min-h-[52px] btn-ripple"
                >
                  Book a Free Strategy Call
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={createPageUrl("Services")} className="block">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#1A2332] dark:border-white text-[#1A2332] dark:text-white hover:bg-[#1A2332] hover:text-white dark:hover:bg-white dark:hover:text-[#1A2332] active:scale-[0.98] font-semibold px-8 py-4 text-base sm:text-lg transition-all min-h-[52px]"
                >
                  See Our Services
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 sm:gap-12 pt-2"
            >
              {[
                { value: 50,  suffix: "+",  label: "Happy Clients"  },
                { value: 3,   suffix: "M+", label: "People Reached" },
                { value: 500, suffix: "+",  label: "Posts Created"  },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
                  className="text-center sm:text-left"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A2332] dark:text-white flex items-baseline justify-center sm:justify-start">
                    <AnimatedCounter value={stat.value} />
                    <span className="ml-0.5">{stat.suffix}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right visual — desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square">

              {/* Main gold circle */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-[#D4AF7A] to-[#E0C48A] shadow-2xl shadow-[#D4AF7A]/30"
              />

              {/* Navy circle */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-20 right-10 w-32 h-32 rounded-full bg-[#1A2332] dark:bg-white/10"
              />

              {/* Small gold circle */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 left-10 w-20 h-20 rounded-full bg-[#D4AF7A]/30"
              />

              {/* Post card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
                className="absolute bottom-20 right-0 bg-white dark:bg-[#1E2830] rounded-2xl shadow-2xl p-6 w-64"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF7A] to-[#E0C48A]" />
                  <div>
                    <p className="font-semibold text-[#1A2332] dark:text-white text-sm">@needmoconsult</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                </div>
                <div className="flex items-center gap-4 mt-4 text-gray-500 text-xs">
                  <span>❤️ 2.4K</span>
                  <span>💬 186</span>
                  <span>📤 89</span>
                </div>
              </motion.div>

              {/* Stats card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.25 }}
                className="absolute top-10 left-0 bg-white dark:bg-[#1E2830] rounded-2xl shadow-2xl p-5 w-48"
              >
                <p className="text-xs text-gray-500 mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-[#D4AF7A]">+250%</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-[#D4AF7A] rounded-full" />
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-xs text-[#1A2332]/50 dark:text-white/40 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[#1A2332]/30 dark:border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-[#D4AF7A] rounded-full" />
        </motion.div>
      </motion.div>

    </section>
  );
}
