import React, { useState } from "react";
import SEO from "@/components/ui/SEO";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const clientToSlug = {
  "BrightStart Wellness": "brightstart-wellness",
  "Urban Threads": "urban-threads",
  "Local Coffee Co.": "local-coffee-co",
};
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ExternalLink,
  Eye,
  TrendingUp,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/portfolio/VideoPlayer";
import VideoModal from "@/components/portfolio/VideoModal";
import ContactCTA from "@/components/landing/ContactCTA";

const categories = [
  { id: "all", label: "All Work" },
  { id: "content", label: "Content Creation" },
  { id: "paid", label: "Paid Campaigns" },
  { id: "growth", label: "Account Growth" },
  { id: "strategy", label: "Strategy Projects" },
];

const portfolioItems = [
  {
    id: 1,
    type: "video",
    category: "content",
    client: "Professional Vocal Mixing",
    project: "Youtube Video Series",
    description:
      "Created Professional Vocal Mixing Youtube series with branded templates and engaging captions that drove massive engagement.",
    results: { views: "250K", engagement: "15%", followers: "+5K" },
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    videoId: "fFVyiiU4jZA",
  },
  {
    id: 2,
    type: "video",
    category: "paid",
    client: "Urban Threads",
    project: "TikTok Ad Campaign",
    description:
      "Launch campaign for new clothing line targeting Gen Z audience with trendy, authentic content.",
    results: { impressions: "500K", ctr: "12%", revenue: "$30K" },
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    videoId: "fFVyiiU4jZA",
  },
  {
    id: 3,
    type: "image",
    category: "content",
    client: "Local Coffee Co.",
    project: "Content Calendar & Design",
    description:
      "Monthly content strategy with branded templates, photography, and cohesive feed aesthetics.",
    results: { engagement: "+180%", visits: "+40%" },
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
  },
  {
    id: 4,
    type: "case-study",
    category: "strategy",
    client: "Tech Startup XYZ",
    project: "LinkedIn Growth Strategy",
    description:
      "B2B content strategy for founder's personal brand and company page that generated qualified leads.",
    results: { followers: "+15K", deals: "3", leads: "50/mo" },
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: 5,
    type: "video",
    category: "growth",
    client: "Fitness Influencer Sarah",
    project: "Content Creation & Management",
    description:
      "Full-service content production and account management for fitness creator.",
    results: { followers: "+40K", sponsorships: "2", income: "$15K/mo" },
    thumbnail:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 6,
    type: "image",
    category: "paid",
    client: "E-commerce Fashion Brand",
    project: "Meta Ads Campaign",
    description:
      "Meta ads campaign (Facebook + Instagram) for holiday season launch.",
    results: { roas: "5x", revenue: "$100K", customers: "10K" },
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  },
  {
    id: 7,
    type: "image",
    category: "content",
    client: "Artisan Bakery",
    project: "Brand Refresh & Content",
    description:
      "Complete visual rebrand and content strategy for a local bakery going online.",
    results: { followers: "+8K", orders: "+120%" },
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
  },
  {
    id: 8,
    type: "video",
    category: "growth",
    client: "SaaS Company",
    project: "Product Launch Campaign",
    description: "Multi-platform launch strategy for B2B software product.",
    results: { signups: "2.5K", trials: "800", conversions: "12%" },
    thumbnail:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 9,
    type: "case-study",
    category: "strategy",
    client: "Restaurant Group",
    project: "Multi-Location Strategy",
    description: "Social media strategy for restaurant group with 5 locations.",
    results: { reach: "2M+", reservations: "+45%" },
    thumbnail:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
];

const stats = [
  { icon: Heart, value: "500+", label: "Posts Created" },
  { icon: Users, value: "50+", label: "Happy Clients" },
  { icon: TrendingUp, value: "3M+", label: "People Reached" },
  { icon: Eye, value: "8.5%", label: "Avg. Engagement" },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");

  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <main className="pt-20">
      <SEO
        title="Portfolio & Case Studies | NEEDMO CONSULT"
        description="See our work: social media campaigns, content creation, and growth strategies for businesses, e-commerce brands, and creators."
        canonical="https://needmoconsult.com/portfolio"
      />
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-4">
              Our Work
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-6">
              Work That Speaks for Itself
            </h1>
            <p className="text-lg text-[#333333] dark:text-gray-400">
              Real campaigns. Real results. Real growth for brands like yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-[#FF6B35] mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 bg-[#F7F7F7] dark:bg-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white dark:bg-[#1E2830] text-[#333333] dark:text-gray-300 border border-gray-200 dark:border-[#2A3540] hover:border-[#FF6B35]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.thumbnail || item.image}
                      alt={`${item.project} - social media campaign for ${item.client}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      width="600"
                      height="400"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white/90 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(item.results).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-white/20 text-white px-2 py-1 rounded"
                          >
                            {value} {key}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Play Button */}
                    {item.type === "video" && (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                      >
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </button>
                    )}

                    {/* Badges */}
                    {item.featured && (
                      <Badge className="absolute top-4 left-4 bg-[#FF6B35] text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-[#1E2830]/90 text-[#333333] dark:text-gray-300">
                      {categories.find((c) => c.id === item.category)?.label}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-[#FF6B35] font-medium mb-1">
                      {item.client}
                    </p>
                    <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-2">
                      {item.project}
                    </h3>
                    {clientToSlug[item.client] ? (
                      <Link
                        to={createPageUrl(
                          `CaseStudy?slug=${clientToSlug[item.client]}`
                        )}
                        className="text-sm text-[#FF6B35] font-medium flex items-center gap-1 hover:underline"
                      >
                        View Case Study <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <button className="text-sm text-[#FF6B35] font-medium flex items-center gap-1 hover:underline">
                        View Details <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-[#0F1419]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
              Ready to See Your Brand Here?
            </h2>
            <p className="text-lg text-[#333333] dark:text-gray-400 mb-8">
              Let's create scroll-stopping content and real results for your
              business.
            </p>
            <Link to={createPageUrl("Contact")}>
              <Button
                size="lg"
                className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold px-8"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <ContactCTA />

      <VideoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}
