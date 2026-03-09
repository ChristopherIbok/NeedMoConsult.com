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

export default function PricingSection() {
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const res = await fetch("https://api.country.is/", {
          signal: AbortSignal.timeout(3000),
        });
        const data = await res.json();
        const code = COUNTRY_CURRENCY[data?.country] || "USD";
        setCurrency(code);
        if (code !== "USD") {
          const rateRes = await fetch(
            `https://api.exchangerate-api.com/v4/latest/USD`,
            { signal: AbortSignal.timeout(4000) }
          );
          const rateData = await rateRes.json();
          setExchangeRate(rateData?.rates?.[code] || 1);
        }
      } catch {
        // keep USD defaults
      }
    };
    detectCurrency();
  }, []);

  const formatPrice = (usdPrice) => {
    const converted = Math.round(usdPrice * exchangeRate);
    const symbol = CURRENCY_SYMBOL[currency] || "$";
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <section className="py-20 md:py-28 bg-[#F9F7F4] dark:bg-[#1A2332]">
      <div className="site-container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
            Transparent Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2332] dark:text-white mb-4">
            Choose Your Package
          </h2>
          <p className="text-lg text-[#555555] dark:text-gray-400 max-w-2xl mx-auto">
            Flexible plans that grow with your business
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 italic mb-12"
        >
          Prices shown in {currency} based on your location
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: pkg.popular ? 1.02 : 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ y: -8, scale: pkg.popular ? 1.04 : 1.02, transition: { duration: 0.2 } }}
              className={`relative bg-white dark:bg-[#1E2830] rounded-2xl p-6 border-2 transition-colors duration-300 hover:border-[#D4AF7A] hover:shadow-xl cursor-pointer ${
                pkg.popular
                  ? "border-[#D4AF7A] shadow-xl"
                  : "border-gray-200 dark:border-[#2A3540]"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF7A] text-[#1A2332] font-semibold px-4 py-1">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">{pkg.target}</p>
                <div className="mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 uppercase tracking-wider">Starting at</span>
                  <span className="text-4xl font-bold text-[#1A2332] dark:text-white">{formatPrice(pkg.basePrice)}</span>
                  <span className="text-gray-500 dark:text-gray-400">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF7A] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#333333] dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl("Contact")} className="block">
                <Button
                  className={`w-full font-semibold transition-all hover:scale-[1.02] btn-ripple ${
                    pkg.popular
                      ? "bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332]"
                      : "bg-[#1A2332] hover:bg-[#2A3342] text-white dark:bg-white dark:text-[#1A2332] dark:hover:bg-gray-100"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Custom pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[#555555] dark:text-gray-400 mb-2">
            Custom packages available. Let's build something that fits your needs.
          </p>
          <Link to={createPageUrl("Contact")} className="text-[#D4AF7A] font-medium hover:underline">
            Contact us for custom pricing
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
