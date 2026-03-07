import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Users, Mail, Plus, Trash2, Eye, LogOut,
  ChevronRight, CheckCircle, XCircle, Loader2, Lock
} from "lucide-react";

const ADMIN_PASSWORD = "needmo2026"; // change this to your preferred password

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (pw === ADMIN_PASSWORD) {
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2332] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-sm bg-[#0F1824] rounded-2xl p-8 border border-white/10 ${shake ? "animate-shake" : ""}`}
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF7A]/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#D4AF7A]" />
          </div>
        </div>
        <h1 className="text-white text-xl font-bold text-center mb-1">Admin Access</h1>
        <p className="text-white/40 text-sm text-center mb-6">NEEDMO CONSULT Dashboard</p>

        <input
          type="password"
          placeholder="Enter password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/50 transition-colors mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3 text-center">Incorrect password</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#D4AF7A] hover:bg-[#C49A5E] text-[#1A2332] font-bold py-3 rounded-xl transition-colors text-sm"
        >
          Enter Dashboard
        </button>
      </motion.div>
      <style>{`.animate-shake { animation: shake 0.4s ease; } @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("compose"); // "compose" | "subscribers"
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { ok, count } | { error }
  const [preview, setPreview] = useState(false);

  // Form state
  const [form, setForm] = useState({
    subject: "",
    issue: "",
    heroTitle: "",
    heroIntro: "",
    articleTitle: "",
    articleBody: "",
    articleUrl: "",
    offerTitle: "",
    offerBody: "",
    offerUrl: "https://needmoconsult.com/Contact",
    offerLabel: "Book Free Strategy Call",
  });
  const [tips, setTips] = useState([
    { title: "", desc: "" },
    { title: "", desc: "" },
    { title: "", desc: "" },
  ]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load subscribers
  useEffect(() => {
    if (authed) fetchSubscribers();
  }, [authed]);

  const fetchSubscribers = async () => {
    setLoadingSubs(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscribers(data || []);
    setLoadingSubs(false);
  };

  const deleteSubscriber = async (id) => {
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    setSubscribers(s => s.filter(x => x.id !== id));
  };

  const addTip = () => setTips(t => [...t, { title: "", desc: "" }]);
  const removeTip = (i) => setTips(t => t.filter((_, j) => j !== i));
  const setTip = (i, k, v) => setTips(t => t.map((tip, j) => j === i ? { ...tip, [k]: v } : tip));

  const sendNewsletter = async () => {
    if (!form.subject || !form.heroTitle) {
      setSendResult({ error: "Subject and Hero Title are required." });
      return;
    }
    setSending(true);
    setSendResult(null);

    const emails = subscribers.filter(s => s.status === "active").map(s => s.email);
    if (emails.length === 0) {
      setSendResult({ error: "No active subscribers to send to." });
      setSending(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          to: emails,
          ...form,
          tips: tips.filter(t => t.title),
        },
      });

      if (error) throw new Error(error.message);
      setSendResult({ ok: true, count: emails.length });
    } catch (err) {
      setSendResult({ error: err.message });
    }
    setSending(false);
  };

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  const activeCount = subscribers.filter(s => s.status === "active").length;

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#0F1419]">
      {/* Sidebar + Content layout */}
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <div className="w-64 bg-[#1A2332] flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-40">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10">
            <img
              src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.svg"
              alt="NEEDMO CONSULT"
              style={{ height: 32, width: "auto" }}
            />
            <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">Admin</p>
          </div>

          {/* Stats */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF7A]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#D4AF7A]" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">{activeCount}</p>
                <p className="text-white/40 text-xs">Active Subscribers</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {[
              { id: "compose", icon: Mail, label: "Compose Newsletter" },
              { id: "subscribers", icon: Users, label: "Subscribers" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? "bg-[#D4AF7A] text-[#1A2332]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-white/10">
            <button
              onClick={() => setAuthed(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">

          {/* ── COMPOSE TAB ── */}
          {tab === "compose" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Compose Newsletter</h1>
                  <p className="text-gray-500 text-sm mt-1">Will send to {activeCount} active subscribers</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreview(!preview)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#1A2332]/20 dark:border-white/20 rounded-xl text-sm font-medium text-[#1A2332] dark:text-white hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {preview ? "Hide Preview" : "Preview"}
                  </button>
                  <button
                    onClick={sendNewsletter}
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2 bg-[#1A2332] hover:bg-[#2A3342] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? "Sending..." : "Send Newsletter"}
                  </button>
                </div>
              </div>

              {/* Send Result */}
              <AnimatePresence>
                {sendResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
                      sendResult.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    {sendResult.ok
                      ? <><CheckCircle className="w-5 h-5 text-green-500" /><p className="text-green-700 text-sm font-medium">Newsletter sent to {sendResult.count} subscribers!</p></>
                      : <><XCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 text-sm font-medium">{sendResult.error}</p></>
                    }
                    <button onClick={() => setSendResult(null)} className="ml-auto text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`grid gap-6 ${preview ? "grid-cols-2" : "grid-cols-1 max-w-2xl"}`}>
                {/* Form */}
                <div className="space-y-6">

                  {/* Meta */}
                  <Card title="Email Details">
                    <Field label="Subject Line *">
                      <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g. 5 Mistakes Killing Your Brand Growth 📬" />
                    </Field>
                    <Field label="Issue Number">
                      <input value={form.issue} onChange={e => set("issue", e.target.value)} placeholder="001" />
                    </Field>
                  </Card>

                  {/* Hero */}
                  <Card title="Hero Section">
                    <Field label="Headline *">
                      <input value={form.heroTitle} onChange={e => set("heroTitle", e.target.value)} placeholder="e.g. 5 Social Media Mistakes Killing Your Brand Growth" />
                    </Field>
                    <Field label="Intro Paragraph">
                      <textarea rows={3} value={form.heroIntro} onChange={e => set("heroIntro", e.target.value)} placeholder="Brief intro for this week's newsletter..." />
                    </Field>
                  </Card>

                  {/* Featured Article */}
                  <Card title="Featured Article">
                    <Field label="Article Title">
                      <input value={form.articleTitle} onChange={e => set("articleTitle", e.target.value)} placeholder="e.g. Why Posting Every Day Isn't the Answer" />
                    </Field>
                    <Field label="Article Body">
                      <textarea rows={4} value={form.articleBody} onChange={e => set("articleBody", e.target.value)} placeholder="Article content..." />
                    </Field>
                    <Field label="Article URL">
                      <input value={form.articleUrl} onChange={e => set("articleUrl", e.target.value)} placeholder="https://needmoconsult.com/blog/..." />
                    </Field>
                  </Card>

                  {/* Tips */}
                  <Card title="Quick Tips" action={<button onClick={addTip} className="flex items-center gap-1 text-[#D4AF7A] text-xs font-semibold hover:text-[#C49A5E]"><Plus className="w-3 h-3" />Add Tip</button>}>
                    {tips.map((tip, i) => (
                      <div key={i} className="flex gap-3 items-start mb-3">
                        <div className="w-7 h-7 rounded-lg bg-[#1A2332] text-[#D4AF7A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            value={tip.title}
                            onChange={e => setTip(i, "title", e.target.value)}
                            placeholder="Tip title"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                          <input
                            value={tip.desc}
                            onChange={e => setTip(i, "desc", e.target.value)}
                            placeholder="Tip description"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/50"
                          />
                        </div>
                        {tips.length > 1 && (
                          <button onClick={() => removeTip(i)} className="text-gray-300 hover:text-red-400 mt-1 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </Card>

                  {/* CTA Offer */}
                  <Card title="CTA / Offer Block">
                    <Field label="Offer Headline">
                      <input value={form.offerTitle} onChange={e => set("offerTitle", e.target.value)} placeholder="e.g. Free Social Media Audit — This Week Only" />
                    </Field>
                    <Field label="Offer Description">
                      <textarea rows={2} value={form.offerBody} onChange={e => set("offerBody", e.target.value)} placeholder="Describe the offer..." />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Button Label">
                        <input value={form.offerLabel} onChange={e => set("offerLabel", e.target.value)} placeholder="Book Free Strategy Call" />
                      </Field>
                      <Field label="Button URL">
                        <input value={form.offerUrl} onChange={e => set("offerUrl", e.target.value)} placeholder="https://needmoconsult.com/Contact" />
                      </Field>
                    </div>
                  </Card>

                </div>

                {/* Live Preview */}
                {preview && (
                  <div className="sticky top-8">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Live Preview</p>
                    <div className="bg-[#F2F2F0] rounded-2xl p-4 overflow-auto max-h-[80vh]">
                      <div style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133%" }}>
                        <NewsletterPreview form={form} tips={tips} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SUBSCRIBERS TAB ── */}
          {tab === "subscribers" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A2332] dark:text-white">Subscribers</h1>
                  <p className="text-gray-500 text-sm mt-1">{subscribers.length} total · {activeCount} active</p>
                </div>
                <button onClick={fetchSubscribers} className="px-4 py-2 bg-[#1A2332] text-white rounded-xl text-sm font-medium hover:bg-[#2A3342] transition-colors">
                  Refresh
                </button>
              </div>

              <div className="bg-white dark:bg-[#1A2332] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                {loadingSubs ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF7A]" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No subscribers yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/10">
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub, i) => (
                        <tr key={sub.id} className={`border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i === subscribers.length - 1 ? "border-b-0" : ""}`}>
                          <td className="px-6 py-4 text-sm text-[#1A2332] dark:text-white font-medium">{sub.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{sub.name || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sub.status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {sub.status || "active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(sub.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteSubscriber(sub.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function Card({ title, children, action }) {
  return (
    <div className="bg-white dark:bg-[#1A2332] rounded-2xl p-6 border border-gray-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#1A2332] dark:text-white uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  const child = React.Children.only(children);
  const enhanced = React.cloneElement(child, {
    className: "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1A2332] dark:text-white outline-none focus:border-[#D4AF7A]/60 transition-colors resize-none",
  });
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {enhanced}
    </div>
  );
}

// ─── Inline Newsletter Preview ────────────────────────────────────────────────
function NewsletterPreview({ form, tips }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const activeTips = tips.filter(t => t.title);

  return (
    <div style={{ fontFamily: "Arial,sans-serif", backgroundColor: "#F2F2F0", padding: "20px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(90deg,#1A2332,#D4AF7A)", height: 5 }} />
        <div style={{ backgroundColor: "#1A2332", padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.svg" alt="NEEDMO" height={30} style={{ height: 30 }} />
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#D4AF7A", textTransform: "uppercase", letterSpacing: 2 }}>Weekly Insights</p>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{date} · Issue #{form.issue || "001"}</p>
            </div>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: "#D4AF7A", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>This Week</p>
          <h1 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{form.heroTitle || "Your Newsletter Headline"}</h1>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{form.heroIntro || "Intro text will appear here."}</p>
        </div>
        <div style={{ backgroundColor: "#1A2332", padding: "0 32px 24px" }}>
          <div style={{ height: 1, backgroundColor: "rgba(212,175,122,0.2)" }} />
        </div>
        {form.articleTitle && (
          <div style={{ padding: "28px 32px 0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, color: "#D4AF7A", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Featured Article</p>
            <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#1A2332" }}>{form.articleTitle}</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#555", lineHeight: 1.7 }}>{form.articleBody}</p>
            {form.articleUrl && <a href={form.articleUrl} style={{ display: "inline-block", border: "2px solid #D4AF7A", color: "#D4AF7A", fontSize: 12, fontWeight: 700, textDecoration: "none", padding: "8px 20px", borderRadius: 50 }}>Read Full Article →</a>}
          </div>
        )}
        {activeTips.length > 0 && (
          <div style={{ padding: "24px 32px 0" }}>
            <div style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 24 }} />
            <p style={{ margin: "0 0 6px", fontSize: 10, color: "#D4AF7A", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Quick Tips</p>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#1A2332" }}>Actionable Insights For This Week</h2>
            {activeTips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, backgroundColor: "#1A2332", borderRadius: 7, textAlign: "center", lineHeight: "26px", fontSize: 11, fontWeight: 800, color: "#D4AF7A", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#1A2332" }}>{tip.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.5 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {form.offerTitle && (
          <div style={{ padding: "24px 32px" }}>
            <div style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 24 }} />
            <div style={{ backgroundColor: "#1A2332", borderRadius: 12, padding: 24 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#D4AF7A", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Exclusive Offer</p>
              <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#fff" }}>{form.offerTitle}</h2>
              <p style={{ margin: "0 0 18px", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{form.offerBody}</p>
              <a href={form.offerUrl} style={{ display: "inline-block", backgroundColor: "#D4AF7A", color: "#1A2332", fontSize: 13, fontWeight: 800, textDecoration: "none", padding: "12px 28px", borderRadius: 50 }}>{form.offerLabel} →</a>
            </div>
          </div>
        )}
        <div style={{ backgroundColor: "#1A2332", padding: "20px 32px", textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "#D4AF7A", fontWeight: 600 }}>NEEDMO CONSULT</p>
          <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} · needmoconsult.com · <a href="#" style={{ color: "rgba(255,255,255,0.3)" }}>Unsubscribe</a></p>
        </div>
      </div>
    </div>
  );
}