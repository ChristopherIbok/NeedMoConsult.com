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

const R2 = "https://assets.needmoconsult.com";

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
    client: "Upwork Real Estate Test", project: "Content Editing",
    description: "A Real Estate Dynamic Style video editing for tiktok and instagram.",
    results: { views: "", engagement: "", followers: "" },
    src: "https://assets.needmoconsult.com/Kafeel-Amed-Reall-Estate-Test-Clip.mp4",
  },
  {
    id: 2, type: "self", category: "content", orientation: "vertical",
    client: "Urban Threads", project: "TikTok Ad Campaign",
    description: "Launch campaign for new clothing line targeting Gen Z audience.",
    results: { impressions: "", ctr: "", revenue: "" },
    src: "https://assets.needmoconsult.com/Kafeel-Amed-Reall-Estate-Test-Clip.mp4",
  },
  {
    id: 3, type: "self", category: "content", orientation: "vertical",
    client: "Eunice Thomas", project: "Birthday Celebration Video",
    description: "Happy birthday video portfolio piece showcasing creative editing.",
    results: { views: "", engagement: "", followers: "" },
    src: "https://assets.needmoconsult.com/HAPPY%20BIRTHDAY%20EUNICE%20THOMAS.mp4",
  },
  {
    id: 4, type: "self", category: "content", orientation: "vertical",
    client: "Nik Shevchenko", project: "Content Creation & Management",
    description: "AI Omni Necklace | Product Launch Promo.",
    results: { followers: "", sponsorships: "", income: "" },
    src: "https://assets.needmoconsult.com/Omi-Neklace.mp4",
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
                      {item.thumbnail?.endsWith('.mp4') || item.src?.endsWith('.mp4') ? (
                        <video
                          src={item.src || item.thumbnail}
                          poster={(item.src || item.thumbnail) + '#t=0.1'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.thumbnail?.startsWith("http") ? item.thumbnail : `${R2}/${item.thumbnail}`}
                          alt={`${item.project} - ${item.client}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
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
                      <h3 className="text-base font-bold text-[#1A2332] dark:text-white">{item.project}</h3>
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
