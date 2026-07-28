"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Compass, Mail, MessageSquare, Plus, Zap, Code, Shield, CheckCircle, CheckCircle2,
  AlertTriangle, Loader2, Send, ArrowLeft, Sun, Moon
} from "lucide-react";
import emailjs from "emailjs-com";
import { useSrevoxTheme } from "@/components/ThemeProvider";

// Srevox Brand Logo Component
function SrevoxLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 680 680" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logo-g1" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#00cfff"/>
          <stop offset="40%" stopColor="#1a7fff"/>
          <stop offset="100%" stopColor="#0033cc"/>
        </linearGradient>
        <linearGradient id="logo-g2" x1="0%" y1="0%" x2="0%" y2="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="logo-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60e0ff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0044ff" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      
      <path d="M340,60 L540,175 L540,445 Q540,580 340,625 Q140,580 140,445 L140,175 Z" fill="url(#logo-g1)" stroke="url(#logo-g3)" strokeWidth="3"/>
      <path d="M340,60 L540,175 L540,310 Q445,275 340,255 Q255,245 140,275 L140,175 Z" fill="url(#logo-g2)" opacity="0.7"/>
      <path d="M340,80 L522,188 L522,443 Q522,562 340,602 Q158,562 158,443 L158,188 Z" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <polyline points="175,345 235,345 255,298 278,398 304,282 328,345 395,345 418,302 442,385 464,345 510,345" fill="none" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function FeedbackPage() {
  const { theme, setTheme, mounted, isLight } = useSrevoxTheme("srevox_main_theme", "dark");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSending(true);
    setError("");
    setSubmitted(false);

    try {
      const serviceId = process.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = process.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS client configuration is missing or incomplete.");
      }

      const templateParams = {
        email,
        user_email: email,
        feedbackType,
        feedback_type: feedbackType,
        subject,
        message,
        from_name: email,
        from_email: email,
        reply_to: email,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitted(true);
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-sky-500/30 overflow-x-hidden relative transition-colors duration-300 ${
      isLight ? "bg-[#f8fafc] text-slate-800" : "bg-[#030712] text-slate-100"
    }`}>
      {/* Decorative Blur Orbs */}
      <div className={`absolute top-[-150px] left-[10%] w-[600px] h-[600px] ${
        isLight ? "bg-sky-400/15" : "bg-sky-500/10"
      } rounded-full blur-[160px] pointer-events-none z-0`} />
      <div className={`absolute top-[300px] right-[10%] w-[600px] h-[600px] ${
        isLight ? "bg-cyan-400/10" : "bg-cyan-500/8"
      } rounded-full blur-[160px] pointer-events-none z-0`} />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Header */}
      <header className={`relative z-50 border-b backdrop-blur-2xl sticky top-0 transition-colors duration-300 ${
        isLight 
          ? "border-slate-200/80 bg-white/85 shadow-lg shadow-slate-200/50" 
          : "border-slate-800/60 bg-[#030712]/85 shadow-2xl shadow-sky-950/20"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 hover:opacity-90 transition-all group">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md group-hover:bg-sky-400/30 transition-all" />
              <SrevoxLogo size={40} className="relative" />
            </div>
            <span className={`font-black text-2xl tracking-tight leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
              Srevox
            </span>
          </Link>

          <nav className={`hidden lg:flex items-center gap-8 text-xs uppercase font-extrabold tracking-widest ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}>
            <Link href="/#demo" className="hover:text-sky-500 transition-colors">Console Demo</Link>
            <Link href="/docs" className="hover:text-sky-500 transition-colors">Documentation</Link>
            <Link href="/#channels" className="hover:text-sky-500 transition-colors">Integrations</Link>
            <Link href="/#configurator" className="hover:text-sky-500 transition-colors">Environment Builder</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
                className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  isLight 
                    ? "bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200" 
                    : "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                }`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}

            <Link 
              href="/"
              className={`text-xs font-bold transition-all duration-300 flex items-center gap-2 border rounded-xl px-4 py-2.5 hover:scale-[1.03] ${
                isLight 
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" 
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Feedback Form Section */}
      <main className="relative z-10 max-w-2xl mx-auto pt-16 pb-28 px-6">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-extrabold mb-2 ${
              isLight 
                ? "bg-sky-500/10 border-sky-500/30 text-sky-600" 
                : "bg-sky-500/10 border-sky-500/20 text-sky-400"
            }`}>
              <MessageSquare className="w-3.5 h-3.5 fill-sky-400/20" /> Help Us Improve
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Share your feedback
            </h1>
            <p className={`text-sm max-w-md mx-auto leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}>
              Found a bug, have an idea for a feature, or need help with Srevox? Fill in the details below, and we will get back to you shortly.
            </p>
          </div>

          {/* Form Container */}
          <div className={`border rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden transition-colors duration-300 ${
            isLight 
              ? "bg-white/95 border-slate-200/90 shadow-xl shadow-slate-200/60" 
              : "bg-slate-950/60 border-sky-500/20 shadow-2xl"
          }`}>
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto ${
                  isLight 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Feedback Received!
                </h3>
                <p className={`text-xs max-w-xs mx-auto ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Thank you for helping us make Srevox better. We appreciate your input.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setSubject("");
                  }}
                  className={`mt-4 px-6 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isLight 
                      ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {error && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    isLight 
                      ? "bg-red-50 border-red-200 text-red-700" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}>
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={sending}
                    required
                    className={`w-full border rounded-xl px-4 py-3.5 text-xs transition-all font-semibold focus:outline-none focus:border-sky-500 ${
                      isLight 
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white" 
                        : "bg-[#03050c] border-slate-800 text-white placeholder-slate-600"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isLight ? "text-slate-700" : "text-slate-300"
                    }`}>
                      Topic / Category
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      disabled={sending}
                      className={`w-full border rounded-xl px-4 py-3.5 text-xs transition-all font-semibold appearance-none focus:outline-none focus:border-sky-500 ${
                        isLight 
                          ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white" 
                          : "bg-[#03050c] border-slate-800 text-slate-300"
                      }`}
                    >
                      <option value="General Feedback">General Feedback</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Deployment Help">Deployment Help</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      isLight ? "text-slate-700" : "text-slate-300"
                    }`}>
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Summary of issue or idea..."
                      disabled={sending}
                      required
                      className={`w-full border rounded-xl px-4 py-3.5 text-xs transition-all font-semibold focus:outline-none focus:border-sky-500 ${
                        isLight 
                          ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white" 
                          : "bg-[#03050c] border-slate-800 text-white placeholder-slate-600"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}>
                    Detailed Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detail your thoughts, bug reports, logs, steps to reproduce, or feature requests here..."
                    disabled={sending}
                    required
                    rows={6}
                    className={`w-full border rounded-xl px-4 py-3.5 text-xs transition-all font-semibold resize-none focus:outline-none focus:border-sky-500 ${
                      isLight 
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white" 
                        : "bg-[#03050c] border-slate-800 text-white placeholder-slate-600"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !email.trim() || !subject.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Sending feedback...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t backdrop-blur-md pt-20 pb-12 px-6 relative z-30 transition-colors duration-300 ${
        isLight 
          ? "border-slate-200 bg-slate-100/90 text-slate-600" 
          : "border-slate-900 bg-slate-950/80 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b ${
            isLight ? "border-slate-200" : "border-slate-900/60"
          }`}>
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <SrevoxLogo size={32} />
                <div className="flex flex-col">
                  <span className={`font-extrabold text-lg tracking-tight leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                    Srevox
                  </span>
                  <span className={`text-[10px] mt-1 uppercase font-bold tracking-widest ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                    Self-Hosted
                  </span>
                </div>
              </div>
              <p className={`text-sm leading-relaxed max-w-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Kubernetes pod crash alerting with AI diagnostics. Local, telemetry-free, and fully self-hosted. Catch crashes before your users do.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-900" : "text-white"}`}>
                Product
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link href="/#demo" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Interactive Demo</Link></li>
                <li><Link href="/#channels" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Alert Channels</Link></li>
                <li><Link href="/#configurator" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Config Builder</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-900" : "text-white"}`}>
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link href="/docs" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Documentation</Link></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>GitHub Repository</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Deploy Configs</a></li>
              </ul>
            </div>

            {/* Column 4: Community */}
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-900" : "text-white"}`}>
                Community
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Discord Server</a></li>
                <li><a href="https://x.com/srevox" target="_blank" rel="noopener noreferrer" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Twitter / X</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup/issues" target="_blank" rel="noopener noreferrer" className={`${isLight ? "text-slate-600 hover:text-sky-600" : "text-slate-400 hover:text-sky-400"} transition-colors`}>Issue Tracker</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <div>
              <span>© {new Date().getFullYear()} Srevox. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className={`transition-colors ${isLight ? "hover:text-slate-800" : "hover:text-slate-300"}`}>Privacy Policy</a>
              <a href="#" className={`transition-colors ${isLight ? "hover:text-slate-800" : "hover:text-slate-300"}`}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
