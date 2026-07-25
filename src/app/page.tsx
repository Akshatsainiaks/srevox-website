"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DockerPullsBadge, DockerLogo } from "@/components/DockerPullsBadge";
import { useSrevoxTheme } from "@/components/ThemeProvider";
import { 
  ShieldCheck, Terminal, Cpu, Zap, Activity, AlertTriangle, CheckCircle2, 
  ArrowRight, Sparkles, Server, Copy, Check, Lock, ChevronDown, Bell, 
  MessageSquare, Sliders, Database, Eye, Radio, Workflow, HardDrive, 
  GitBranch, Users, BarChart3, HelpCircle, Sun, Moon
} from "lucide-react";

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

export default function LandingPage() {
  const { theme: mainTheme, setTheme: setMainTheme, mounted, isLight } = useSrevoxTheme("srevox_main_theme", "dark");
  const [installTab, setInstallTab] = useState<"script" | "docker">("script");
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [highestPulls, setHighestPulls] = useState<number>(2102);
  const [highestRepo, setHighestRepo] = useState<string>("akshatsaini08/srevox-api");

  const curlCommand = "curl -fsSL https://raw.githubusercontent.com/Akshatsainiaks/srevox-setup/main/setup.sh | bash";

  useEffect(() => {
    const fetchPulls = async () => {
      try {
        const res = await fetch("/api/srevox");
        const token = res.headers.get("x-srevox-v");
        if (token) {
          const val = parseInt(atob(token), 10);
          if (!isNaN(val)) {
            setHighestPulls(val);
          }
        }
      } catch {
        setHighestPulls(2102);
      }
    };
    fetchPulls();
  }, []);

  const toggleMainTheme = () => {
    setMainTheme(mainTheme === "dark" ? "light" : "dark");
  };

  const activeCommand = installTab === "script" ? curlCommand : `docker pull ${highestRepo}:latest`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch {}
  };

  return (
    <div suppressHydrationWarning className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300 ${
      isLight ? "bg-[#f8fafc] text-slate-900 selection:text-indigo-600" : "bg-[#03050c] text-slate-100 selection:text-indigo-200"
    }`}>
      
      {/* Background Lighting & Grid Effects (Fixed DOM node structure for SSR/CSR hydration match) */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isLight ? "hidden" : ""}`}>
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute top-[700px] -left-40 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[1600px] -right-40 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* Header / Navbar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        isLight ? "bg-white/80 border-slate-200 text-slate-800" : "bg-[#03050c]/85 border-slate-900/80 text-white"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <SrevoxLogo size={36} className="group-hover:scale-105 transition-transform" />
            <span className={`font-extrabold text-xl tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Srevox</span>
          </Link>

          <nav className={`hidden md:flex items-center gap-8 text-xs uppercase font-extrabold tracking-widest ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}>
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-indigo-500 transition-colors">Connection Modes</a>
            <a href="#setup" className="hover:text-indigo-500 transition-colors">Quick Setup</a>
            <Link href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">Documentation</Link>
            <Link href="/feedback" className="text-indigo-500 hover:text-indigo-600 font-bold transition-colors">Feedback</Link>
            <a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Independent Theme Switcher for Main Site */}
            <button
              type="button"
              onClick={toggleMainTheme}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
              }`}
              title={`Switch to ${isLight ? "Dark" : "Light"} Theme (Main Site)`}
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <a 
              href="https://github.com/Akshatsainiaks/srevox" 
              target="_blank" 
              rel="noreferrer"
              className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
              }`}
            >
              <GitBranch className="w-4 h-4 text-indigo-500" />
              <span>GitHub</span>
            </a>
            <Link 
              href="/docs" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Documentation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center space-y-8">
          
          {/* Security & Self-Hosted Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold shadow-xl">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>100% Self-Hosted • Zero Data Leaks</span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] ${isLight ? "text-slate-900" : "text-white"}`}>
              Kubernetes pod crash alerting <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                with AI diagnostics.
              </span>
            </h1>
            <p className={`text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Detect CrashLoopBackOffs, OOMKilled containers, and node resource bottlenecks in real time. Local, telemetry-free, and fully self-hosted. Catch crashes before your users do.
            </p>
          </div>

          {/* Setup Command Bar */}
          <div className={`mt-10 max-w-3xl mx-auto p-2 border shadow-2xl rounded-2xl flex flex-col sm:flex-row items-stretch gap-2 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-950/90 border-slate-900"
          }`}>
            <div className={`flex-1 flex items-center px-4 py-3.5 font-mono text-xs md:text-sm border select-all overflow-x-auto whitespace-nowrap custom-scrollbar rounded-xl ${
              isLight ? "bg-slate-50 border-slate-200 text-indigo-600" : "bg-[#03050c] border-slate-900 text-cyan-400"
            }`}>
              <span className="text-slate-400 mr-3 select-none">$</span>
              {curlCommand}
            </div>
            <button 
              type="button"
              onClick={handleCopyCommand}
              className="px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer shrink-0"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Setup Command
                </>
              )}
            </button>
          </div>

          {/* Credentials Callout Box */}
          <div className={`mt-8 max-w-md mx-auto p-4 rounded-2xl border text-left ${
            isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-950/60 border-slate-900"
          }`}>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Default Administrator Credentials (Self-Hosted)</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/90 border-slate-900"}`}>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1 font-sans">Email</span>
                <span className={`font-bold select-all ${isLight ? "text-slate-900" : "text-slate-200"}`}>admin@srevox.local</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/90 border-slate-900"}`}>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1 font-sans">Password</span>
                <span className={`font-bold select-all ${isLight ? "text-slate-900" : "text-slate-200"}`}>admin123</span>
              </div>
            </div>
          </div>

        </section>

        {/* Feature Capabilities Grid */}
        <section id="features" className={`max-w-7xl mx-auto px-6 py-20 border-t scroll-mt-24 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest block">Complete Observability Platform</span>
            <h2 className={`text-3xl sm:text-5xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>Engineered for High-Compliance Teams</h2>
            <p className={`text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>Everything you need to monitor workloads, isolate pod crashes, and automate root-cause remediation without sending metrics to third-party clouds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-indigo-500/40" : "bg-slate-950/50 border-slate-900 hover:border-indigo-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Real-Time Incident Stream</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Captures Kubernetes CrashLoopBackOffs, OOMKilled events, and LivenessProbe failures in under 1 second. Stream live pod logs directly in your browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-purple-500/40" : "bg-slate-950/50 border-slate-900 hover:border-purple-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>AI Root-Cause Diagnostics</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Analyzes stacktraces and container exit codes using OpenAI, Anthropic, or 100% local Ollama LLMs to provide immediate fix manifests.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-cyan-500/40" : "bg-slate-950/50 border-slate-900 hover:border-cyan-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Granular Alert Controls</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Mute platform system alerts globally, configure custom Node CPU/Memory threshold rules, and target explicit Slack, Teams, or Email integrations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-emerald-500/40" : "bg-slate-950/50 border-slate-900 hover:border-emerald-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Node & Telemetry Metrics</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Historical CPU, Memory, Pod count, and Node health telemetry. Built-in background evaluator automatically triggers warning alerts before nodes crash.
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-amber-500/40" : "bg-slate-950/50 border-slate-900 hover:border-amber-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Users className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Service Owner Routing</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Assign services to explicit engineering team owners. Srevox routes incident alerts directly to responsible service maintainers automatically.
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-8 rounded-3xl border transition-all space-y-4 text-left ${
              isLight ? "bg-white border-slate-200 shadow-md hover:border-rose-500/40" : "bg-slate-950/50 border-slate-900 hover:border-rose-500/40 glass-panel"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Audit Log & Governance</h3>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Full activity audit trails tracking user invites, alert channel edits, cluster configuration updates, and RBAC permission changes.
              </p>
            </div>

          </div>
        </section>

        {/* Compact & Sleek Docker Pull Count Showcase Section */}
        <section id="docker-image" className={`max-w-2xl mx-auto px-6 py-10 border-t scroll-mt-24 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
          <div className={`relative rounded-2xl p-6 sm:p-8 border overflow-hidden shadow-xl text-center ${
            isLight ? "bg-white border-slate-200" : "bg-slate-950/90 border-sky-500/20 glass-panel"
          }`}>
            
            {/* Subtle Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Stat Display - Tastefully Sized */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-center gap-2">
                <DockerLogo size={20} className="text-sky-500" />
                <span className={`text-xs uppercase font-extrabold tracking-widest ${isLight ? "text-slate-600" : "text-slate-400"}`}>Docker Image Pulls</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                {highestPulls.toLocaleString()}
                <span className="text-sky-500">+</span>
              </div>
            </div>

          </div>
        </section>

        {/* Connection Architecture Section */}
        <section id="architecture" className={`max-w-7xl mx-auto px-6 py-20 border-t scroll-mt-24 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
          <div className={`p-8 sm:p-12 rounded-3xl border space-y-10 ${
            isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-950/60 border-indigo-500/20 glass-panel"
          }`}>
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest block">Flexible Cluster Connectivity</span>
              <h2 className={`text-3xl sm:text-5xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>Two Connection Architecture Options</h2>
              <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>Choose between agentless Service Account token connections or lightweight cluster watcher agents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Connection Option 1 */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-slate-900"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-indigo-500" />
                    <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Direct Service Account / Kubeconfig</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold border border-indigo-500/20">
                    Agentless
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Connect remote EKS, GKE, AKS, or bare-metal clusters directly via API token or Kubeconfig. Srevox uses <code className="text-indigo-500 font-mono">CoreV1Api</code> to query pod logs and metrics without installing anything inside the cluster.
                </p>
                <ul className={`space-y-2 text-xs pt-2 border-t ${isLight ? "text-slate-700 border-slate-200" : "text-slate-300 border-slate-900"}`}>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero pod footprint inside your cluster</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Custom CA certificate & skipTLSVerify support</li>
                </ul>
              </div>

              {/* Connection Option 2 */}
              <div className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-slate-900"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-500" />
                    <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Srevox Cluster Watcher Agent</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-bold border border-cyan-500/20">
                    In-Cluster Daemon
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Deploy a lightweight DaemonSet or Helm watcher inside your cluster. The agent streams Kubernetes events outbound via secure HTTPS webhooks to your Srevox server instance.
                </p>
                <ul className={`space-y-2 text-xs pt-2 border-t ${isLight ? "text-slate-700 border-slate-200" : "text-slate-300 border-slate-900"}`}>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sub-second incident event streaming</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Air-gapped network outbound proxy support</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Quick Setup Guide */}
        <section id="setup" className={`max-w-7xl mx-auto px-6 py-20 border-t scroll-mt-24 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className={`text-3xl sm:text-5xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>Quick 3-Step Setup</h2>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>Deploy Srevox on any Linux machine or server in under 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className={`p-6 border rounded-2xl space-y-3 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/80 border-slate-900"
            }`}>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 flex items-center justify-center text-xs font-black font-mono">1</div>
              <div className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Run Setup Script</div>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Execute the single-line bash script on your server to pull the required docker containers.
              </p>
              <pre className={`p-3 border rounded-xl text-[10px] font-mono overflow-x-auto select-all custom-scrollbar ${
                isLight ? "bg-slate-50 border-slate-200 text-indigo-600" : "bg-[#03050c] border-slate-900 text-cyan-400"
              }`}>
                {curlCommand}
              </pre>
            </div>

            <div className={`p-6 border rounded-2xl space-y-3 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/80 border-slate-900"
            }`}>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 flex items-center justify-center text-xs font-black font-mono">2</div>
              <div className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Sign In to Dashboard</div>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Open <code className="text-indigo-500 font-mono">http://YOUR_SERVER_IP:3000</code> in your browser and log in with default credentials.
              </p>
              <div className={`p-3 border rounded-xl text-[10px] font-mono ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#03050c] border-slate-900 text-slate-300"
              }`}>
                admin@srevox.local / admin123
              </div>
            </div>

            <div className={`p-6 border rounded-2xl space-y-3 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/80 border-slate-900"
            }`}>
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 flex items-center justify-center text-xs font-black font-mono">3</div>
              <div className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Connect Cluster & AI</div>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Add your Kubernetes API token or Kubeconfig and select your preferred AI provider (Ollama or OpenAI).
              </p>
              <div className={`p-3 border rounded-xl text-[10px] font-mono text-emerald-500 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#03050c] border-slate-900"
              }`}>
                ✓ Ready for Monitoring
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section id="faq" className={`max-w-4xl mx-auto px-6 py-20 border-t scroll-mt-24 space-y-8 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
          <div className="text-center space-y-3">
            <h2 className={`text-2xl sm:text-4xl font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>Frequently Asked Questions</h2>
            <p className={`text-xs sm:text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>Everything you need to know about operating Srevox in production.</p>
          </div>

          <div className="space-y-4 text-left">
            {[
              {
                q: "Does Srevox need inbound firewall ports opened into my Kubernetes cluster?",
                a: "No. Srevox supports agentless Service Account API queries and outbound agent webhook streaming. It requires zero inbound open ports or public load balancer endpoints inside your Kubernetes cluster."
              },
              {
                q: "Can I run Srevox completely offline in air-gapped environments?",
                a: "Yes. Srevox can be deployed completely offline in air-gapped environments. You can point the AI diagnostic engine to local GPU-enabled Ollama containers (running models like Llama 3 or CodeLlama) for zero-network-egress log analysis."
              },
              {
                q: "How does System Alerts global muting work?",
                a: "In the More Settings → System Alerts tab, administrators can toggle the master switch to mute all platform connectivity events (e.g. cluster_disconnected), or selectively pick target channels (Slack, Teams, Email) to prevent alert spam."
              },
              {
                q: "What user authentication and RBAC structure is supported?",
                a: "Srevox seeds a default administrator account on setup. Administrators can invite team members, assign role permissions, and group services by engineering team owners."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border overflow-hidden cursor-pointer ${
                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/60 border-slate-900 glass-panel"
                }`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className={`p-5 flex items-center justify-between font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </div>
                {openFaq === idx && (
                  <div className={`px-5 pb-5 text-xs leading-relaxed border-t pt-3 animate-fade-in ${
                    isLight ? "text-slate-600 border-slate-200" : "text-slate-400 border-slate-900"
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`border-t relative z-10 text-left transition-colors duration-300 ${
        isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-950/80 border-slate-900 text-slate-400"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b ${isLight ? "border-slate-200" : "border-slate-900/60"}`}>
            
            {/* Column 1 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <SrevoxLogo size={32} />
                <span className={`font-extrabold text-lg tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Srevox</span>
              </div>
              <p className={`text-xs leading-relaxed max-w-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                Self-hosted Kubernetes incident monitoring, pod log streaming, and AI root-cause analysis. Local, telemetry-free, and fully self-hosted.
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-900" : "text-white"}`}>Product</h4>
              <ul className={`space-y-2 text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                <li><a href="#features" className="hover:text-indigo-500 transition-colors">Features</a></li>
                <li><a href="#architecture" className="hover:text-indigo-500 transition-colors">Connection Modes</a></li>
                <li><a href="#setup" className="hover:text-indigo-500 transition-colors">Quick Setup</a></li>
                <li><a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isLight ? "text-slate-900" : "text-white"}`}>Resources</h4>
              <ul className={`space-y-2 text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                <li><Link href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">Documentation</Link></li>
                <li><Link href="/feedback" className="text-indigo-500 font-bold hover:text-indigo-600 transition-colors">Submit Feedback</Link></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">GitHub Repository</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Community</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-400">
                <li><a href="https://discord.gg/your-discord" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Discord Server</a></li>
                <li><a href="https://x.com/srevox" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Twitter / X</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox/issues" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">Issue Tracker</a></li>
              </ul>
            </div>

          </div>

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
