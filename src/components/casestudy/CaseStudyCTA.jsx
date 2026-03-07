import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CaseStudyCTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2332] via-[#2A3342] to-[#D4AF7A]" />
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Want Results Like These?
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Let's create a custom strategy for your brand and turn your social
            media into a real growth engine.
          </p>

          <Link to={createPageUrl("Contact")}>
            <Button
              size="lg"
              className="bg-white text-[#1A2332] hover:bg-gray-100 font-bold px-10 py-6 text-lg transition-all hover:scale-105 hover:shadow-2xl mb-6"
            >
              Book Your Free Strategy Call
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div>
            <Link
              to={createPageUrl("Pricing")}
              className="text-white/80 hover:text-white underline underline-offset-4 text-sm transition-colors"
            >
              View Our Pricing →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
