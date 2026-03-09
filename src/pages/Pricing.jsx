import React, { useState, useEffect } from "react";
import SEO from "@/components/ui/SEO";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, HelpCircle, ArrowRight } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import ContactCTA from "@/components/landing/ContactCTA";

const packages = [
  {
    name: "Starter",
    target: "Local businesses, Emerging creators",
    basePrice: 500,
    features: ["8-12 posts per month","1 platform managed","Basic engagement monitoring","Monthly analytics report","Content calendar","Hashtag strategy"],
    notIncluded: ["Paid advertising","DM management","Strategy sessions"],
  },
  {
    name: "Growth",
    target: "E-commerce, Growing startups, Mid-tier creators",
    basePrice: 1150,
    features: ["16-20 posts per month","2-3 platforms managed","Full engagement + DM management","Bi-weekly reports + strategy call","Content planning & scheduling","Performance optimization","Basic ad campaign support"],
    notIncluded: ["Dedicated account manager","Influencer outreach"],
  },
  {
    name: "Premium",
    target: "Established brands, Influencers",
    basePrice: 2500,
    popular: true,
    features: ["24-30 posts per month","3-4 platforms managed","Full management + community","Weekly reports + strategy sessions","Paid ad campaigns included","Brand partnership support","Priority support","Custom content strategy"],
    notIncluded: ["24/7 support"],
  },
  {
    name: "Premium Plus",
    target: "Enterprise, Top-tier influencers",
    basePrice: 4000,
    features: ["40 posts per month","5 platforms managed","Dedicated account manager","Advanced ads + influencer outreach","Reputation monitoring","Priority 24/7 support","Quarterly strategy reviews","Custom integrations","Crisis management"],
    notIncluded: [],
  },
];

const faqs = [
  { question: "What platforms do you manage?", answer: "We manage all major social platforms including Instagram, Facebook, TikTok, LinkedIn, Twitter/X, YouTube, and Pinterest. The number of platforms depends on your chosen package." },
  { question: "How long are your contracts?", answer: "We offer flexible month-to-month agreements after an initial 3-month commitment. This allows enough time to build momentum and see real results." },
  { question: "What if I need something not included in a package?", answer: "We're happy to create custom packages! Contact us to discuss your specific needs and we'll build a solution that fits." },
  { question: "How do you measure results?", answer: "We track key metrics including engagement rate, follower growth, reach, website traffic, and conversions. You'll receive regular reports with clear insights." },
  { question: "Can I upgrade or downgrade my package?", answer: "Absolutely! You can adjust your package at the start of any billing cycle. We'll help you find the right fit as your needs evolve." },
  { question: "Do you require access to our accounts?", answer: "Yes, we need appropriate access to manage your accounts effectively. We use secure methods and can sign NDAs for sensitive accounts." },
];

const COUNTRY_CURRENCY = {
  NG: "NGN", GB: "GBP", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR",
  CA: "CAD", AU: "AUD", NZ: "NZD", CH: "CHF", JP: "JPY", CN: "CNY",
  IN: "INR", BR: "BRL", MX: "MXN", ZA: "ZAR", KE: "KES", GH: "GHS",
};
const CURRENCY_SYMBOL = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
  NGN: "₦", INR: "₹", JPY: "¥", CNY: "¥", BRL: "R$",
  MXN: "MX$", ZAR: "R", KES: "KSh", GHS: "GH₵", NZD: "NZ$", CHF: "Fr",
};

export default function Pricing() {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const res = await fetch("https://api.country.is/", { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        const code = COUNTRY_CURRENCY[data?.country] || "USD";
        setCurrency(code);
        if (code !== "USD") {
          const rateRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { signal: AbortSignal.timeout(4000) });
          const rateData = await rateRes.json();
          setExchangeRate(rateData?.rates?.[code] || 1);
        }
      } catch { /* keep USD defaults */ }
    };
    detectCurrency();
  }, []);

  const formatPrice = (usdPrice) => {
    const converted = Math.round(usdPrice * exchangeRate);
    return `${CURRENCY_SYMBOL[currency] || "$"}${converted.toLocaleString()}`;
  };

  return (
    <main className="pt-20">
      <SEO
        title="Pricing & Packages"
        description="Transparent pricing for social media management. Packages from $400/month for local businesses to $4,500/month for enterprises. Custom solutions available."
        type="website"
        tags={["pricing","social media packages","content management","Nigeria","digital marketing"]}
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[#F9F7F4] to-white dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="site-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">Transparent Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-6">Simple, Flexible Pricing</h1>
            <p className="text-lg text-[#555555] dark:text-gray-400 mb-4">Choose a package that fits your goals. No hidden fees, no surprises.</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <label className="text-sm text-gray-500 dark:text-gray-400">Currency:</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  if (e.target.value !== "USD") {
                    fetch("https://api.exchangerate-api.com/v4/latest/USD", { signal: AbortSignal.timeout(4000) })
                      .then(r => r.json())
                      .then(data => setExchangeRate(data?.rates?.[e.target.value] || 1))
                      .catch(() => setExchangeRate(1));
                  } else {
                    setExchangeRate(1);
                  }
                }}
                className="text-sm border border-gray-200 dark:border-[#2A3540] bg-white dark:bg-[#1E2830] text-[#1A2332] dark:text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF7A] cursor-pointer"
              >
                {Object.entries(CURRENCY_SYMBOL).map(([code, symbol]) => (
                  <option key={code} value={code}>{symbol} {code}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-[#F9F7F4] dark:bg-[#0F1419]">
        <div className="site-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`relative bg-white dark:bg-[#1E2830] rounded-2xl p-6 border-2 transition-all duration-300 hover:border-[#D4AF7A] ${
                  pkg.popular
                    ? "border-[#D4AF7A] scale-[1.02] shadow-xl"
                    : "border-gray-200 dark:border-[#2A3540]"
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF7A] text-[#1A2332] font-semibold px-4 py-1">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">{pkg.target}</p>
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 uppercase tracking-wider">Starting at</span>
                    <span className="text-4xl font-bold text-[#1A2332] dark:text-white">{formatPrice(pkg.basePrice)}</span>
                    <span className="text-gray-500 dark:text-gray-400">/mo</span>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">What's Included</p>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#D4AF7A] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#333333] dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {pkg.notIncluded.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Not Included</p>
                      <ul className="space-y-2">
                        {pkg.notIncluded.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                              <span className="w-1.5 h-0.5 bg-gray-300 dark:bg-gray-600 rounded" />
                            </span>
                            <span className="text-sm text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link to={createPageUrl("Contact")} className="block">
                  <Button className={`w-full font-semibold transition-all hover:scale-[1.02] ${
                    pkg.popular
                      ? "bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332]"
                      : "bg-[#1A2332] hover:bg-[#2A3342] text-white dark:bg-white dark:text-[#1A2332] dark:hover:bg-gray-100"
                  }`}>
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-[#555555] dark:text-gray-400 mb-2">Need something custom? Let's build a package that fits your exact needs.</p>
            <Link to={createPageUrl("Contact")} className="text-[#D4AF7A] font-medium hover:underline inline-flex items-center gap-1">
              Contact us for custom pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-[#1A2332]">
        <div className="site-container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <HelpCircle className="w-10 h-10 text-[#D4AF7A] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem value={`item-${index}`} className="bg-[#F9F7F4] dark:bg-[#1E2830] rounded-xl px-6 border-none shadow-sm">
                  <AccordionTrigger className="text-left font-semibold text-[#1A2332] dark:text-white hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#555555] dark:text-gray-400 pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}
