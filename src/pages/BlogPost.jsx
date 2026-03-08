import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Twitter, Linkedin, Link2, Facebook, Check, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogPost() {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", id)
      .single();
    setPost(data);
    setLoading(false);
  };

  const pageUrl = window.location.href;
  const pageTitle = post?.hero_title || post?.subject || "NEEDMO CONSULT Insights";

  const share = {
    twitter: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}&via=needmoconsult`, "_blank"),
    linkedin: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank"),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank"),
    copy: () => {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-0.5 bg-[#D4AF7A] animate-pulse" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "Georgia, serif" }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4" style={{ fontFamily: "Georgia, serif" }}>Article not found.</p>
          <Link to={createPageUrl("Blog")} className="text-[#D4AF7A] text-sm underline" style={{ fontFamily: "Georgia, serif" }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const tips = post.tips || [];
  const date = new Date(post.sent_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#0F1419]">

      {/* Top gold rule */}
      <div className="h-0.5 bg-[#D4AF7A] fixed top-0 left-0 right-0 z-50" />

      {/* Back nav */}
      <div className="pt-24 pb-0 px-6 max-w-3xl mx-auto">
        <Link
          to={createPageUrl("Blog")}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#D4AF7A] transition-colors mb-10"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Blog
        </Link>
      </div>

      {/* Article header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pb-12 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[#D4AF7A] text-xs tracking-[4px] uppercase" style={{ fontFamily: "Georgia, serif" }}>
            Issue No. {post.issue || "—"}
          </span>
          <span className="text-gray-300 dark:text-white/20">·</span>
          <span className="flex items-center gap-1.5 text-gray-400 text-xs" style={{ fontFamily: "Georgia, serif" }}>
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-normal text-[#1A2332] dark:text-white leading-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
          {post.hero_title}
        </h1>

        {/* Rule */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-px bg-[#D4AF7A]" />
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </div>

        <p className="text-lg text-gray-500 dark:text-white/60 leading-relaxed mb-8" style={{ fontFamily: "Georgia, serif" }}>
          {post.hero_intro}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-[#D4AF7A] border border-[#D4AF7A]/30 px-2.5 py-0.5" style={{ fontFamily: "Georgia, serif" }}>#{tag}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-white/10 max-w-3xl mx-auto" />

      {/* Article body */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-12 max-w-3xl mx-auto"
      >

        {/* Featured Article section */}
        {post.article_title && (
          <section className="mb-14">
            <p className="text-xs text-[#D4AF7A] tracking-[4px] uppercase mb-4" style={{ fontFamily: "Georgia, serif" }}>Featured Article</p>
            <h2 className="text-2xl font-normal text-[#1A2332] dark:text-white mb-5 leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              {post.article_title}
            </h2>
            <p className="text-base text-gray-600 dark:text-white/70 leading-relaxed mb-6" style={{ fontFamily: "Georgia, serif" }}>
              {post.article_body}
            </p>

            {/* Pull quote */}
            {post.pull_quote && (
              <blockquote className="border-l-2 border-[#D4AF7A] pl-6 py-4 bg-[#F9F7F4] dark:bg-[#1A2332]/40 mb-6">
                <p className="text-xl font-normal italic text-[#1A2332] dark:text-white leading-relaxed mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  "{post.pull_quote}"
                </p>
                <p className="text-xs text-[#B8A882] tracking-[3px] uppercase" style={{ fontFamily: "Georgia, serif" }}>— NEEDMO CONSULT</p>
              </blockquote>
            )}

            {post.article_url && (
              <a
                href={post.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs border border-[#1A2332] dark:border-white/30 text-[#1A2332] dark:text-white px-5 py-2.5 hover:bg-[#1A2332] hover:text-[#D4AF7A] transition-colors"
                style={{ fontFamily: "Georgia, serif", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                Read Full Article <ArrowLeft className="w-3 h-3 rotate-180" />
              </a>
            )}
          </section>
        )}

        {/* Section break */}
        {tips.length > 0 && post.article_title && (
          <div className="flex items-center gap-2 mb-14">
            <div className="w-10 h-px bg-[#D4AF7A]" />
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <section className="mb-14">
            <p className="text-xs text-[#D4AF7A] tracking-[4px] uppercase mb-2" style={{ fontFamily: "Georgia, serif" }}>Quick Tips</p>
            <h2 className="text-2xl font-normal text-[#1A2332] dark:text-white mb-8" style={{ fontFamily: "Georgia, serif" }}>
              Actionable Insights For This Week
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-6 py-5">
                  <span className="text-sm text-[#D4AF7A] min-w-[28px] pt-0.5" style={{ fontFamily: "Georgia, serif" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1A2332] dark:text-white mb-1.5" style={{ fontFamily: "Georgia, serif" }}>{tip.title}</p>
                    <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Offer */}
        {post.offer_title && (
          <>
            <div className="h-px bg-gray-200 dark:bg-white/10 mb-14" />
            <section className="bg-[#1A2332] p-8 mb-14">
              <div className="h-0.5 bg-[#D4AF7A] -mt-8 mb-8" />
              <p className="text-xs text-[#D4AF7A] tracking-[4px] uppercase mb-4" style={{ fontFamily: "Georgia, serif" }}>Exclusive Offer</p>
              <h2 className="text-2xl font-normal text-white mb-4 leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                {post.offer_title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed mb-6" style={{ fontFamily: "Georgia, serif" }}>
                {post.offer_body}
              </p>
              <a
                href={post.offer_url || "https://needmoconsult.com/Contact"}
                className="inline-block bg-[#D4AF7A] text-[#1A2332] text-xs px-7 py-3 hover:bg-[#C49A5E] transition-colors"
                style={{ fontFamily: "Georgia, serif", letterSpacing: "0.2em", textTransform: "uppercase" }}
              >
                {post.offer_label || "Book Free Strategy Call"} →
              </a>
            </section>
          </>
        )}

        {/* Sign-off */}
        <div className="h-px bg-gray-200 dark:bg-white/10 mb-10" />
        <div className="mb-10">
          <p className="text-sm text-gray-400 italic mb-2" style={{ fontFamily: "Georgia, serif" }}>Until next week,</p>
          <p className="text-3xl font-normal italic text-[#1A2332] dark:text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>Chris</p>
          <p className="text-sm font-bold text-[#1A2332] dark:text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>Founder, NEEDMO CONSULT</p>
          <p className="text-xs text-[#B8A882] tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
            Social Media Strategist · Video Editor · Content Consultant
          </p>
        </div>

        {/* Share */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-10">
          <p className="text-xs text-gray-400 tracking-[3px] uppercase mb-5" style={{ fontFamily: "Georgia, serif" }}>Share this article</p>
          <div className="flex items-center gap-3">
            <button
              onClick={share.twitter}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/60 hover:border-[#D4AF7A] hover:text-[#D4AF7A] dark:hover:border-[#D4AF7A] dark:hover:text-[#D4AF7A] transition-colors"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
            >
              <Twitter className="w-3.5 h-3.5" /> Twitter
            </button>
            <button
              onClick={share.linkedin}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/60 hover:border-[#D4AF7A] hover:text-[#D4AF7A] dark:hover:border-[#D4AF7A] dark:hover:text-[#D4AF7A] transition-colors"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </button>
            <button
              onClick={share.facebook}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/60 hover:border-[#D4AF7A] hover:text-[#D4AF7A] dark:hover:border-[#D4AF7A] dark:hover:text-[#D4AF7A] transition-colors"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
            >
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </button>
            <button
              onClick={share.copy}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/60 hover:border-[#D4AF7A] hover:text-[#D4AF7A] dark:hover:border-[#D4AF7A] dark:hover:text-[#D4AF7A] transition-colors"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em" }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Back to blog */}
        <div className="mt-14 pt-10 border-t border-gray-200 dark:border-white/10">
          <Link
            to={createPageUrl("Blog")}
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#D4AF7A] transition-colors"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            <ArrowLeft className="w-3 h-3" /> All Articles
          </Link>
        </div>
      </motion.div>

    </div>
  );
}