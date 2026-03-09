import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function ContactCTA() {
  const [localTime, setLocalTime] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTime(time);
      setTimezone(tz);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 md:py-28 overflow-hidden">
      {/* Solid two-tone navy background */}
      <div className="absolute inset-0 bg-[#1A2332]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2332] via-[#1E2A3A] to-[#2A3E5C]" />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "30px 30px" }}
      />

      <div className="relative site-container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Let's Talk About What Your Brand Needs More Of
          </h2>

          <p className="text-sm sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you're starting from scratch or ready to scale, we'd love to
            learn about your goals and show you how we can help.
          </p>

          <Link to={createPageUrl("Contact")} className="block sm:inline-block">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF7A] hover:bg-[#C49A5E] active:scale-[0.98] text-[#1A2332] font-bold rounded-md transition-all min-h-[52px] px-6 sm:px-10 text-sm sm:text-base">
              <span className="hidden sm:inline">Book a Free 30-Minute Strategy Call</span>
              <span className="sm:hidden">Book a Free Strategy Call</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </Link>

          {/* Contact info */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8 mt-10 text-white/70 text-sm">
            <a href="mailto:hello@needmoconsult.com" className="flex items-center gap-2 hover:text-white transition-colors min-h-[44px]">
              <Mail className="w-4 h-4 flex-shrink-0 text-[#D4AF7A]" />
              hello@needmoconsult.com
            </a>
            <a href="tel:+1530" className="flex items-center gap-2 hover:text-white transition-colors min-h-[44px]">
              <Phone className="w-4 h-4 flex-shrink-0 text-[#D4AF7A]" />
              +1 (989) 785-2030
            </a>
            <span className="flex items-center gap-2 min-h-[44px]">
              <MapPin className="w-4 h-4 flex-shrink-0 text-[#D4AF7A]" />
              Remote-First Agency
            </span>
          </div>

          {/* Timezone */}
          <div className="mt-6 text-white/50 text-xs italic">
            <p>Your local time: {localTime} ({timezone})</p>
            <p className="mt-0.5">Our team typically responds within 24 hours.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
