import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import ValueProps from "@/components/landing/ValueProps";
import ServicesOverview from "@/components/landing/ServicesOverview";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import AboutSection from "@/components/landing/AboutSection";
import ContactCTA from "@/components/landing/ContactCTA";
import SEO from "@/components/ui/SEO";

export default function Home() {
  return (
    <main>
      <SEO
        title="Social Media Management Agency"
        description="Strategic social media management for businesses, creators, and brands. Content creation, account management, paid ads, and consulting. Your brand deserves more."
        type="website"
        tags={["social media management", "content creation", "brand strategy", "Nigeria", "digital marketing"]}
      />
      <HeroSection />
      <ValueProps />
      <ServicesOverview />
      <TestimonialsSection />
      <AboutSection />
      <ContactCTA />
    </main>
  );
}
