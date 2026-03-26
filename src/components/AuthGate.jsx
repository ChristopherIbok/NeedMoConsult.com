import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const TEAM_MEMBERS = [
  { email: "hello@needmoconsult.com", name: "Chris (Owner)", role: "owner" },
  { email: "team@needmoconsult.com", name: "Team Member 1", role: "member" },
  { email: "support@needmoconsult.com", name: "Team Member 2", role: "member" },
];

export default function AuthGate({ onAuth }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pw) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const { adminLogin } = await import("@/lib/api");
      await adminLogin(email, pw);
      const member = TEAM_MEMBERS.find(m => m.email.toLowerCase() === email.toLowerCase());
      onAuth(member || { name: email.split("@")[0], email, role: "member" });
    } catch (err) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2332] via-[#0D1117] to-[#1A2332] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF7A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#D4AF7A]/3 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full max-w-sm bg-[#0F1824]/90 rounded-2xl p-8 border border-white/10 ${shake ? "animate-shake" : ""}`}
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF7A] to-[#C49A5E] flex items-center justify-center shadow-lg shadow-[#D4AF7A]/20">
            <Briefcase className="w-6 h-6 text-[#1A2332]" />
          </div>
        </div>
        <h1 className="text-white text-xl font-bold text-center mb-1">NEEDMO Office</h1>
        <p className="text-white/40 text-sm text-center mb-6">Sign in to access your workspace</p>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3 bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 rounded-xl"
          >
            <p className="text-[#D4AF7A] text-xs mb-2">Team member accounts:</p>
            {TEAM_MEMBERS.map(m => (
              <p key={m.email} className="text-white/50 text-xs mb-1">• {m.email}</p>
            ))}
          </motion.div>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(false); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/50 transition-colors mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D4AF7A]/50 transition-colors mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3 text-center">Incorrect email or password</p>}
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#D4AF7A] to-[#C49A5E] hover:from-[#C49A5E] hover:to-[#D4AF7A] text-[#1A2332] font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-[#D4AF7A]/20 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full mt-3 text-white/30 hover:text-white/50 text-xs transition-colors"
        >
          {showHint ? "Hide" : "Show"} team member emails
        </button>
      </motion.div>
      <style>{`.animate-shake { animation: shake 0.4s ease; } @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
    </div>
  );
}