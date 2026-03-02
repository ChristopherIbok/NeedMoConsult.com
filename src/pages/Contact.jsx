import React, { useState, useEffect } from "react";
import SEO from "@/components/ui/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Cal.com booking widget removed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const services = [
  "Content Creation",
  "Account Management",
  "Paid Advertising",
  "Strategy & Consulting",
  "Full-Service Package",
  "Custom Solution",
];

const budgets = [
  "Under $500/mo",
  "$500 - $1,000/mo",
  "$1,000 - $2,500/mo",
  "$2,500 - $5,000/mo",
  "$5,000+/mo",
  "Not sure yet",
];

export default function Contact() {
  const [localTime, setLocalTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocalTime(time);
      setTimezone(tz);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cal.com widget removed; no runtime setup required

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Message sent! We'll be in touch within 24 hours.");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="pt-20">
      <SEO
        title="Contact Us | NEEDMO CONSULT"
        description="Get in touch to discuss your social media goals. Book a free 30-minute strategy call with our team."
        canonical="https://needmoconsult.com/contact"
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-[#F7F7F7] dark:from-[#0F1419] dark:to-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-6">
              Let's Talk About Your Brand
            </h1>
            <p className="text-lg text-[#333333] dark:text-gray-400">
              Ready to level up your social presence? Fill out the form below
              and we'll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white dark:bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-[#1A2332] dark:bg-[#0A0F14] rounded-3xl p-8 text-white h-full">
                <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

                <div className="space-y-6">
                  <a
                    href="mailto:hello@needmoconsult.com"
                    className="flex items-start gap-4 hover:text-[#FF6B35] transition-colors"
                  >
                    <Mail className="w-5 h-5 mt-1 text-[#FF6B35]" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-400">hello@needmoconsult.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 mt-1 text-[#FF6B35]" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 mt-1 text-[#FF6B35]" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400">Los Angeles, CA</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 mt-1 text-[#FF6B35]" />
                    <div>
                      <p className="font-medium">Your Local Time</p>
                      <p className="text-gray-400">{localTime}</p>
                      <p className="text-gray-500 text-sm">{timezone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-4">Follow us</p>
                  <div className="flex gap-4">
                    {[Instagram, Facebook, Linkedin, Twitter].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FF6B35] transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400 italic">
                    Our team typically responds within 24 hours during business days.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {isSubmitted ? (
                <div className="bg-[#F7F7F7] dark:bg-[#1E2830] rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-4">
                    Message Sent!
                  </h3>
                  <p className="text-[#333333] dark:text-gray-400 mb-8">
                    Thanks for reaching out! We've received your message and
                    will get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        service: "",
                        budget: "",
                        message: "",
                      });
                    }}
                    variant="outline"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Brand Name</Label>
                    <Input
                      id="company"
                      placeholder="Your company or brand"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Service Interested In *</Label>
                      <Select
                        value={formData.service}
                        onValueChange={(value) => handleChange("service", value)}
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Budget</Label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) => handleChange("budget", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgets.map((budget) => (
                            <SelectItem key={budget} value={budget}>
                              {budget}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell Us About Your Goals *</Label>
                    <Textarea
                      id="message"
                      placeholder="What are you hoping to achieve with social media? Tell us about your brand, current challenges, and goals..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      className="min-h-[150px] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold px-10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cal.com booking section removed */}
    </main>
  );
}