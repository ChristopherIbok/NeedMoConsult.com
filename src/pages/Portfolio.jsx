import React, { useState } from "react";
import SEO from "@/components/ui/SEO";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ExternalLink, Eye, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/portfolio/VideoModal";
import ContactCTA from "@/components/landing/ContactCTA";
import { Content } from "@radix-ui/react-select";

const R2 = "https://assets.needmoconsult.com";

const clientToSlug = {
  "BrightStart Wellness": "brightstart-wellness",
  "Urban Threads": "urban-threads",
  "Local Coffee Co.": "local-coffee-co",
};

const categories = [
  { id: "all",      label: "All Work"         },
  { id: "content",  label: "Content Creation" },
  { id: "paid",     label: "Paid Campaigns"   },
  { id: "growth",   label: "Account Growth"   },
  { id: "strategy", label: "Strategy Projects"},
];

// orientation: "vertical" | "horizontal"
// For R2 files use: `${R2}/filename.mp4` or `${R2}/filename.jpg`
// For YouTube use videoId. For self-hosted use videoSrc.
const portfolioItems = [
  {
    id: 1, type: "self", category: "content", orientation: "vertical",
    client: "Upwork Real Estate Test", project: "Conent Editing",
    description: "A Real Estate Dynamic Style video editing for tiktok and instagram.",
    results: { views: "", engagement: "", followers: "" },
    thumbnail: "",
    src: "https://assets.needmoconsult.com/Kafeel-Amed-Reall-Estate-Test-Clip.mp4",         // for self-hosted MP4
  },
  {
    id: 2, type: "self", category: "content", orientation: "vertical",
    client: "Urban Threads", project: "TikTok Ad Campaign",
    description: "Launch campaign for new clothing line targeting Gen Z audience.",
    results: { impressions: "", ctr: "", revenue: "" },
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop",
    src: "https://assets.needmoconsult.com/Kafeel-Amed-Reall-Estate-Test-Clip.mp4",
  },
  {
    id: 3, type: "image", category: "content", orientation: "horizontal",
    client: "Local Coffee Co.", project: "Content Calendar & Design",
    description: "Monthly content strategy with branded templates and cohesive feed aesthetics.",
    results: { engagement: "+180%", visits: "+40%" },
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
  },
  {
    id: 4, type: "case-study", category: "strategy", orientation: "horizontal",
    client: "Tech Startup XYZ", project: "LinkedIn Growth Strategy",
    description: "B2B content strategy for founder's personal brand that generated qualified leads.",
    results: { followers: "+15K", deals: "3", leads: "50/mo" },
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: 5, type: "self", category: "content", orientation: "vertical",
    client: "Nik Shevchenko", project: "Content Creation & Management",
    description: "AI Omni Necklace | Product Launch Promo.",
    results: { followers: "", sponsorships: "", income: "" },
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&fit=crop",
    src: "https://assets.needmoconsult.com/Omi-Neklace.mp4",
  },
  {
    id: 6, type: "image", category: "paid", orientation: "horizontal",
    client: "E-commerce Fashion Brand", project: "Meta Ads Campaign",
    description: "Meta ads campaign (Facebook + Instagram) for holiday season launch.",
    results: { roas: "5x", revenue: "$100K", customers: "10K" },
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  },
  {
    id: 7, type: "image", category: "content", orientation: "horizontal",
    client: "Artisan Bakery", project: "Brand Refresh & Content",
    description: "Complete visual rebrand and content strategy for a local bakery going online.",
    results: { followers: "+8K", orders: "+120%" },
    thumbnail: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
  },
  {
    id: 8, type: "video", category: "growth", orientation: "horizontal",
    client: "SaaS Company", project: "Product Launch Campaign",
    description: "Multi-platform launch strategy for B2B software product.",
    results: { signups: "2.5K", trials: "800", conversions: "12%" },
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 9, type: "case-study", category: "strategy", orientation: "horizontal",
    client: "Restaurant Group", project: "Multi-Location Strategy",
    description: "Social media strategy for restaurant group with 5 locations.",
    results: { reach: "2M+", reservations: "+45%" },
    thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
];

const stats = [
  { icon: Heart,      value: "500+", label: "Posts Created"   },
  { icon: Users,      value: "50+",  label: "Happy Clients"   },
  { icon: TrendingUp, value: "3M+",  label: "People Reached"  },
  { icon: Eye,        value: "8.5%", label: "Avg. Engagement" },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = activeCategory === "all"
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <main className="pt-20">
      <SEO
        title="Portfolio & Case Studies"
        description="See our work: social media campaigns, content creation, and growth strategies for businesses, e-commerce brands, and creators."
        type="website"
        tags={["portfolio","case studies","social media campaigns","content creation"]}
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[#F9F7F4] to-white dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="site-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">Our Work</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-6">Work That Speaks for Itself</h1>
            <p className="text-lg text-[#555555] dark:text-gray-400">Real campaigns. Real results. Real growth for brands like yours.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-[#0F1419]">
        <div className="site-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="text-center">
                <stat.icon className="w-8 h-8 text-[#D4AF7A] mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 bg-[#F9F7F4] dark:bg-[#1A2332]">
        <div className="site-container">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#D4AF7A] text-[#1A2332]"
                    : "bg-white dark:bg-[#1E2830] text-[#333333] dark:text-gray-300 border border-gray-200 dark:border-[#2A3540] hover:border-[#D4AF7A]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry-style grid: vertical items take portrait aspect, horizontal take landscape */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredItems.map((item, index) => {
                const isVertical = item.orientation === "vertical";
                const aspectClass = isVertical ? "aspect-[9/16]" : "aspect-[4/3]";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group break-inside-avoid bg-white dark:bg-[#1E2830] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className={`relative ${aspectClass} overflow-hidden`}>
                      <img
                        src={item.thumbnail?.startsWith("http") ? item.thumbnail : `${R2}/${item.thumbnail}`}
                        alt={`${item.project} - ${item.client}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        <p className="text-white/90 text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.results).map(([key, value]) => (
                            <span key={key} className="text-xs bg-white/20 text-white px-2 py-1 rounded">{value} {key}</span>
                          ))}
                        </div>
                      </div>
                      {/* Play button */}
                      {(item.type === "video" || item.type === "self") && (
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#D4AF7A] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                        >
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </button>
                      )}
                      {item.featured && (
                        <Badge className="absolute top-4 left-4 bg-[#D4AF7A] text-[#1A2332] font-semibold">Featured</Badge>
                      )}
                      <Badge className="absolute top-4 right-4 bg-white/90 dark:bg-[#1E2830]/90 text-[#333333] dark:text-gray-300">
                        {categories.find((c) => c.id === item.category)?.label}
                      </Badge>
                      {/* Orientation tag */}
                      {(item.type === "video" || item.type === "self") && (
                        <span className="absolute bottom-4 left-4 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          {isVertical ? "Vertical" : "Horizontal"}
                        </span>
                      )}
                    </div>

                    {/* Card footer */}
                    <div className="p-5">
                      <p className="text-sm text-[#D4AF7A] font-medium mb-1">{item.client}</p>
                      <h3 className="text-base font-bold text-[#1A2332] dark:text-white mb-2">{item.project}</h3>
                      {clientToSlug[item.client] ? (
                        <Link to={createPageUrl(`CaseStudy?slug=${clientToSlug[item.client]}`)} className="text-sm text-[#D4AF7A] font-medium flex items-center gap-1 hover:underline">
                          View Case Study <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button className="text-sm text-[#D4AF7A] font-medium flex items-center gap-1 hover:underline">
                          View Details <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-[#0F1419]">
        <div className="site-container max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">Ready to See Your Brand Here?</h2>
            <p className="text-lg text-[#555555] dark:text-gray-400 mb-8">Let's create scroll-stopping content and real results for your business.</p>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-semibold px-8">
                Start Your Project <ArrowRight className="w-5 h-5 ml-2" />
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
