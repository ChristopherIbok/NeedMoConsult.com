import React from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, Users } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Strategy-Led",
    description:
      "We don't just post content. We build custom plans tailored to your audience, platform, and goals.",
  },
  {
    icon: TrendingUp,
    title: "Growth-Focused",
    description:
      "Everything we do ties to measurable outcomes — engagement, leads, sales, and ROI.",
  },
  {
    icon: Users,
    title: "Full-Service",
    description:
      "From content creation to paid ads and account management — we handle it all so you don't have to.",
  },
];

export default function ValueProps() {
  return (
    <section className="py-20 md:py-28 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-[#FF6B35]/10"
              >
                <value.icon className="w-8 h-8 text-[#FF6B35]" />
              </motion.div>

              <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-4">
                {value.title}
              </h3>

              <p className="text-[#333333] dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
