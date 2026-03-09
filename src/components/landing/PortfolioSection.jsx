import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ExternalLink,
  Eye,
  TrendingUp,
  Users,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/portfolio/VideoModal";

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
    client: "BrightStart Wellness",
    project: "Instagram Reels Series",
    description: "Created 30-day wellness challenge content series with branded templates and engaging captions",
    results: { views: "250K", engagement: "15%", followers: "+5K" },
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    videoId: "fFVyiiU4jZA", // Real wellness video example
  },
  {
    id: 2,
    type: "video",
    category: "paid",
    client: "Urban Threads",
    project: "TikTok Ad Campaign",
    description: "Launch campaign for new clothing line targeting Gen Z audience",
    results: { impressions: "500K", ctr: "12%", revenue: "$30K" },
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    videoId: "L7fXvE8zYgI", // Replace with a real TikTok style ad link
  },
  {
    id: 3,
    type: "image",
    category: "content",
    client: "Local Coffee Co.",
    project: "Content Calendar & Design",
    description:
      "Monthly content strategy with branded templates, photography, and cohesive feed aesthetics",
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
      "B2B content strategy for founder's personal brand and company page",
    results: { followers: "+15K", deals: "3", leads: "50/month" },
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
      "Full-service content production and account management for fitness creator",
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
      "Meta ads campaign (Facebook + Instagram) for holiday season launch",
    results: { roas: "5x", revenue: "$100K", customers: "10K" },
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  },
];

// 2. FIX THE STATS TO USE THE SAME NUMERIC LOGIC WE USED IN THE ABOUT SECTION
const stats = [
  { icon: Heart, numericValue: 500, suffix: "+", label: "Posts Created" },
  { icon: Users, numericValue: 50, suffix: "+", label: "Happy Clients" },
  { icon: TrendingUp, numericValue: 3, suffix: "M+", label: "People Reached" },
  { icon: Eye, numericValue: 8.5, suffix: "%", label: "Avg. Engagement" },
];

export default function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

 return (
    <section className="py-20 md:py-28 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
            Our Work
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Work That Speaks for Itself
          </h2>
          <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl mx-auto">
            Real campaigns. Real results. Real growth for brands like yours.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-[#D4AF7A] text-white"
                  : "bg-white dark:bg-[#1E2830] text-[#333333] dark:text-gray-300 border border-gray-200 dark:border-[#2A3540] hover:border-[#D4AF7A]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence mode="wait">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  item.featured ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Image/Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.thumbnail || item.image}
                    alt={item.project}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white/90 text-sm mb-3">
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

                  {/* Play Button for Videos */}
                  {item.type === "video" && (
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#D4AF7A] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                    >
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </button>
                  )}

                  {/* Featured Badge */}
                  {item.featured && (
                    <Badge className="absolute top-4 left-4 bg-[#D4AF7A] text-white">
                      Featured Project
                    </Badge>
                  )}

                  {/* Category Badge */}
                  <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-[#1E2830]/90 text-[#333333] dark:text-gray-300">
                    {categories.find((c) => c.id === item.category)?.label}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm text-[#D4AF7A] font-medium mb-1">
                    {item.client}
                  </p>
                  <h3 className="text-lg font-bold text-[#1A2332] dark:text-white mb-2">
                    {item.project}
                  </h3>
                  <button className="text-sm text-[#D4AF7A] font-medium flex items-center gap-1 hover:underline">
                    View Details <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Section - FIXED WITH ANIMATED COUNTER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1E2830] rounded-2xl p-8 md:p-12 shadow-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-[#D4AF7A] mx-auto mb-3" />
                {/* Use the same baseline flex logic we used in the About section */}
                <p className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white flex items-baseline justify-center">
                  <AnimatedCounter value={stat.numericValue} />
                  <span>{stat.suffix}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        </div>

      <VideoModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}