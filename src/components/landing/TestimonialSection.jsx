import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "NEEDMO transformed our social presence. In 3 months, we saw a 250% increase in engagement and real leads coming through Instagram.",
    name: "Sarah Chen",
    title: "Founder, BrightStart Wellness",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote:
      "The team at NEEDMO doesn't just post content — they built a strategy that actually converted followers into customers. Game changer.",
    name: "Marcus Johnson",
    title: "CEO, Urban Threads",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote:
      "As a creator, I needed help scaling my content. NEEDMO gave me my time back while growing my audience by 40K in 6 months.",
    name: "Priya Sharma",
    title: "Content Creator & Influencer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-4">
            Client Success
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Brands That Trust NEEDMO
          </h2>
          <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl mx-auto">
            Real results from real partnerships
          </p>
        </motion.div>

        {/* Testimonials - horizontal scroll on mobile, grid on md+ */}
        <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scroll-smooth">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-[#1E2830] rounded-2xl p-6 md:p-8 shadow-lg shadow-black/5 dark:shadow-black/20 flex-shrink-0 w-[calc(100vw-56px)] sm:w-[340px] md:w-auto snap-start cursor-default hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-shadow duration-300"
            >
              <Quote className="w-8 h-8 md:w-10 md:h-10 text-[#FF6B35] mb-4 md:mb-6" />

              <p className="text-[#333333] dark:text-gray-300 leading-relaxed italic mb-5 text-sm md:text-base">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#FF6B35] fill-current"
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-[#1A2332] dark:text-white text-sm md:text-base">
                    {testimonial.name}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 italic mt-8"
        >
          Results vary by industry, strategy, and timeline. These are real
          client outcomes.
        </motion.p>
      </div>
    </section>
  );
}
