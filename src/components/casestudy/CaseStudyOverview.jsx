import React from "react";
import { motion } from "framer-motion";

export default function CaseStudyOverview({ study }) {
  return (
    <section className="py-16 md:py-20 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#1E2830] rounded-2xl p-8 shadow-sm"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-4">
              The Challenge
            </h3>
            <p className="text-[#555] dark:text-gray-400 leading-relaxed text-[1rem]">
              {study.challenge}
            </p>
          </motion.div>

          {/* Approach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1E2830] rounded-2xl p-8 shadow-sm"
          >
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-4">
              Our Approach
            </h3>
            <p className="text-[#555] dark:text-gray-400 leading-relaxed text-[1rem]">
              {study.approach}
            </p>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1E2830] rounded-2xl p-8 shadow-sm"
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-4">
              The Results
            </h3>
            <div className="space-y-4">
              {study.results.map((r, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-[#D4AF7A]">
                    {r.metric}
                  </div>
                  <div className="text-[#1A2332] dark:text-white font-semibold text-sm">
                    {r.label}
                  </div>
                  <div className="text-xs text-gray-400">{r.detail}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
