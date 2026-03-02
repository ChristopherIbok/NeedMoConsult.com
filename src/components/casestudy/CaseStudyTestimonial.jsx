import React from "react";
import { motion } from "framer-motion";

export default function CaseStudyTestimonial({ testimonial }) {
  return (
    <section className="py-16 md:py-20 bg-[#FFF5F0] dark:bg-[#1E1208]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-6xl text-[#FF6B35]/30 font-serif leading-none mb-4">
            "
          </div>
          <blockquote className="text-xl md:text-2xl text-[#1A2332] dark:text-white italic leading-[1.8] mb-10 font-light">
            {testimonial.quote}
          </blockquote>

          <div className="flex items-center justify-center gap-4">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6B35]/30"
            />
            <div className="text-left">
              <div className="font-bold text-[#1A2332] dark:text-white">
                {testimonial.name}
              </div>
              <div className="text-sm text-[#555] dark:text-gray-400">
                {testimonial.title}
              </div>
              <div className="text-sm text-[#FF6B35] font-medium">
                {testimonial.company}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[#FF6B35] text-xl">
                ★
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
