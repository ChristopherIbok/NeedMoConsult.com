import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getRelatedStudies } from "./CaseStudyData";

export default function CaseStudyRelated({ relatedSlugs }) {
  const [current, setCurrent] = useState(0);
  const related = getRelatedStudies(relatedSlugs);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % related.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [related.length]);

  const go = (dir) => {
    clearInterval(timerRef.current);
    setCurrent((c) => (c + dir + related.length) % related.length);
  };

  if (!related.length) return null;

  return (
    <section className="py-16 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white">
            More Success Stories
          </h2>
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((cs, i) => (
              <motion.div
                key={cs.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cs.heroImage}
                    alt={cs.client}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-4xl">
                    {cs.logo}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[#D4AF7A] text-xs font-semibold uppercase tracking-wider mb-1">
                    {cs.industry}
                  </p>
                  <h3 className="font-bold text-[#1A2332] dark:text-white text-lg mb-2">
                    {cs.client}
                  </h3>
                  <p className="text-sm text-[#555] dark:text-gray-400 mb-4 line-clamp-2">
                    {cs.tagline}
                  </p>
                  <Link
                    to={createPageUrl(`CaseStudy?slug=${cs.slug}`)}
                    className="inline-flex items-center gap-1.5 text-[#D4AF7A] text-sm font-semibold hover:underline"
                  >
                    View Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {related.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                clearInterval(timerRef.current);
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current % related.length
                  ? "bg-[#D4AF7A] w-6"
                  : "bg-gray-300 dark:bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
