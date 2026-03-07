import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function CaseStudyHero({ study }) {
  return (
    <section className="pt-20">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#0F1419] border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Link
              to={createPageUrl("Home")}
              className="hover:text-[#D4AF7A] transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={createPageUrl("Portfolio")}
              className="hover:text-[#D4AF7A] transition-colors"
            >
              Portfolio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1A2332] dark:text-white font-medium">
              {study.client}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Content */}
      <div className="py-16 md:py-24 bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-7xl mb-6">{study.logo}</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-4 leading-tight">
              {study.client} Growth Story
            </h1>
            <p className="text-lg md:text-xl text-[#555] dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {study.tagline}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative h-[350px] sm:h-[500px] md:h-[600px] overflow-hidden"
      >
        <img
          src={study.heroImage}
          alt={`${study.client} case study`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/60 to-transparent" />
      </motion.div>
    </section>
  );
}
