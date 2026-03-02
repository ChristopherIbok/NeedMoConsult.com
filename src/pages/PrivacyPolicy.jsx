import React from "react";
import SEO from "@/components/ui/SEO";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you fill out our contact form or request a strategy call. This may include your name, email address, company name, phone number, and any other information you choose to provide.\n\nWe also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our site.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:\n• Respond to your inquiries and fulfill your requests\n• Send you marketing communications (with your consent)\n• Improve our website and services\n• Analyze usage trends and optimize our content\n• Comply with legal obligations`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep your information confidential.`,
  },
  {
    title: "4. Cookies",
    content: `Our website uses cookies and similar tracking technologies to enhance your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our site may not function properly.`,
  },
  {
    title: "5. Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications from us at any time by contacting us at hello@needmoconsult.com or by following the unsubscribe instructions in our emails.`,
  },
  {
    title: "7. Third-Party Links",
    content: `Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date. Your continued use of our website after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: "9. Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at:\n\nNEEDMO CONSULT\nLos Angeles, CA\nhello@needmoconsult.com\n+1 (555) 123-4567`,
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="pt-20">
      <SEO
        title="Privacy Policy | NEEDMO CONSULT"
        description="Read NEEDMO CONSULT's Privacy Policy to understand how we collect, use, and protect your personal information."
        canonical="https://needmoconsult.com/privacy-policy"
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-4">
              Legal
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Last updated: February 26, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white dark:bg-[#0F1419]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#333333] dark:text-gray-300 text-base leading-relaxed mb-10"
          >
            At NEEDMO CONSULT, we are committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our website or use our services.
          </motion.p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <h2 className="text-xl font-bold text-[#1A2332] dark:text-white mb-3">
                  {section.title}
                </h2>
                <p className="text-[#333333] dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
s;
