"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Compass, Mail, MessageSquare, Plus, Zap, Code, Shield, CheckCircle, 
  AlertTriangle, Loader2, Send, ArrowLeft
} from "lucide-react";
import emailjs from "emailjs-com";

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
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("improvement");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess(false);

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

      setSuccess(true);
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
    <div className="min-h-screen bg-[#03050c] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-150px] left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[300px] right-[10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-50 border-b border-slate-900/60 bg-[#03050c]/85 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 hover:opacity-90 transition-all">
            <SrevoxLogo size={40} />
            <div className="flex flex-col">
              <span className="font-black text-white text-2xl tracking-tight leading-none">Srevox</span>
              <span className="text-[9px] text-indigo-400 mt-1.5 uppercase font-bold tracking-widest">Self-Hosted Engine</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase font-extrabold tracking-widest text-slate-400">
            <Link href="/#demo" className="hover:text-indigo-400 transition-colors">Console Demo</Link>
            <Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link>
            <Link href="/#channels" className="hover:text-indigo-400 transition-colors">Integrations</Link>
            <Link href="/#configurator" className="hover:text-indigo-400 transition-colors">Environment Builder</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="text-xs font-bold text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 hover:scale-[1.03]"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Feedback Form Section */}
      <main className="relative z-10 max-w-2xl mx-auto pt-20 pb-28 px-6">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-extrabold mb-2">
              <MessageSquare className="w-3.5 h-3.5 fill-indigo-400/20" /> Help Us Improve
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Share your feedback
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Found a bug, have an idea for a feature, or need help with Srevox? Fill in the details below, and we will get back to you shortly.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            {success ? (
              <div className="py-10 text-center space-y-6 animate-modal-slide-up">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-xl">Feedback Sent Successfully!</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    Thank you for helping us improve Srevox. The core development team has been notified and we will review your feedback shortly.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-6 rounded-xl text-xs transition-all border border-slate-800"
                >
                  Send another suggestion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      disabled={sending}
                      required
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Feedback Type
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      disabled={sending}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80 transition-all font-semibold appearance-none"
                    >
                      <option value="improvement">General Suggestion</option>
                      <option value="bug">Report a Bug / Issue</option>
                      <option value="feature">Request a Feature</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short description of your query"
                    disabled={sending}
                    required
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Message Details
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detail your thoughts, bug reports, logs, steps to reproduce, or feature requests here..."
                    disabled={sending}
                    required
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-all font-semibold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !email.trim() || !subject.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50"
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
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md pt-20 pb-12 px-6 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-900/60">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <SrevoxLogo size={32} />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-lg tracking-tight leading-none">Srevox</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Self-Hosted</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Kubernetes pod crash alerting with AI diagnostics. Local, telemetry-free, and fully self-hosted. Catch crashes before your users do.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Product</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link href="/#demo" className="text-slate-400 hover:text-indigo-400 transition-colors">Interactive Demo</Link></li>
                <li><Link href="/#channels" className="text-slate-400 hover:text-indigo-400 transition-colors">Alert Channels</Link></li>
                <li><Link href="/#configurator" className="text-slate-400 hover:text-indigo-400 transition-colors">Config Builder</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><Link href="/docs" className="text-slate-400 hover:text-indigo-400 transition-colors">Documentation</Link></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">GitHub Repository</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">Deploy Configs</a></li>
              </ul>
            </div>

            {/* Column 4: Community */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Community</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">Discord Server</a></li>
                <li><a href="https://x.com/srevox" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">Twitter / X</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup/issues" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">Issue Tracker</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
            <div>
              <span>© {new Date().getFullYear()} Srevox. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
