import React from "react";
import SEO from "@/components/ui/SEO";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Calendar,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  MessageSquare,
  Camera,
  Video,
  PenTool,
  Globe,
  Layout,
  Smartphone,
  ShoppingCart,
} from "lucide-react";
import ContactCTA from "@/components/landing/ContactCTA";

const mainServices = [
  {
    icon: Pencil,
    title: "Content Creation",
    subtitle: "Scroll-stopping content that converts",
    description:
      "We create content that captures attention and drives action. From stunning visuals to compelling copy, every piece is designed to resonate with your audience and align with your brand.",
    features: [
      "Custom graphics and brand visuals",
      "Video production and editing",
      "Copywriting for all platforms",
      "Story and reel creation",
      "Photography direction",
      "Content templates and guides",
    ],
    subServices: [
      { icon: Camera, name: "Photography" },
      { icon: Video, name: "Video Production" },
      { icon: PenTool, name: "Graphic Design" },
      { icon: MessageSquare, name: "Copywriting" },
    ],
  },
  {
    icon: Calendar,
    title: "Account Management",
    subtitle: "Your social media, handled",
    description:
      "From daily posting to community engagement, we take care of everything so you can focus on running your business. Consistent, strategic, and always on-brand.",
    features: [
      "Daily posting and scheduling",
      "Community management",
      "DM and comment responses",
      "Follower growth strategies",
      "Platform optimization",
      "Monthly content calendars",
    ],
    subServices: [
      { icon: Calendar, name: "Scheduling" },
      { icon: MessageSquare, name: "Engagement" },
      { icon: Target, name: "Growth" },
      { icon: Sparkles, name: "Optimization" },
    ],
  },
  {
    icon: BarChart3,
    title: "Paid Advertising",
    subtitle: "Turn ad spend into results",
    description:
      "Strategic paid campaigns across Meta, TikTok, LinkedIn, and more. We optimize for conversions, not just clicks, ensuring every dollar works harder for your business.",
    features: [
      "Meta (Facebook & Instagram) ads",
      "TikTok advertising",
      "LinkedIn B2B campaigns",
      "Retargeting strategies",
      "A/B testing and optimization",
      "Detailed ROI reporting",
    ],
    subServices: [
      { icon: Target, name: "Targeting" },
      { icon: BarChart3, name: "Analytics" },
      { icon: Sparkles, name: "Optimization" },
      { icon: TrendingUp, name: "Scaling" },
    ],
  },
  {
    icon: Globe,
    title: "Web Design",
    subtitle: "Beautiful websites that convert visitors into clients",
    description:
      "We design and build modern, fast, and mobile-friendly websites that reflect your brand and drive real business results. From landing pages to full business websites, we've got you covered.",
    features: [
      "Custom website design",
      "Mobile-responsive layouts",
      "Landing page development",
      "E-commerce solutions",
      "SEO-optimized structure",
      "Speed and performance optimization",
    ],
    subServices: [
      { icon: Layout, name: "UI/UX Design" },
      { icon: Smartphone, name: "Mobile-First" },
      { icon: ShoppingCart, name: "E-Commerce" },
      { icon: TrendingUp, name: "SEO" },
    ],
  },
  {
    icon: Lightbulb,
    title: "Strategy & Consulting",
    subtitle: "Expert guidance for growth",
    description:
      "Not ready for full management? Get expert insights with our strategy and consulting services. We'll audit your current presence and create a roadmap for success.",
    features: [
      "Social media audits",
      "Platform strategy development",
      "Content strategy planning",
      "Competitor analysis",
      "Brand positioning guidance",
      "Team training and workshops",
    ],
    subServices: [
      { icon: Lightbulb, name: "Strategy" },
      { icon: Target, name: "Audits" },
      { icon: Sparkles, name: "Training" },
      { icon: MessageSquare, name: "Consulting" },
    ],
  },
];

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Social Media Management",
  provider: { "@type": "Organization", name: "NEEDMO CONSULT" },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Social Media Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Content Creation",
          description:
            "Professional social media content creation including graphics, videos, and copywriting",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Account Management",
          description:
            "Full-service social media account management and community engagement",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Paid Advertising",
          description:
            "Strategic paid social media advertising campaigns across all platforms",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Web Design",
          description:
            "Custom website design and development for businesses and brands",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Strategy & Consulting",
          description:
            "Expert social media strategy and consulting services for brand growth",
        },
      },
    ],
  },
};

export default function Services() {
  return (
    <main className="pt-20">
      <SEO
        title="Social Media Management Services | NEEDMO CONSULT"
        description="Content creation, account management, paid advertising, web design, and strategic consulting. Full-service social media solutions for growing brands."
        canonical="https://needmoconsult.com/services"
        structuredData={servicesStructuredData}
      />
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F4F4F6] dark:from-[#0D1117] dark:to-[#121C2D]">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Our Services
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#121C2D] dark:text-white mb-6">
              Everything You Need to Win on Social
            </h1>
            <p className="text-lg text-[#2D2D3A] dark:text-gray-400">
              From content creation to paid advertising, we offer comprehensive
              social media solutions tailored to your goals and budget.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20 bg-white dark:bg-[#0D1117]">
        <div className="site-container">
          <div className="space-y-24">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="w-14 h-14 rounded-2xl bg-[#D4AF7A]/10 flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-[#D4AF7A]" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-[#121C2D] dark:text-white mb-3">
                    {service.title}
                  </h2>
                  <p className="text-lg text-[#D4AF7A] font-medium mb-4">
                    {service.subtitle}
                  </p>
                  <p className="text-[#2D2D3A] dark:text-gray-400 leading-relaxed mb-8">
                    {service.description}
                  </p>

                  <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-3.5 h-3.5 text-[#D4AF7A] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#2D2D3A] dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to={createPageUrl("Contact")}>
                    <Button className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-white font-semibold">
                      Get Started
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Visual */}
                <div
                  className={`relative ${
                    index % 2 === 1 ? "lg:col-start-1" : ""
                  }`}
                >
                  <div className="bg-[#F4F4F6] dark:bg-[#1E2830] rounded-3xl p-8 md:p-12">
                    <div className="grid grid-cols-2 gap-4">
                      {service.subServices.map((sub, i) => (
                        <motion.div
                          key={sub.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white dark:bg-[#0D1117] rounded-2xl p-6 text-center shadow-lg"
                        >
                          <sub.icon className="w-8 h-8 text-[#D4AF7A] mx-auto mb-3" />
                          <p className="text-sm font-medium text-[#121C2D] dark:text-white">
                            {sub.name}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#D4AF7A]/10 rounded-full blur-xl" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-[#F4F4F6] dark:bg-[#121C2D]">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Our Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#121C2D] dark:text-white mb-4">
              How We Work With You
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery",
                desc: "We learn about your brand, goals, and audience.",
              },
              {
                step: "02",
                title: "Strategy",
                desc: "We create a custom plan tailored to your needs.",
              },
              {
                step: "03",
                title: "Execution",
                desc: "We bring the strategy to life with quality content.",
              },
              {
                step: "04",
                title: "Optimize",
                desc: "We analyze, refine, and scale what works.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <p className="text-6xl font-bold text-[#D4AF7A]/20 mb-4">
                  {item.step}
                </p>
                <h3 className="text-xl font-bold text-[#121C2D] dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#2D2D3A] dark:text-gray-400 text-sm">
                  {item.desc}
                </p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 border-t-2 border-dashed border-[#D4AF7A]/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}
