import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/ui/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPublicPayment } from "@/lib/api";

const CURRENCIES = ["USD", "NGN", "GBP", "EUR"];

export default function Pay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    currency: "USD",
    description: "NEEDMO CONSULT service payment",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      toast.success("Payment verified. Thank you.");
    } else if (paymentStatus === "failed") {
      toast.error("Payment could not be verified. Please contact support if you were charged.");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled.");
    }

    navigate("/pay", { replace: true });
  }, [location.search, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const url = await createPublicPayment({
        ...form,
        amount: Number(form.amount),
      });
      window.location.href = url;
    } catch (error) {
      toast.error(error.message || "Unable to start payment.");
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-20 bg-[#F9F7F4] dark:bg-[#0F1419] min-h-screen">
      <SEO
        title="Pay NEEDMO CONSULTING SERVICES"
        description="Make a secure payment to NEEDMO CONSULTING SERVICES through Flutterwave."
        canonical="https://needmoconsult.com/pay"
        type="website"
      />

      <section className="site-container py-14 md:py-20">
        <div className="grid lg:grid-cols-[0.85fr_1fr] gap-10 items-start">
          <div className="pt-4">
            <p className="text-[#D4AF7A] text-sm font-semibold uppercase tracking-widest mb-4">
              Secure Payment
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] dark:text-white mb-5">
              Pay NEEDMO CONSULTING SERVICES
            </h1>
            <p className="text-lg text-[#555555] dark:text-gray-400 leading-relaxed max-w-xl">
              Use this page to pay an invoice, deposit, consultation fee, or service balance.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-xl">
              <div className="flex gap-3 rounded-lg border border-[#E8E4DC] dark:border-[#2A3540] bg-white dark:bg-[#1E2830] p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 flex-shrink-0">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[#1A2332] dark:text-white">Flutterwave checkout</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cards, transfers, and local methods.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-[#E8E4DC] dark:border-[#2A3540] bg-white dark:bg-[#1E2830] p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-[#1A2332] dark:text-white">Verified server-side</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment status is checked before confirmation.</p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1E2830] border border-[#E8E4DC] dark:border-[#2A3540] rounded-lg p-5 sm:p-7 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-[#1A2332] dark:text-white">Name</span>
                <Input
                  required
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="mt-2"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#1A2332] dark:text-white">Email</span>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="mt-2"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#1A2332] dark:text-white">Phone</span>
                <Input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="mt-2"
                  placeholder="+234..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#1A2332] dark:text-white">Currency</span>
                <select
                  value={form.currency}
                  onChange={(event) => updateField("currency", event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#1A2332] dark:text-white focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block mt-4">
              <span className="text-sm font-medium text-[#1A2332] dark:text-white">Amount</span>
              <Input
                required
                min="1"
                step="0.01"
                type="number"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                className="mt-2"
                placeholder="500"
              />
            </label>

            <label className="block mt-4">
              <span className="text-sm font-medium text-[#1A2332] dark:text-white">Payment For</span>
              <Textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="mt-2 min-h-[96px]"
                placeholder="Invoice, consultation, monthly service..."
              />
            </label>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-[#1A2332] hover:bg-[#2A3342] text-white dark:bg-white dark:text-[#1A2332] dark:hover:bg-gray-100"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {submitting ? "Opening Checkout..." : "Continue to Payment"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
