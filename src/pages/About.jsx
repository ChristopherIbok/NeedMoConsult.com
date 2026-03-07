import React from "react";
import SEO from "@/components/ui/SEO";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Users,
  Heart,
  Award,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import ContactCTA from "@/components/landing/ContactCTA";

const values = [
  {
    icon: Target,
    title: "Results Over Vanity",
    description:
      "We measure success by outcomes that matter — not likes for the sake of likes.",
  },
  {
    icon: Zap,
    title: "Strategic Creativity",
    description:
      "Every piece of content serves a purpose in your larger growth strategy.",
  },
  {
    icon: Heart,
    title: "Client Partnership",
    description:
      "We treat your brand like our own, because your success is our success.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description:
      "Clear communication, honest reporting, and no hidden surprises.",
  },
];

const stats = [
  { value: "500+", label: "Posts Created" },
  { value: "50+", label: "Happy Clients" },
  { value: "3M+", label: "People Reached" },
  { value: "8.5%", label: "Avg. Engagement" },
];

const team = [
  {
    name: "Christopher Ibok",
    role: "Founder & Media Consultant",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "10+ years in Media and Production. Produced for Fortune 500 brands.",
  },
  {
    name: "Jordan Kim",
    role: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "Award-winning designer with a passion for storytelling through visuals.",
  },
  {
    name: "Sam Chen",
    role: "Paid Media Specialist",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Data-driven marketer who turns ad spend into measurable ROI.",
  },
  {
    name: "Taylor Morgan",
    role: "Content Manager",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    bio: "Former journalist who crafts compelling narratives for brands.",
  },
];

export default function About() {
  return (
    <main className="pt-20">
      <SEO
        title="About Us | NeedMo Consult"
        description="NeedMo Consult is a results-driven social media agency built for brands that refuse to settle. Learn about our mission, values, and team."
        canonical="https://needmoconsult.com/about"
      />
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
                About Us
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-6 leading-tight">
                Built for Brands That Refuse to Settle
              </h1>
              <p className="text-lg text-[#333333] dark:text-gray-400 leading-relaxed mb-6">
                NeedMo Consult is a results-driven social media agency for
                businesses, creators, and brands that know they deserve more. We
                don't believe in vanity metrics. We believe in strategy,
                creativity, and consistency — and we measure success by the
                results we deliver.
              </p>
              <p className="text-lg text-[#333333] dark:text-gray-400 leading-relaxed">
                Whether you're a local business building your first social
                presence or an established brand scaling to new platforms, we're
                here to help you show up online with confidence, clarity, and
                content that actually converts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="bg-white dark:bg-[#1E2830] rounded-2xl p-6 text-center shadow-lg"
                  >
                    <p className="text-3xl font-bold text-[#D4AF7A]">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#1A2332] dark:bg-[#0A0F14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-12 h-12 text-[#D4AF7A] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              To empower businesses and creators with strategic, creative, and
              results-driven social media solutions that build real connections
              and drive measurable growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white dark:bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              What We Stand For
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF7A]/10 flex items-center justify-center mx-auto mb-5">
                  <value.icon className="w-7 h-7 text-[#D4AF7A]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-[#333333] dark:text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-[#F7F7F7] dark:bg-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Meet The Team
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
              The People Behind the Magic
            </h2>
            <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl mx-auto">
              A small but mighty team of strategists, creatives, and growth
              experts dedicated to your success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.role} at NeedMo Consult`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="300"
                    height="300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#D4AF7A] text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-[#333333] dark:text-gray-400 text-sm">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white dark:bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
                Why Choose Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-6">
                What Sets NEEDMO Apart
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Results-First Approach",
                    desc: "Every decision ties back to your business goals, not vanity metrics.",
                  },
                  {
                    title: "Transparent Partnership",
                    desc: "Regular reporting, open communication, and no hidden fees.",
                  },
                  {
                    title: "Flexible Solutions",
                    desc: "Packages that scale with your needs, from startups to enterprise.",
                  },
                  {
                    title: "Dedicated Support",
                    desc: "A real team that knows your brand, not a rotating cast of freelancers.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 hover:bg-[#D4AF7A]/10 transition-colors">
                      <TrendingUp className="w-4 h-4 text-[#D4AF7A]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A2332] dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[#333333] dark:text-gray-400 text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=500&fit=crop"
                alt="NeedMo Consult team collaborating on social media strategy"
                className="rounded-2xl shadow-2xl"
                loading="lazy"
                width="600"
                height="500"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#D4AF7A] text-white rounded-2xl p-6 shadow-xl">
                <p className="text-4xl font-bold">5+</p>
                <p className="text-sm opacity-90">Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}
