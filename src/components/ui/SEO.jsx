import { useEffect } from "react";

/**
 * SEO — injects meta tags into <head> dynamically.
 * Safe against null/undefined/non-string values.
 */
export default function SEO({
  title,
  description,
  image,
  url,
  type = "article",
  publishedAt,
  tags = [],
}) {
  useEffect(() => {
    const siteName  = "NEEDMO CONSULT";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDesc = "Brand intelligence, social media strategy and content consulting insights from NEEDMO CONSULT.";
    const desc      = (typeof description === "string" && description) ? description : defaultDesc;
    const canonical = (typeof url === "string" && url) ? url : window.location.href;
    const ogImage   = (typeof image === "string" && image)
      ? image
      : "https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.webp?V=6?V=5";
    const safeTags  = Array.isArray(tags) ? tags.filter(t => typeof t === "string") : [];

    // ── Page title ───────────────────────────────────────────────
    document.title = fullTitle;

    // ── Upsert <meta> ────────────────────────────────────────────
    const setMeta = (name, nameAttr, value) => {
      if (typeof value !== "string" || !value) return;
      let el = document.querySelector(`meta[${nameAttr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameAttr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // ── Upsert <link> ────────────────────────────────────────────
    const setLink = (rel, href) => {
      if (typeof href !== "string" || !href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Standard ─────────────────────────────────────────────────
    setMeta("description",  "name",     desc);
    setMeta("robots",       "name",     "index, follow");
    if (safeTags.length) setMeta("keywords", "name", safeTags.join(", "));
    setLink("canonical", canonical);

    // ── Open Graph ───────────────────────────────────────────────
    setMeta("og:type",                "property", type);
    setMeta("og:title",               "property", fullTitle);
    setMeta("og:description",         "property", desc);
    setMeta("og:url",                 "property", canonical);
    setMeta("og:image",               "property", ogImage);
    setMeta("og:image:width",         "property", "1200");
    setMeta("og:image:height",        "property", "630");
    setMeta("og:site_name",           "property", siteName);
    if (publishedAt && typeof publishedAt === "string") {
      setMeta("article:published_time", "property", publishedAt);
    }

    // ── Twitter Card ─────────────────────────────────────────────
    setMeta("twitter:card",        "name", image ? "summary_large_image" : "summary");
    setMeta("twitter:site",        "name", "@needmoconsult");
    setMeta("twitter:title",       "name", fullTitle);
    setMeta("twitter:description", "name", desc);
    setMeta("twitter:image",       "name", ogImage);

    // ── JSON-LD ──────────────────────────────────────────────────
    const existing = document.querySelector('script[data-seo="needmo"]');
    if (existing) existing.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "BlogPosting" : "WebSite",
      "headline": title || siteName,
      "description": desc,
      "image": ogImage,
      "url": canonical,
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "url": "https://needmoconsult.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.webp?V=6?V=5"
        }
      },
      ...(publishedAt && { "datePublished": publishedAt }),
      ...(safeTags.length && { "keywords": safeTags.join(", ") }),
    };

    try {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "needmo");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    } catch (e) {
      console.warn("SEO: JSON-LD injection failed", e);
    }

    return () => {
      document.title = siteName;
      const s = document.querySelector('script[data-seo="needmo"]');
      if (s) s.remove();
    };
  }, [title, description, image, url, type, publishedAt, tags]);

  return null;
}
