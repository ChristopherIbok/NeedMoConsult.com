import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function ContactCTA() {
  const [localTime, setLocalTime] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTime(time);
      setTimezone(tz);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2332] via-[#2A3342] to-[#D4AF7A] dark:from-[#0F1419] dark:via-[#1A2332] dark:to-[#C49A5E]" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative site-container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }} // Optimized for better UX
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Let's Talk About What Your Brand Needs More Of
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you're starting from scratch or ready to scale, we'd love to
            learn about your goals and show you how we can help.
          </p>

          <Link to={createPageUrl("Contact")} className="block sm:inline-block">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#bg-[#bg-[#bg-[#F9F7F4]]]] text-[#1A2332] hover:bg-gray-100 active:scale-[0.98] font-bold px-8 sm:px-10 py-5 text-base sm:text-lg transition-all min-h-[56px]"
            >
              Book a Free 30-Minute Strategy Call
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          {/* Contact Info - UPDATED WITH REAL DATA */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6 mt-8 text-white/70">
            <a
              href="mailto:hello@needmoconsult.com"
              className="flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              hello@needmoconsult.com
            </a>
            
            {/* REPLACE WITH YOUR ACTUAL NUMBER */}
            <a
              href="tel:+15306264474" 
              className="flex items-center gap-2 hover:text-white transition-colors min-h-[44px]"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              +1 (530) 626-4474
            </a>

            {/* REPLACE WITH YOUR ACTUAL CITY/STATE */}
            <span className="flex items-center gap-2 min-h-[44px]">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              Remote-First Agency
            </span>
          </div>

          {/* Timezone Message */}
          <div className="mt-6 text-white/60 text-xs sm:text-sm italic px-4">
            <p>
              Your local time: {localTime} ({timezone})
            </p>
            <p>Our team typically responds within 24 hours.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}