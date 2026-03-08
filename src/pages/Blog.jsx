import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Search, ArrowRight, BookOpen, Calendar, Hash } from "lucide-react";
import SEO from "@/components/ui/SEO";
import { motion } from "framer-motion";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletters")
      .select("id, issue, subject, hero_title, hero_intro, sent_at, tags, image_url")
      .eq("published", true)
      .order("sent_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  // Collect all unique tags
  const allTags = ["All", ...Array.from(new Set(posts.flatMap(p => p.tags || [])))];

  const filtered = posts.filter(p => {
    const matchesQuery =
      !query ||
      p.hero_title?.toLowerCase().includes(query.toLowerCase()) ||
      p.hero_intro?.toLowerCase().includes(query.toLowerCase()) ||
      p.subject?.toLowerCase().includes(query.toLowerCase());
    const matchesTag = activeTag === "All" || (p.tags || []).includes(activeTag);
    return matchesQuery && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#0F1419]">

      <SEO
        title="Insights Blog"
        description="Brand intelligence, social media strategy and content consulting insights from NEEDMO CONSULT."
        type="website"
      />

      {/* Hero */}
      <div className="bg-[#F9F7F4] dark:bg-[#1A2332] pt-32 pb-20 px-6 border-b border-gray-200 dark:border-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#D4AF7A]" />
            <p className="text-[#D4AF7A] text-xs tracking-[4px] uppercase font-light" style={{ fontFamily: "Georgia, serif" }}>
              Brand &amp; Social Intelligence
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-normal text-[#1A2332] dark:text-white mb-5 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            The NEEDMO<br/><em className="text-[#D4AF7A]">Insights</em> Blog
          </h1>
          <p className="text-[#1A2332]/60 dark:text-white/60 text-lg leading-relaxed max-w-xl" style={{ fontFamily: "Georgia, serif" }}>
            Every newsletter we send becomes a permanent resource here. Strategy, tips and brand intelligence — all in one place.
          </p>
        </div>
      </div>
      <div className="h-0.5 bg-[#D4AF7A] dark:bg-[#D4AF7A] bg-opacity-60" />

      {/* Search + Filter */}
      <div className="max-w-3xl mx-auto px-6 py-10 bg-[#F9F7F4] dark:bg-[#0F1419]">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A2332]/60 text-[#1A2332] dark:text-white text-sm outline-none focus:border-[#D4AF7A] transition-colors placeholder:text-gray-400 dark:placeholder:text-white/30"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs border transition-colors ${
                  activeTag === tag
                    ? "border-[#D4AF7A] bg-[#D4AF7A] text-[#1A2332]"
                    : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-[#D4AF7A] hover:text-[#D4AF7A] dark:hover:border-[#D4AF7A] dark:hover:text-[#D4AF7A]"
                }`}
                style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
              >
                {tag !== "All" && <Hash className="w-3 h-3" />}
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-100 dark:bg-white/10 w-24 mb-4 rounded" />
                <div className="h-6 bg-gray-100 dark:bg-white/10 w-3/4 mb-3 rounded" />
                <div className="h-4 bg-gray-100 dark:bg-white/10 w-full mb-2 rounded" />
                <div className="h-4 bg-gray-100 dark:bg-white/10 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-8 h-8 text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-white/40 text-sm" style={{ fontFamily: "Georgia, serif" }}>
              {posts.length === 0 ? "No articles published yet. Send your first newsletter to get started." : "No articles match your search."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-200 dark:divide-white/10">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="py-10 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[#D4AF7A] text-xs tracking-[3px] uppercase" style={{ fontFamily: "Georgia, serif" }}>
                    Issue No. {post.issue || "—"}
                  </span>
                  <span className="text-gray-300 dark:text-white/20 text-xs">·</span>
                  <span className="flex items-center gap-1.5 text-gray-400 dark:text-white/40 text-xs" style={{ fontFamily: "Georgia, serif" }}>
                    <Calendar className="w-3 h-3" />
                    {new Date(post.sent_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>

                <h2 className="text-2xl font-normal text-[#1A2332] dark:text-white mb-3 leading-tight group-hover:text-[#D4AF7A] transition-colors" style={{ fontFamily: "Georgia, serif" }}>
                  {post.hero_title || post.subject}
                </h2>

                <p className="text-gray-500 dark:text-white/50 text-sm leading-relaxed mb-5 line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
                  {post.hero_intro}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-[#D4AF7A] border border-[#D4AF7A]/30 px-2.5 py-0.5" style={{ fontFamily: "Georgia, serif" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Featured image thumbnail */}
                {post.image_url && (
                  <div className="mb-5 overflow-hidden border border-gray-200 dark:border-white/10">
                    <img
                      src={post.image_url}
                      alt={post.hero_title}
                      className="w-full object-cover h-48 hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <Link
                  to={createPageUrl("BlogPost") + `?id=${post.id}`}
                  className="inline-flex items-center gap-2 text-xs text-[#1A2332] dark:text-white border border-[#1A2332] dark:border-white/30 px-5 py-2.5 hover:bg-[#1A2332] hover:text-[#D4AF7A] dark:hover:bg-[#D4AF7A] dark:hover:text-[#1A2332] dark:hover:border-[#D4AF7A] transition-colors"
                  style={{ fontFamily: "Georgia, serif", letterSpacing: "0.15em", textTransform: "uppercase" }}
                >
                  Read Article <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}