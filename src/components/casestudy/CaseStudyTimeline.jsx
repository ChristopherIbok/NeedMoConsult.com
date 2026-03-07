import React from "react";
import { motion } from "framer-motion";

export default function CaseStudyTimeline({ timeline }) {
  return (
    <section className="py-16 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-3">
            Project Timeline
          </h2>
          <p className="text-[#555] dark:text-gray-400">
            How we structured the engagement from day one
          </p>
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-white/10" />
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${timeline.length}, 1fr)` }}
            >
              {timeline.map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pt-12"
                >
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#D4AF7A] border-4 border-white dark:border-[#1A2332] shadow-md z-10" />
                  <div className="bg-white dark:bg-[#1E2830] rounded-xl p-5 shadow-sm">
                    <div className="text-[#D4AF7A] text-xs font-bold uppercase tracking-wider mb-1">
                      {phase.phase}
                    </div>
                    <h4 className="font-bold text-[#1A2332] dark:text-white mb-2 text-sm">
                      {phase.title}
                    </h4>
                    <p className="text-xs text-[#555] dark:text-gray-400 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-0">
          {timeline.map((phase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-[#D4AF7A] border-4 border-white dark:border-[#1A2332] shadow-md flex-shrink-0 mt-6" />
                {i < timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-white/10 my-1" />
                )}
              </div>
              <div className="bg-white dark:bg-[#1E2830] rounded-xl p-5 shadow-sm mb-4 flex-1">
                <div className="text-[#D4AF7A] text-xs font-bold uppercase tracking-wider mb-1">
                  {phase.phase}
                </div>
                <h4 className="font-bold text-[#1A2332] dark:text-white mb-2">
                  {phase.title}
                </h4>
                <p className="text-sm text-[#555] dark:text-gray-400 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
