// src/components/ui/NewsletterPopup.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/api/supabaseClient";

const STORAGE_KEY = "nm_newsletter_dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setVisible(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "dismissed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save to Supabase database
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, name, status: "active" });

      if (error) throw error;

      // Send welcome email via Supabase Edge Function
      await supabase.functions.invoke("send-welcome-email", {
        body: { email, name },
      });

      setDone(true);
      localStorage.setItem(STORAGE_KEY, "subscribed");
      setTimeout(() => setVisible(false), 2500);
    } catch (err) {
      console.error("Subscription error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-[#1A2332] rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#FF6B35] to-[#FF9A6C]" />

              <div className="p-8 relative">
                <button
                  onClick={dismiss}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-white" />
                </button>

                {!done ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center mb-5">
                      <Mail className="w-7 h-7 text-[#FF6B35]" />
                    </div>

                    <h2 className="text-2xl font-bold text-[#1A2332] dark:text-white mb-2">
                      Stay in the Loop
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      Get exclusive social media tips, case studies, and growth
                      strategies delivered straight to your inbox.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <Input
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                      />
                      <Input
                        type="email"
                        placeholder="Your email address *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold"
                        disabled={submitting}
                      >
                        {submitting ? "Subscribing..." : "Subscribe — It's Free"}
                      </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-4">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A2332] dark:text-white mb-2">
                      You're in!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Check your inbox — a welcome email is on its way.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}