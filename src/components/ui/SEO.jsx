import { useEffect } from "react";

/**
 * SEO component — injects meta tags into <head> dynamically.
 * Works without react-helmet by directly manipulating the DOM.
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
    const siteName = "NEEDMO CONSULT";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDesc = "Brand intelligence, social media strategy and content consulting insights from NEEDMO CONSULT.";
    const desc = description || defaultDesc;
    const canonical = url || window.location.href;
    const ogImage = image || "https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.webp?V=3";

    // ── Page title ──────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper: upsert a <meta> tag ─────────────────────────────
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = selector.replace("meta[", "").replace("]", "").split('="');
        el.setAttribute(attrName, attrVal.replace('"', ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // ── Helper: upsert a <link> tag ─────────────────────────────
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Standard meta ───────────────────────────────────────────
    setMeta('meta[name="description"]',         "content", desc);
    setMeta('meta[name="robots"]',              "content", "index, follow");
    if (tags.length) {
      setMeta('meta[name="keywords"]',          "content", tags.join(", "));
    }

    // ── Canonical ───────────────────────────────────────────────
    setLink("canonical", canonical);

    // ── Open Graph ──────────────────────────────────────────────
    setMeta('meta[property="og:type"]',         "content", type);
    setMeta('meta[property="og:title"]',        "content", fullTitle);
    setMeta('meta[property="og:description"]',  "content", desc);
    setMeta('meta[property="og:url"]',          "content", canonical);
    setMeta('meta[property="og:image"]',        "content", ogImage);
    setMeta('meta[property="og:image:width"]',  "content", "1200");
    setMeta('meta[property="og:image:height"]', "content", "630");
    setMeta('meta[property="og:site_name"]',    "content", siteName);
    if (publishedAt) {
      setMeta('meta[property="article:published_time"]', "content", publishedAt);
    }

    // ── Twitter Card ────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        "content", image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:site"]',        "content", "@needmoconsult");
    setMeta('meta[name="twitter:title"]',       "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", desc);
    setMeta('meta[name="twitter:image"]',       "content", ogImage);

    // ── Structured data (JSON-LD) ───────────────────────────────
    const existingScript = document.querySelector('script[data-seo="needmo"]');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "BlogPosting" : "WebSite",
      "headline": title,
      "description": desc,
      "image": ogImage,
      "url": canonical,
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "url": "https://needmoconsult.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.webp?V=3",
        }
      },
      ...(publishedAt && { "datePublished": publishedAt }),
      ...(tags.length && { "keywords": tags.join(", ") }),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "needmo");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // ── Cleanup on unmount ──────────────────────────────────────
    return () => {
      document.title = siteName;
      const s = document.querySelector('script[data-seo="needmo"]');
      if (s) s.remove();
    };
  }, [title, description, image, url, type, publishedAt, tags]);

  return null;
}