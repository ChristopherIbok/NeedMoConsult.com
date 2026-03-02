import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function CaseStudyStrategy({ strategy }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-16 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-3">
            Strategy Breakdown
          </h2>
          <p className="text-[#555] dark:text-gray-400">
            How we planned, executed, and optimized
          </p>
        </motion.div>

        <div className="space-y-3">
          {strategy.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-2xl">{section.icon}</span>
                <span className="flex-1 text-lg font-semibold text-[#1A2332] dark:text-white">
                  {section.title}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                  {open === i ? (
                    <Minus className="w-4 h-4 text-[#FF6B35]" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#FF6B35]" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-5 border-t border-gray-100 dark:border-white/10 pt-5">
                      {section.content.map((item, j) => (
                        <div key={j}>
                          <h4 className="font-semibold text-[#1A2332] dark:text-white text-sm mb-1.5">
                            {item.heading}
                          </h4>
                          <p className="text-[#555] dark:text-gray-400 text-sm leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
