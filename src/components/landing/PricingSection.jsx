import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const packages = [
  {
    name: "Starter",
    target: "Local businesses, Emerging creators",
    priceRange: "$400-$600",
    basePrice: 500,
    features: [
      "8-12 posts per month",
      "1 platform managed",
      "Basic engagement monitoring",
      "Monthly analytics report",
      "Content calendar",
      "Hashtag strategy",
    ],
  },
  {
    name: "Growth",
    target: "E-commerce, Growing startups, Mid-tier creators",
    priceRange: "$900-$1,400",
    basePrice: 1150,
    features: [
      "16-20 posts per month",
      "2-3 platforms managed",
      "Full engagement + DM management",
      "Bi-weekly reports + strategy call",
      "Content planning & scheduling",
      "Performance optimization",
    ],
  },
  {
    name: "Premium",
    target: "Established brands, Influencers",
    priceRange: "$2,000-$3,000",
    basePrice: 2500,
    popular: true,
    features: [
      "24-30 posts per month",
      "3-4 platforms managed",
      "Full management + community",
      "Weekly reports + strategy sessions",
      "Paid ad campaigns included",
      "Brand partnership support",
    ],
  },
  {
    name: "Premium Plus",
    target: "Enterprise, Top-tier influencers",
    priceRange: "$3,500-$4,500",
    basePrice: 4000,
    features: [
      "40 posts per month",
      "5 platforms managed",
      "Dedicated account manager",
      "Advanced ads + influencer outreach",
      "Reputation monitoring",
      "Priority 24/7 support",
    ],
  },
];

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
};

export default function PricingSection() {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryCurrency = data.currency || "USD";
        if (currencySymbols[countryCurrency]) {
          setCurrency(countryCurrency);
          // Fetch exchange rate
          if (countryCurrency !== "USD") {
            const rateResponse = await fetch(
              `https://api.exchangerate-api.com/v4/latest/USD`
            );
            const rateData = await rateResponse.json();
            setExchangeRate(rateData.rates[countryCurrency] || 1);
          }
        }
      } catch (error) {
        // Keep defaults
      }
    };
    detectCurrency();
  }, []);

  const formatPrice = (usdPrice) => {
    const converted = Math.round(usdPrice * exchangeRate);
    return `${currencySymbols[currency] || "$"}${converted.toLocaleString()}`;
  };

  return (
    <section className="py-20 md:py-28 bg-[#F7F7F7] dark:bg-[#1A2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mb-4"
        >
          <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-4">
            Transparent Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Choose Your Package
          </h2>
          <p className="text-lg text-[#333333] dark:text-gray-400 max-w-2xl mx-auto">
            Flexible plans that grow with your business
          </p>
        </motion.div>

        {/* Currency Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 italic mb-12"
        >
          Prices shown in {currency} based on your location
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: pkg.popular ? 1.02 : 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 1 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{
                y: -8,
                scale: pkg.popular ? 1.04 : 1.02,
                transition: { duration: 0.2 },
              }}
              className={`relative bg-white dark:bg-[#1E2830] rounded-2xl p-6 border-2 transition-colors duration-300 hover:border-[#FF6B35] hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer ${
                pkg.popular
                  ? "border-[#FF6B35] shadow-xl shadow-orange-500/10"
                  : "border-gray-200 dark:border-[#2A3540]"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-2">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
                  {pkg.target}
                </p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-[#1A2332] dark:text-white">
                    {formatPrice(pkg.basePrice)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or {pkg.priceRange}/mo
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF6B35] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#333333] dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl("Contact")} className="block">
                <Button
                  className={`w-full font-semibold transition-all hover:scale-[1.02] btn-ripple ${
                    pkg.popular
                      ? "bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                      : "bg-[#1A2332] hover:bg-[#2A3342] text-white dark:bg-white dark:text-[#1A2332] dark:hover:bg-gray-100"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Custom Pricing Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[#333333] dark:text-gray-400 mb-2">
            Custom packages available. Let's build something that fits your
            needs.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="text-[#FF6B35] font-medium hover:underline"
          >
            Contact us for custom pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
