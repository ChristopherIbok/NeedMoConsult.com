import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, Pencil, TrendingUp, Users } from "lucide-react";
import { LogoStacked } from "@/components/brand/Logo";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const values = [
  "Results Over Vanity",
  "Strategic Creativity",
  "Client Partnership",
];

const stats = [
  { icon: Pencil, value: "500+", label: "Posts Created" },
  { icon: Users, value: "50+", label: "Happy Clients" },
  { icon: TrendingUp, value: "3M+", label: "People Reached" },
];

export default function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Who We Are
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-6 leading-tight">
              Built for Brands That Refuse to Settle
            </h2>

            <div className="space-y-4 text-[#333333] dark:text-gray-300 leading-relaxed mb-8">
              <p>
                NEEDMO CONSULT is a results-driven social media agency for
                businesses, creators, and brands that know they deserve more. We
                don't believe in vanity metrics. We believe in strategy,
                creativity, and consistency — and we measure success by the
                results we deliver.
              </p>
              <p>
                Whether you're a local business building your first social
                presence or an established brand scaling to new platforms, we're
                here to help you show up online with confidence, clarity, and
                content that actually converts.
              </p>
            </div>

            {/* Values */}
            <div className="flex flex-wrap gap-3 mb-8">
              {values.map((value) => (
                <span
                  key={value}
                  className="px-4 py-2 bg-[#1A2332] dark:bg-white/10 text-white text-sm font-medium rounded-full"
                >
                  {value}
                </span>
              ))}
            </div>

            <Link
              to={createPageUrl("About")}
              className="inline-flex items-center text-[#D4AF7A] font-semibold hover:underline group"
            >
              Learn More About Us
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="relative"
          >
            <div className="bg-white dark:bg-[#1E2830] rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="grid gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center gap-5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#D4AF7A]/10 flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-7 h-7 text-[#D4AF7A]" />
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#D4AF7A]/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#1A2332]/5 dark:bg-white/5 rounded-full blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
