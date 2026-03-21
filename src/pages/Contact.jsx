import React, { useState, useEffect } from "react";
import SEO from "@/components/ui/SEO";
import { motion } from "framer-motion";
import BookingWidget from "@/components/ui/BookingWidget";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function Contact() {
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
    <main className="pt-20">
      <SEO
        title="Contact Us | NEEDMO CONSULT"
        description="Get in touch to discuss your social media goals. Book a free 30-minute strategy call with our team."
        canonical="https://needmoconsult.com/contact"
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F4F4F6] dark:from-[#0D1117] dark:to-[#121C2D]">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#121C2D] dark:text-white mb-6">
              Let's Talk About Your Brand
            </h1>
            <p className="text-lg text-[#2D2D3A] dark:text-gray-400">
              Book a free 30-minute strategy call or reach out directly — we'd
              love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info + Booking */}
      <section className="py-20 bg-white dark:bg-[#0D1117]">
        <div className="site-container">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-[#121C2D] dark:bg-[#0D1117] rounded-3xl p-8 text-white h-full">
                <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

                <div className="space-y-6">
                  <a
                    href="mailto:hello@needmoconsult.com"
                    className="flex items-start gap-4 hover:text-[#D4AF7A] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 mt-1 text-[#D4AF7A]" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-400">hello@needmoconsult.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <Phone className="w-3.5 h-3.5 mt-1 text-[#D4AF7A]" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-400">+234 (706) 898-4590</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-3.5 h-3.5 mt-1 text-[#D4AF7A]" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400">Remote-First Agency</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-3.5 h-3.5 mt-1 text-[#D4AF7A]" />
                    <div>
                      <p className="font-medium">Your Local Time</p>
                      <p className="text-gray-400">{localTime}</p>
                      <p className="text-gray-500 text-sm">{timezone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-4">Follow us</p>
                  <div className="flex gap-4">
                    {[Instagram, Facebook, Linkedin, Twitter].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#D4AF7A] transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400 italic">
                    Our team typically responds within 24 hours during business days.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Booking Widget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <BookingWidget />
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  );
}
