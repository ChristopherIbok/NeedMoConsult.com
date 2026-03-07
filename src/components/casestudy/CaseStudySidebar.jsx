import React from "react";
import { motion } from "framer-motion";

const infoItems = [
  { icon: "📅", label: "Timeline", key: "timeline" },
  { icon: "📱", label: "Platforms", key: "platforms" },
  { icon: "⚡", label: "Services", key: "services" },
  { icon: "🏢", label: "Industry", key: "industry" },
];

export default function CaseStudySidebar({ study }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-[#F7F7F7] dark:bg-[#1A2332] rounded-2xl p-6 space-y-4 sticky top-28"
    >
      <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-6">
        Project Details
      </h3>
      {infoItems.map((item) => (
        <div
          key={item.key}
          className="bg-white dark:bg-[#1E2830] rounded-xl p-4 flex items-start gap-3"
        >
          <span className="text-2xl">{item.icon}</span>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
              {item.label}
            </div>
            <div className="text-sm font-medium text-[#1A2332] dark:text-white">
              {study[item.key]}
            </div>
          </div>
        </div>
      ))}
      {study.website && (
        <div className="bg-white dark:bg-[#1E2830] rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">🔗</span>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
              Website
            </div>
            <a
              href={study.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#D4AF7A] hover:underline"
            >
              {study.website.replace("https://", "")}
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
}
