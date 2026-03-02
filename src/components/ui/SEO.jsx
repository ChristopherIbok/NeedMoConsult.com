import { useEffect } from "react";

export default function SEO({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = "https://needmoconsult.com/images/og-image.jpg",
  structuredData,
}) {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = selector
          .replace("meta[", "")
          .replace("]", "")
          .split("=");
        el.setAttribute(attrName, attrVal.replace(/"/g, ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // Primary
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", "index, follow");

    // OG
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta(
      'meta[property="og:url"]',
      "content",
      canonical || window.location.href
    );
    setMeta('meta[property="og:image"]', "content", ogImage);
    setMeta('meta[property="og:image:width"]', "content", "1200");
    setMeta('meta[property="og:image:height"]', "content", "630");

    // Twitter
    setMeta('meta[property="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[property="twitter:title"]', "content", title);
    setMeta('meta[property="twitter:description"]', "content", description);
    setMeta('meta[property="twitter:image"]', "content", ogImage);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    if (canonical) canonicalEl.setAttribute("href", canonical);

    // Structured data
    if (structuredData) {
      const existing = document.getElementById("structured-data");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      if (structuredData) {
        const el = document.getElementById("structured-data");
        if (el) el.remove();
      }
    };
  }, [title, description, canonical, ogImage, ogType, structuredData]);

  return null;
}
