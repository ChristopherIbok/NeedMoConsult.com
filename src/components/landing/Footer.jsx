import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { LogoFooter } from "@/components/brand/Logo";

const quickLinks = [
  { name: "Home", page: "Home" },
  { name: "Services", page: "Services" },
  { name: "Pricing", page: "Pricing" },
  { name: "Portfolio", page: "Portfolio" },
  { name: "About", page: "About" },
  { name: "Contact", page: "Contact" },
  { name: "Brand Kit", page: "BrandKit" },
];

const services = [
  { name: "Content Creation", page: "Services" },
  { name: "Account Management", page: "Services" },
  { name: "Paid Advertising", page: "Services" },
  { name: "Strategy & Consulting", page: "Services" },
];

const socials = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export default function Footer() {
  return (
    <footer className="bg-[#121C2D] dark:bg-[#0D1117]">
      <div className="site-container section-y-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="space-y-6 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Link to={createPageUrl("Home")}>
                <LogoFooter />
              </Link>
            </div>
            <p className="text-gray-400 text-sm">Your Brand Deserves More</p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-[#D4AF7A] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={createPageUrl(link.page)}
                    className="block min-h-[44px] flex items-center justify-center md:justify-start text-gray-400 text-sm hover:text-[#D4AF7A] transition-colors leading-[2.2]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-6">Services</h3>
            <ul className="space-y-1">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={createPageUrl(service.page)}
                    className="block min-h-[44px] flex items-center justify-center md:justify-start text-gray-400 text-sm hover:text-[#D4AF7A] transition-colors leading-[2.2]"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-6">Get In Touch</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:hello@needmoconsult.com"
                  className="min-h-[44px] flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm hover:text-[#D4AF7A] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D4AF7A] flex-shrink-0" />
                  hello@needmoconsult.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="min-h-[44px] flex items-center justify-center md:justify-start gap-3 text-gray-400 text-sm hover:text-[#D4AF7A] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4AF7A] flex-shrink-0" />
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="min-h-[44px] flex items-center justify-center md:justify-start gap-3">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF7A] flex-shrink-0" />
                <span className="text-gray-400 text-sm">Los Angeles, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="text-gray-500 text-xs sm:text-sm text-center">
            © 2026 NEEDMO CONSULT. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to={createPageUrl("PrivacyPolicy")}
              className="text-gray-500 text-xs sm:text-sm hover:text-[#D4AF7A] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-600">·</span>
            <Link
              to={createPageUrl("TermsOfUse")}
              className="text-gray-500 text-xs sm:text-sm hover:text-[#D4AF7A] transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
