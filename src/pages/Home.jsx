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
    name: "NeedMo Consult",
    image: "https://needmoconsult.com/images/logo.png",
    description:
      "Strategic social media management agency for businesses, creators, and brands",
    url: "https://needmoconsult.com",
    telephone: "+1-555-123-4567",
    email: "hello@needmoconsult.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Los Angeles",
      addressRegion: "CA",
      addressCountry: "US",
    },
    priceRange: "$400-$4500",
    areaServed: "Worldwide",
    serviceType: [
      "Social Media Management",
      "Content Creation",
      "Paid Advertising",
      "Social Media Strategy",
    ],
    sameAs: [
      "https://www.facebook.com/needmoconsult",
      "https://www.instagram.com/needmoconsult",
      "https://www.linkedin.com/company/needmoconsult",
      "https://twitter.com/needmoconsult",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NeedMo Consult",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "50",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Sarah Chen" },
        datePublished: "2025-12-15",
        reviewBody:
          "NEEDMO transformed our social presence. In 3 months, we saw a 250% increase in engagement.",
        reviewRating: { "@type": "Rating", ratingValue: "5" },
      },
    ],
  },
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
