import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Pencil,
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Pencil,
    title: "Content Creation",
    description:
      "Scroll-stopping visuals and copy designed to perform across every platform.",
  },
  {
    icon: Calendar,
    title: "Account Management",
    description:
      "Consistent posting, engagement, and community building — done for you.",
  },
  {
    icon: BarChart3,
    title: "Paid Advertising",
    description:
      "Targeted campaigns that turn ad spend into measurable results.",
  },
  {
    icon: Lightbulb,
    title: "Strategy & Consulting",
    description:
      "Audits, roadmaps, and expert guidance to level up your social presence.",
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Our Services
          </h2>
          <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl mx-auto">
            End-to-end social media management tailored to your growth goals
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + index * 0.12,
                type: "spring",
                stiffness: 180,
                damping: 22,
              }}
              whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
              className="group relative bg-white dark:bg-[#1E2830] border border-gray-200 dark:border-[#2A3540] rounded-2xl p-8 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#D4AF7A]/10 flex items-center justify-center group-hover:bg-[#D4AF7A] transition-colors">
                  <service.icon className="w-6 h-6 text-[#D4AF7A] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[#333333] dark:text-gray-400 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <Link
                    to={createPageUrl("Services")}
                    className="inline-flex items-center text-[#D4AF7A] font-medium text-sm hover:underline group-hover:gap-2 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <Link to={createPageUrl("Services")}>
            <Button
              size="lg"
              className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-white font-semibold px-8 transition-all hover:scale-105 btn-ripple"
            >
              View All Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
