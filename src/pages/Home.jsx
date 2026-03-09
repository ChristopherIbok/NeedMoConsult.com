import React from "react";
import SEO from "@/components/ui/SEO";
import HeroSection from "@/components/landing/HeroSection";
import ValueProps from "@/components/landing/ValueProps";
import ServicesOverview from "@/components/landing/ServicesOverview";
import PortfolioSection from "@/components/landing/PortfolioSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import AboutSection from "@/components/landing/AboutSection";
import ContactCTA from "@/components/landing/ContactCTA";

const homepageStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "NeedMo Consult",
    "url": "https://needmoconsult.com/",
    "logo": "https://needmoconsult.com/logo.png",
    "image": "https://needmoconsult.com/og-image.jpg",
    "telephone": "+1-530-626-4474", 
    "email": "hello@needmoconsult.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "882 Maria Way",
      "addressLocality": "Placerville",
      "addressRegion": "CA",
      "postalCode": "95667",
      "addressCountry": "US"
    },
    "priceRange": "$400-$4500",
    "areaServed": "Worldwide",
    "serviceType": [
      "Social Media Management",
      "Content Creation",
      "Paid Advertising",
      "Social Media Strategy"
    ],
    "sameAs": [
      "https://www.facebook.com/needmoconsult",
      "https://www.instagram.com/needmoconsult",
      "https://www.linkedin.com/company/needmoconsult",
      "https://twitter.com/needmoconsult"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NeedMo Consult",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "50"
    },
    // FIXED: Correctly nested inside the Organization object
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Sarah Chen" },
        "datePublished": "2025-12-15",
        "reviewBody": "NEEDMO transformed our social presence. In 3 months, we saw a 250% increase in engagement.",
        "reviewRating": { "@type": "Rating", "ratingValue": "5" }
      }
    ]
  }
];

export default function Home() {
  return (
    <main>
      <SEO
        title="NeedMo Consult | Social Media Management Agency"
        description="Strategic social media management for businesses, creators, and brands. Content creation, account management, paid ads, and consulting. Your brand deserves more."
        canonical="https://needmoconsult.com/"
        structuredData={homepageStructuredData}
      />
      <HeroSection />
      <ValueProps />
      <ServicesOverview />
      <PortfolioSection />
      <PricingSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactCTA />
    </main>
  );
}