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
      if (cachedRegion) {
        setRegion(cachedRegion);
        return;
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_name) {
          setRegion(data.country_name);
          sessionStorage.setItem("user-region", data.country_name);
        }
      } catch (error) {
        console.error("Region detection failed:", error);
        setRegion("worldwide");
      }
    };
    detectRegion();
  }, []);

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1A2332 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute w-64 h-64 rounded-full bg-[#D4AF7A] opacity-[0.06] -top-16 -left-16" />
        <div className="floating-shape-reverse absolute w-48 h-48 rounded-full bg-[#1A2332] dark:bg-white opacity-[0.04] top-1/2 right-0 translate-x-1/2" />
        <div
          className="floating-shape absolute w-32 h-32 rounded-full bg-[#D4AF7A] opacity-[0.08] bottom-20 left-1/3"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 md:py-12 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.p className="text-[#D4AF7A] text-xs sm:text-sm font-semibold uppercase tracking-widest">
              Serving clients in {region} and beyond
            </motion.p>

            <motion.h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A2332] dark:text-white leading-[1.2]">
              Your Brand
              <br />
              <span className="relative">
                Deserves More
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#D4AF7A] rounded-full" />
              </span>
              .
            </motion.h1>

            <motion.p className="text-base sm:text-lg text-[#333333] dark:text-gray-300 leading-relaxed max-w-xl">
              NeedMo Consult is a strategic social media agency helping
              businesses, creators, and brands turn their online presence into
              real growth.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" className="bg-[#D4AF7A] text-white">
                  Book a Free Strategy Call
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 sm:gap-12 pt-4">
              {[
                { value: 50, suffix: "+", label: "Happy Clients" },
                { value: 3, suffix: "M+", label: "People Reached" },
                { value: 500, suffix: "+", label: "Posts Created" },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A2332] dark:text-white flex items-baseline">
                    <AnimatedCounter value={stat.value} />
                    <span className="ml-0.5">{stat.suffix}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-[#D4AF7A] to-[#E0C48A]"
              />
              {/* Additional decorative motion elements here */}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ opacity: scrolled ? 0 : 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest opacity-50">Scroll</span>
        <div className="w-6 h-10 border-2 rounded-full flex justify-center p-2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity }} className="w-1 h-2 bg-[#D4AF7A] rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}