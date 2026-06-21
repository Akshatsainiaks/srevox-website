"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, Zap, Shield, Server, ArrowRight, CheckCircle,
  Copy, Check, Sparkles, AlertTriangle, ChevronDown, Lock, Code, Terminal, Play,
  Smartphone, Mail, MessageSquare, Plus, Settings, RefreshCw, Eye, Cpu, Database, Link2
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

// Data structures for interactive dashboard
interface Incident {
  id: number;
  podName: string;
  namespace: string;
  status: "Active" | "Investigating" | "Resolved";
  reason: string;
  restarts: number;
  time: string;
  cluster: string;
  logs: string[];
  diagnosis: string;
  diff: string;
}

const mockIncidents: Incident[] = [
  {
    id: 1,
    podName: "auth-service-59bc6594b4-q28w2",
    namespace: "production",
    status: "Active",
    reason: "CrashLoopBackOff",
    restarts: 6,
    time: "2 mins ago",
    cluster: "prod-gke-us",
    logs: [
      "[2026-06-20T09:00:15Z] [INFO] Starting auth-service...",
      "[2026-06-20T09:00:16Z] [INFO] Connecting to postgres database...",
      "[2026-06-20T09:00:16Z] [FATAL] Database connection failed: error connection refused.",
      "[2026-06-20T09:00:16Z] [FATAL] Environment variable 'DB_HOST' is undefined.",
      "[2026-06-20T09:00:16Z] [INFO] Exited with status code 1"
    ],
    diagnosis: "The container crashed because the required database address configuration keys are missing. It failed to connect to PostgreSQL since the environment variable 'DB_HOST' was empty in the running container template.",
    diff: `apiVersion: v1
kind: ConfigMap
metadata:
  name: auth-service-config
data:
+ DB_HOST: "postgres-db.production.svc.cluster.local"
+ DB_PORT: "5432"`
  },
  {
    id: 2,
    podName: "payment-worker-8d8fb485-pl90x",
    namespace: "production",
    status: "Active",
    reason: "OOMKilled",
    restarts: 1,
    time: "8 mins ago",
    cluster: "prod-gke-us",
    logs: [
      "[2026-06-20T08:52:10Z] [INFO] Fetching billing events database batch...",
      "[2026-06-20T08:52:12Z] [INFO] Pulled 50,000 transaction records into local memory stack.",
      "[2026-06-20T08:52:14Z] [INFO] Compiling invoice ledger charts...",
      "[2026-06-20T08:52:15Z] [SYSTEM] Out of Memory: process terminated by kernel signal.",
      "[2026-06-20T08:52:15Z] [FATAL] Command terminated with exit signal 9 (Killed)"
    ],
    diagnosis: "The worker process ran out of allocated memory resources during a heavy transaction aggregation operation. The pod limit was breached.",
    diff: `spec:
  containers:
  - name: payment-worker
    resources:
      limits:
-       memory: "256Mi"
+       memory: "1Gi"
      requests:
-       memory: "128Mi"
+       memory: "512Mi"`
  },
  {
    id: 3,
    podName: "ingress-gateway-22cba9-0w8k9",
    namespace: "kube-system",
    status: "Resolved",
    reason: "LivenessProbeFailed",
    restarts: 0,
    time: "1 hour ago",
    cluster: "prod-gke-us",
    logs: [
      "[2026-06-20T08:00:01Z] [INFO] Gateway API server listening on :8080",
      "[2026-06-20T08:01:20Z] [WARNING] Liveness probe failed for endpoint '/healthz': HTTP response 503 (Service Unavailable)",
      "[2026-06-20T08:01:30Z] [WARNING] Liveness probe failed. Container marked unhealthy. Killing container.",
      "[2026-06-20T08:01:35Z] [INFO] Container restarted successfully."
    ],
    diagnosis: "The service liveness probe triggered too early before the system initialized connection pools. Extending the liveness probe delay solves this startup race.",
    diff: `livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
- initialDelaySeconds: 3
+ initialDelaySeconds: 15
  periodSeconds: 10`
  }
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // 1. Dashboard Mockup States
  const [dashTab, setDashTab] = useState<"incidents" | "clusters" | "channels" | "ai">("incidents");
  const [selectedIncId, setSelectedIncId] = useState<number>(1);
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);
  const [aiResultMap, setAiResultMap] = useState<Record<number, string>>({});
  const [aiTypingIndex, setAiTypingIndex] = useState<number>(0);

  // 2. Notification Previews States
  const [activeChannel, setActiveChannel] = useState<"slack" | "teams" | "whatsapp" | "email">("slack");

  // 3. Live Setup Configurator States
  const [aiProvider, setAiProvider] = useState<"ollama" | "openai" | "anthropic">("ollama");
  const [ollamaModel, setOllamaModel] = useState<string>("llama3.1");
  const [openaiModel, setOpenaiModel] = useState<string>("gpt-4o-mini");
  const [anthropicModel, setAnthropicModel] = useState<string>("claude-3-5-sonnet-20241022");
  const [openaiKey, setOpenaiKey] = useState<string>("sk-proj-xxxxxxxxxxxxxxxxxxxx");
  const [anthropicKey, setAnthropicKey] = useState<string>("sk-ant-xxxxxxxxxxxxxxxxxxxx");
  
  const [enableSlack, setEnableSlack] = useState<boolean>(true);
  const [slackWebhook, setSlackWebhook] = useState<string>("https://hooks.slack.com/services/T00/B00/X00");
  const [enableEmail, setEnableEmail] = useState<boolean>(false);
  const [smtpHost, setSmtpHost] = useState<string>("smtp.mailgun.org");
  const [enableWhatsApp, setEnableWhatsApp] = useState<boolean>(false);
  const [waNumber, setWaNumber] = useState<string>("+15550199");

  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  const setupCommand = "curl -fsSL https://raw.githubusercontent.com/Akshatsainiaks/srevox-setup/main/setup.sh | bash";

  const handleCopySetup = async () => {
    try {
      await navigator.clipboard.writeText(setupCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Build the dynamic .env content based on configuration states
  const getEnvContent = () => {
    let env = `# ── SREVOS CORE ──────────────────────────────────
BACKEND_SECRET_KEY=generate_a_secure_32_character_key_here
ENCRYPTION_KEY=exactly_32_characters_here__________
PORT=4000
DB_USER=postgres
DB_PASSWORD=secure_postgres_pass_here
DB_NAME=srevox

# ── DOMAINS & REDIRECTS ────────────────────────────
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4000
FRONTEND_URL=http://YOUR_SERVER_IP:3000

# ── AI ENGINE CONFIGURATION ────────────────────────
`;
    if (aiProvider === "ollama") {
      env += `AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=${ollamaModel}
`;
    } else if (aiProvider === "openai") {
      env += `AI_PROVIDER=openai
OPENAI_API_KEY=${openaiKey}
OPENAI_MODEL=${openaiModel}
`;
    } else {
      env += `AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=${anthropicKey}
ANTHROPIC_MODEL=${anthropicModel}
`;
    }

    env += `\n# ── NOTIFICATION CHANNELS ──────────────────────────`;
    if (enableSlack) {
      env += `\nSLACK_WEBHOOK_URL=${slackWebhook}`;
    } else {
      env += `\n# SLACK_WEBHOOK_URL=`;
    }

    if (enableEmail) {
      env += `\nSMTP_HOST=${smtpHost}
SMTP_PORT=587
SMTP_USER=postmaster@srevox.local
SMTP_PASS=smtp_password_here
EMAIL_FROM=alerts@srevox.local
EMAIL_TO=oncall@yourdomain.com`;
    } else {
      env += `\n# SMTP_HOST=`;
    }

    if (enableWhatsApp) {
      env += `\nWHATSAPP_PHONE_NUMBER_ID=109283748293
WHATSAPP_ACCESS_TOKEN=eaag_token_value_here
WHATSAPP_TO_NUMBER=${waNumber}`;
    } else {
      env += `\n# WHATSAPP_PHONE_NUMBER_ID=`;
    }

    return env;
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(getEnvContent());
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {}
  };

  const selectedIncident = mockIncidents.find((i) => i.id === selectedIncId) || mockIncidents[0];

  // Trigger AI typing animation simulation
  const runAiDiagnostics = () => {
    if (isAiRunning) return;
    setIsAiRunning(true);
    setAiTypingIndex(0);
    
    // Clear previous result for this incident
    setAiResultMap((prev) => ({ ...prev, [selectedIncId]: "" }));

    const diagnosisText = selectedIncident.diagnosis;
    let idx = 0;
    
    const interval = setInterval(() => {
      setAiResultMap((prev) => ({
        ...prev,
        [selectedIncId]: diagnosisText.substring(0, idx + 1)
      }));
      idx++;
      if (idx >= diagnosisText.length) {
        clearInterval(interval);
        setIsAiRunning(false);
      }
    }, 15);
  };

  // Reset diagnosis when changing incident
  useEffect(() => {
    if (!aiResultMap[selectedIncId]) {
      setIsAiRunning(false);
    }
  }, [selectedIncId]);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden bg-grid-pattern relative">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-100px] left-[5%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-float z-0" />
      <div className="absolute top-[350px] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-float-reverse z-0" />
      <div className="absolute bottom-[200px] left-[10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[180px] pointer-events-none animate-float z-0" />

      {/* Header */}
      <header className="relative z-50 border-b border-slate-900/60 bg-[#070913]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SrevoxLogo size={36} />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-xl tracking-tight leading-none">Srevox</span>
              <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Self-Hosted</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <Link href="/docs" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Docs</Link>
            <a href="#channels" className="hover:text-white transition-colors">Alert Channels</a>
            <a href="#configurator" className="hover:text-white transition-colors">Config Builder</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Akshatsainiaks/srevox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-4 py-2 hover:scale-[1.03] active:scale-[0.98] hover:border-slate-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Code className="w-4 h-4" /> GitHub
            </a>
            <a 
              href="#configurator" 
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-8 animate-pulse-ring">
          <Zap className="w-3.5 h-3.5 fill-indigo-400/20" /> Kubernetes Pod Crash Alerting
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
          Catch container crashes<br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            before your users do.
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Srevox watches pod failure event streams 24/7, analyzes crash logs natively, and delivers structured AI root-cause diagnostics to Email, Slack, Teams, and WhatsApp.
        </p>

        {/* Setup Command */}
        <div className="mt-14 max-w-3xl mx-auto p-2.5 rounded-2xl bg-slate-950/80 border border-slate-900 shadow-2xl flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex-1 flex items-center px-4 py-3.5 font-mono text-sm text-cyan-400 bg-[#070913] rounded-xl border border-slate-900 select-all overflow-x-auto whitespace-nowrap custom-scrollbar">
            <span className="text-slate-600 mr-3 select-none">$</span>
            {setupCommand}
          </div>
          <button 
            onClick={handleCopySetup}
            className="px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Script
              </>
            )}
          </button>
        </div>

        {/* Credentials Callout */}
        <div className="mt-8 max-w-md mx-auto p-4 rounded-xl glass-panel text-left">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Default Administrator Credentials (Self-Hosted)</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Email</span>
              <span className="text-slate-300 font-bold select-all">admin@srevox.local</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Password</span>
              <span className="text-slate-300 font-bold select-all">admin123</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Dashboard Simulation */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-16 relative z-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Explore Srevox Interface</h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl mx-auto">
            Interact with this live dashboard simulator. Click on incidents, examine logs, and request AI diagnostics.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/65 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 glass-panel">
          
          {/* Mockup Left Sidebar - 3 cols */}
          <div className="lg:col-span-3 border-r border-slate-900 bg-slate-950/90 p-5 flex flex-col justify-between h-auto lg:h-[620px]">
            <div className="space-y-6">
              {/* Brand logo */}
              <div className="flex items-center gap-2.5 px-2">
                <SrevoxLogo size={24} />
                <span className="font-extrabold text-white text-md tracking-tight">Srevox Console</span>
              </div>

              {/* Sidebar Menu Links */}
              <div className="space-y-1.5">
                <button 
                  onClick={() => setDashTab("incidents")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    dashTab === "incidents" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Incidents</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </button>

                <button 
                  onClick={() => setDashTab("clusters")}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    dashTab === "clusters" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Server className="w-4 h-4" />
                  <span>Clusters</span>
                </button>

                <button 
                  onClick={() => setDashTab("channels")}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    dashTab === "channels" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Alert Channels</span>
                </button>

                <button 
                  onClick={() => setDashTab("ai")}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    dashTab === "ai" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>AI Rules Config</span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom Metadata */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-900 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span>Instance IP</span>
                <span className="font-mono text-slate-300">127.0.0.1</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Agent Status</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </span>
              </div>
            </div>
          </div>

          {/* Mockup Main View - 9 cols */}
          <div className="lg:col-span-9 flex flex-col h-[620px] bg-slate-900/20">
            
            {/* View Header */}
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black text-white capitalize">{dashTab}</span>
                {dashTab === "incidents" && (
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/10">
                    2 Active Issues
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">prod-gke-us cluster active</span>
              </div>
            </div>

            {/* Tab content area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* INCIDENTS TAB */}
              {dashTab === "incidents" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-stretch">
                  
                  {/* Incidents Table list - 5 cols */}
                  <div className="xl:col-span-5 space-y-3.5">
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Incidents Stream</span>
                    {mockIncidents.map((inc) => (
                      <div 
                        key={inc.id}
                        onClick={() => setSelectedIncId(inc.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                          selectedIncId === inc.id
                            ? "bg-indigo-500/10 border-indigo-500/60 shadow-lg shadow-indigo-500/5"
                            : "bg-slate-950/80 border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            inc.status === "Active" 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {inc.reason}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">{inc.time}</span>
                        </div>
                        <div className="font-mono text-xs text-white font-bold truncate">{inc.podName}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>Namespace: <strong className="text-slate-400">{inc.namespace}</strong></span>
                          <span>•</span>
                          <span>Restarts: <strong className="text-slate-400">{inc.restarts}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Incident details panel - 7 cols */}
                  <div className="xl:col-span-7 flex flex-col justify-between p-5 rounded-xl border border-slate-900 bg-slate-950/50">
                    
                    {/* Upper Metadata */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Inspecting Resource</span>
                          <span className="font-mono text-xs font-bold text-indigo-400">{selectedIncident.podName}</span>
                        </div>
                        <button 
                          onClick={runAiDiagnostics}
                          disabled={isAiRunning}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isAiRunning ? "Diagnosing..." : "Run AI Diagnostics"}
                        </button>
                      </div>

                      {/* Log Console */}
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-2">Container Console Logs</span>
                      <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-slate-400 h-36 overflow-y-auto space-y-1.5 custom-scrollbar">
                        {selectedIncident.logs.map((log, lIdx) => (
                          <div key={lIdx} className={log.includes("FATAL") || log.includes("failed") ? "text-red-400" : ""}>
                            {log}
                          </div>
                        ))}
                      </div>

                      {/* Dynamic AI diagnosis screen */}
                      {(aiResultMap[selectedIncId] || isAiRunning) && (
                        <div className="mt-4 p-4 rounded-lg bg-indigo-950/10 border border-indigo-500/20 text-left animate-float">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1.5">
                            <Sparkles className="w-4.5 h-4.5" />
                            <span>Srevox AI Root-Cause Diagnostic</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed font-sans min-h-[40px]">
                            {aiResultMap[selectedIncId]}
                            {isAiRunning && <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse" />}
                          </p>
                          
                          {/* Code Diff representation */}
                          {aiResultMap[selectedIncId].length === selectedIncident.diagnosis.length && (
                            <div className="mt-3.5 space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Manifest Patch:</span>
                              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-[10px] font-mono text-cyan-400 overflow-x-auto custom-scrollbar select-all">
                                {selectedIncident.diff}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dispatched Alerts summary */}
                    <div className="pt-4 border-t border-slate-900 mt-4 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Alert Dispatch Status:</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> Slack
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Check className="w-3.5 h-3.5" /> Email
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          WhatsApp (cooldown)
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* CLUSTERS VIEW */}
              {dashTab === "clusters" && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-950/70 border border-slate-900 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-extrabold text-white">prod-gke-us</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15">Connected</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Agent version</span>
                          <span className="text-slate-300 font-semibold">v1.2.0</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">HTTP latency</span>
                          <span className="text-slate-300 font-semibold">12ms</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Active Watches</span>
                          <span className="text-slate-300 font-semibold">All Namespaces</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Monitored Pods</span>
                          <span className="text-slate-300 font-semibold">142 Pods</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-950/30 border border-slate-900/60 rounded-xl space-y-4 opacity-70">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-extrabold text-slate-400">staging-eks-eu</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">Offline</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Agent version</span>
                          <span className="text-slate-400 font-semibold">n/a</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">HTTP latency</span>
                          <span className="text-slate-400 font-semibold">--</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Active Watches</span>
                          <span className="text-slate-400 font-semibold">0</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Monitored Pods</span>
                          <span className="text-slate-400 font-semibold">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CHANNELS VIEW */}
              {dashTab === "channels" && (
                <div className="space-y-4 text-left">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Configured Alert Targets</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950/70 border border-indigo-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">Slack Webhook</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 block truncate">hooks.slack.com/.../B01</span>
                    </div>

                    <div className="p-4 bg-slate-950/70 border border-indigo-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">SMTP Mail Service</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 block truncate">smtp.mailgun.org:587</span>
                    </div>

                    <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400">WhatsApp Alerting</span>
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">Disabled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI RULES CONFIG */}
              {dashTab === "ai" && (
                <div className="space-y-4 text-left">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Rule Filtering Matrix</span>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Ignore System Namespaces</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Filter out events originating in namespace "kube-system", "kube-node", etc.</div>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Active</span>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Crash Threshold Alert Limits</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Only trigger chat messages if a pod restarts 3+ times within a 15-minute timeframe.</div>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Active</span>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Cooldown Blockings</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Mute repeating alerts from the same pod template signature for 10 minutes post notification.</div>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Active</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Notification Previews */}
      <section id="channels" className="border-t border-slate-900 bg-slate-950/40 py-24 relative z-25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Structured Notifications</h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl mx-auto">
              Srevox routes clean, structured notifications directly to your chat channels. Select a channel to view the formatting layout:
            </p>

            {/* Selector tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-xl mx-auto">
              {[
                { id: "slack", label: "Slack Chat", icon: MessageSquare },
                { id: "teams", label: "Microsoft Teams", icon: Smartphone },
                { id: "whatsapp", label: "WhatsApp Chat", icon: Smartphone },
                { id: "email", label: "HTML Email", icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChannel(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    activeChannel === tab.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive display area */}
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-900 bg-slate-950">
            
            {/* Mock Slack Window */}
            {activeChannel === "slack" && (
              <div className="p-6 bg-[#1a1d21] text-left text-[13px] font-sans">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-indigo-600 flex items-center justify-center text-white font-black shrink-0 text-xs">SV</div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-white">Srevox Alerting</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded uppercase font-bold">APP</span>
                      <span className="text-[10px] text-slate-500">09:00 AM</span>
                    </div>

                    <div className="border-l-4 border-red-500 bg-[#2b1f23] p-4 rounded-lg space-y-3">
                      <div className="font-bold text-[#f2c744] flex items-center gap-1.5 text-sm">
                        <AlertTriangle className="w-4.5 h-4.5" />
                        <span>Kubernetes Pod Crash: auth-service-59bc6594b4</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-sans font-bold">Cluster</span>
                          <span>prod-gke-us</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-sans font-bold">Namespace</span>
                          <span>production</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-sans font-bold">Event Reason</span>
                          <span className="text-red-400 font-bold">CrashLoopBackOff</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-sans font-bold">Restarts</span>
                          <span>6 times</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <strong>Last Error:</strong> Database connection failed: connection refused on DB_HOST...
                      </div>
                    </div>

                    {/* Slack Buttons */}
                    <div className="flex gap-2 pt-1.5">
                      <button className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
                        Inspect Pod
                      </button>
                      <button className="px-3 py-1.5 rounded border border-indigo-500/20 bg-indigo-500/10 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
                        Diagnose with AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mock Teams Card */}
            {activeChannel === "teams" && (
              <div className="p-6 bg-[#201f1f] text-left font-sans text-xs text-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                  <SrevoxLogo size={16} />
                  <span>Srevox Alerts System</span>
                </div>
                
                <div className="p-4 bg-[#292929] border-t-4 border-red-500 rounded shadow-md space-y-4">
                  <div className="text-sm font-black text-white">🚨 Pod Incident Report: auth-service</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block font-semibold">Cluster Name</span>
                      <span className="font-mono text-slate-300">prod-gke-us</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Reason</span>
                      <span className="text-red-400 font-mono font-bold">CrashLoopBackOff</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Namespace</span>
                      <span className="font-mono text-slate-300">production</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Timestamp</span>
                      <span className="font-mono text-slate-300">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="bg-[#1f1f1f] p-2.5 rounded font-mono text-[10px] text-slate-400 border border-[#333333]">
                    Fatality Log: FATAL: Env variable DB_HOST is undefined.
                  </div>

                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    Open Srevox Instance
                  </button>
                </div>
              </div>
            )}

            {/* Mock WhatsApp Bubble */}
            {activeChannel === "whatsapp" && (
              <div className="p-6 bg-[#0b141a] text-left font-sans text-xs">
                {/* Whatsapp header */}
                <div className="bg-[#202c33] p-3 -mx-6 -mt-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">SV</div>
                  <div>
                    <div className="font-bold text-white text-xs">Srevox Notifications</div>
                    <div className="text-[9px] text-[#8696a0]">Online</div>
                  </div>
                </div>

                {/* Bubble Container */}
                <div className="pt-6 pb-2">
                  <div className="max-w-[85%] bg-[#202c33] p-3 rounded-lg text-white space-y-2 relative shadow-md">
                    <p className="font-mono leading-relaxed whitespace-pre-line text-[11px]">
                      🚨 *Srevox Incident Alert* 🚨{"\n"}
                      *Cluster:* prod-gke-us{"\n"}
                      *Pod:* auth-service-59bc6594b4{"\n"}
                      *Namespace:* production{"\n"}
                      *Status:* CrashLoopBackOff (6 restarts){"\n"}{"\n"}
                      *Diagnosis Overview:*{"\n"}
                      Container failed database connection. Environment configuration 'DB_HOST' is undefined.{"\n"}{"\n"}
                      🔗 View Diagnostics: http://127.0.0.1:3000/login
                    </p>
                    <span className="text-[9px] text-[#8696a0] absolute bottom-1 right-2">09:00 AM ✓✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mock Email View */}
            {activeChannel === "email" && (
              <div className="p-6 bg-slate-900 text-left font-sans text-xs text-slate-300">
                <div className="pb-4 border-b border-slate-800 space-y-1 mb-4">
                  <div><span className="text-slate-500 font-bold">From:</span> <span className="font-semibold text-slate-200">Srevox Alerting Service &lt;alerts@srevox.local&gt;</span></div>
                  <div><span className="text-slate-500 font-bold">To:</span> <span className="font-semibold text-slate-200">oncall@yourdomain.com</span></div>
                  <div><span className="text-slate-500 font-bold">Subject:</span> <span className="font-extrabold text-white">🚨 [Srevox Alert] auth-service crashed in namespace 'production'</span></div>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
                  <div className="flex items-center gap-3">
                    <SrevoxLogo size={28} />
                    <span className="font-extrabold text-white text-md tracking-tight">Srevox On-Call</span>
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 text-slate-300">
                    Your Kubernetes pod has entered a failure state. A summary of the metrics and metadata matches rule <strong className="text-white">"production-namespace-severity-critical"</strong>.
                  </div>

                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="pb-2 font-bold uppercase tracking-wider">Parameter</th>
                        <th className="pb-2 font-bold uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      <tr>
                        <td className="py-2 text-slate-400">Cluster URL</td>
                        <td className="py-2 text-slate-200">prod-gke-us</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-400">Pod Template</td>
                        <td className="py-2 text-slate-200">auth-service-59bc6594b4</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-400">Crash Reason</td>
                        <td className="py-2 text-red-400 font-bold">CrashLoopBackOff</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-400">Failure Count</td>
                        <td className="py-2 text-slate-200">6 restarts</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">AI Root Cause Suggestion</span>
                    <p className="text-xs leading-relaxed text-slate-400 font-sans">
                      The application failed during start because the environment variables targeting host address credentials database variables are undefined inside the values config key templates. Add database config host strings inside environment maps.
                    </p>
                  </div>

                  <a 
                    href="#demo"
                    className="inline-block px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  >
                    Open Incident Dashboard
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SECTION: Live Configurator Playground */}
      <section id="configurator" className="max-w-7xl mx-auto px-6 py-24 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Live Environment Builder</h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl mx-auto">
            Configure your self-hosted instance in real-time. Toggle parameters to customize the deployment configuration file (`.env`).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls - 5 cols */}
          <div className="lg:col-span-5 p-6 rounded-2xl glass-panel text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* AI Diagnostic Options */}
              <div className="space-y-3.5">
                <label className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>1. AI Diagnosis Engine</span>
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ollama", label: "Ollama (Local)" },
                    { id: "openai", label: "OpenAI" },
                    { id: "anthropic", label: "Anthropic" }
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      onClick={() => setAiProvider(prov.id as any)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                        aiProvider === prov.id
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {prov.label}
                    </button>
                  ))}
                </div>

                {/* Sub-inputs conditional */}
                {aiProvider === "ollama" && (
                  <div className="space-y-1 bg-slate-950/80 p-3.5 rounded-xl border border-slate-900 animate-float-reverse">
                    <span className="text-[10px] text-slate-500 block">Ollama Model Name</span>
                    <select 
                      value={ollamaModel} 
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className="w-full bg-[#070913] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="llama3.1">llama3.1 (default)</option>
                      <option value="mistral">mistral</option>
                      <option value="codellama">codellama</option>
                    </select>
                  </div>
                )}

                {aiProvider === "openai" && (
                  <div className="space-y-3.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block">OpenAI Model</span>
                      <input 
                        type="text" 
                        value={openaiModel} 
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block">OpenAI API Key</span>
                      <input 
                        type="password" 
                        value={openaiKey} 
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {aiProvider === "anthropic" && (
                  <div className="space-y-3.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-900">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block">Anthropic Model</span>
                      <input 
                        type="text" 
                        value={anthropicModel} 
                        onChange={(e) => setAnthropicModel(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block">Anthropic API Key</span>
                      <input 
                        type="password" 
                        value={anthropicKey} 
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        className="w-full bg-[#070913] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4" />
                  <span>2. Notification Routing</span>
                </label>

                {/* Slack Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Slack Webhooks</span>
                    <input 
                      type="checkbox" 
                      checked={enableSlack} 
                      onChange={(e) => setEnableSlack(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  {enableSlack && (
                    <input 
                      type="text" 
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono animate-float-reverse"
                    />
                  )}
                </div>

                {/* Email Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Email (SMTP Alerts)</span>
                    <input 
                      type="checkbox" 
                      checked={enableEmail} 
                      onChange={(e) => setEnableEmail(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  {enableEmail && (
                    <input 
                      type="text" 
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="SMTP Host Server (e.g. smtp.mailgun.org)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono animate-float"
                    />
                  )}
                </div>

                {/* WhatsApp Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">WhatsApp Messages</span>
                    <input 
                      type="checkbox" 
                      checked={enableWhatsApp} 
                      onChange={(e) => setEnableWhatsApp(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  {enableWhatsApp && (
                    <input 
                      type="text" 
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="To WhatsApp Number (e.g. +15550199)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono animate-float-reverse"
                    />
                  )}
                </div>
              </div>

            </div>

            {/* Config metadata footer */}
            <div className="text-[10px] text-slate-500 leading-relaxed pt-4 border-t border-slate-900">
              Save this environment structure directly into a file named <strong className="text-slate-300">.env</strong> in your Srevox installation folder.
            </div>
          </div>

          {/* Dynamic Env block - 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950/40 relative overflow-hidden">
            
            {/* Terminal header */}
            <div className="bg-slate-950/80 px-4 py-3.5 flex items-center justify-between border-b border-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-[8px] font-mono">EN</div>
                <span className="text-xs text-slate-400 font-mono">srevox-configuration-template (.env)</span>
              </div>
              <button
                onClick={handleCopyConfig}
                className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/25 text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                {copiedConfig ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Config Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Config
                  </>
                )}
              </button>
            </div>

            {/* Textarea representation */}
            <pre className="p-6 font-mono text-[11px] md:text-xs text-cyan-400 text-left bg-slate-950 flex-1 overflow-auto whitespace-pre h-[480px] custom-scrollbar select-all">
              {getEnvContent()}
            </pre>
          </div>

        </div>
      </section>

      {/* SECTION: Features Grid */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Full Platform Features</h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
              Srevox includes everything needed to track clusters natively and resolve infrastructure anomalies quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Near-Zero CPU Cost",
                desc: "Uses lightweight HTTP chunked persistent streams to hook directly into the Kubernetes event socket. No resource-heavy indexing agents required.",
                color: "from-blue-500/10 to-indigo-500/10 text-indigo-400 border-indigo-500/10 hover:border-indigo-500/25"
              },
              {
                icon: Bell,
                title: "Flexible Integrations",
                desc: "Send error diagnostics to WhatsApp, Slack, Microsoft Teams, SMTP Email, or custom endpoints. Configured in seconds via simple webhooks.",
                color: "from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/10 hover:border-purple-500/25"
              },
              {
                icon: Sparkles,
                title: "AI Diagnostics Engine",
                desc: "Query Srevox AI to interpret complex pod exit codes and trace issues directly to ConfigMaps, OOM boundaries, or network ports. Works with local Ollama too.",
                color: "from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/10 hover:border-amber-500/25"
              },
              {
                icon: Shield,
                title: "Namespace Filters & Rules",
                desc: "Isolate alerts. Avoid notification floods by filtering out unimportant warning namespaces (`kube-system`), warning levels, and setting cool-down rules.",
                color: "from-green-500/10 to-emerald-500/10 text-emerald-400 border-green-500/10 hover:border-green-500/25"
              },
              {
                icon: Lock,
                title: "Fully Air-Gapped",
                desc: "Host it entirely on your physical machine or virtual cloud instances. Databases stay local; Srevox uses no trackers, call-homes, or usage logging.",
                color: "from-red-500/10 to-rose-500/10 text-rose-400 border-red-500/10 hover:border-red-500/25"
              },
              {
                icon: Database,
                title: "Infinite Incident History",
                desc: "Store and search historical failure events locally in PostgreSQL. No billing limits, tier locks, or pricing packages based on usage metrics.",
                color: "from-cyan-500/10 to-sky-500/10 text-cyan-400 border-cyan-500/10 hover:border-cyan-500/25"
              }
            ].map((feat, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:bg-slate-900/30 transition-all duration-300 hover:scale-[1.008] relative overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.color} mb-6 border`}>
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-3 text-slate-400 text-xs md:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Deployment Walkthrough */}
      <section className="py-24 border-t border-slate-900/60 max-w-5xl mx-auto px-6 text-center relative z-20">
        <div className="mb-14">
          <h2 className="text-3xl font-extrabold text-white">Three-Step Setup</h2>
          <p className="text-slate-400 text-sm mt-2">Spin up the Srevox server stack on your machine in under 3 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-slate-950/50 border border-slate-900 rounded-xl space-y-3.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center text-xs font-black font-mono">1</div>
            <div className="text-sm font-bold text-white">Download Setup</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Run the curl setup command on your VM or server to fetch the standard Srevox `docker-compose.yml` config directory.
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-cyan-400 overflow-x-auto custom-scrollbar select-all">
              {setupCommand}
            </pre>
          </div>

          <div className="p-6 bg-slate-950/50 border border-slate-900 rounded-xl space-y-3.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center text-xs font-black font-mono">2</div>
            <div className="text-sm font-bold text-white">Edit Variables</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Open the downloaded template configuration file (`.env`) to configure your ports, secrets, database passwords, and notification channels.
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-cyan-400 overflow-x-auto custom-scrollbar select-all">
              cd srevox && nano .env
            </pre>
          </div>

          <div className="p-6 bg-slate-950/50 border border-slate-900 rounded-xl space-y-3.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center text-xs font-black font-mono">3</div>
            <div className="text-sm font-bold text-white">Launch Containers</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Boot up Srevox using Docker Compose. All components (API Server, Dashboard Client, Worker Service, Database) initialize automatically.
            </p>
            <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-mono text-cyan-400 overflow-x-auto custom-scrollbar select-all">
              docker compose up -d
            </pre>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 border-t border-slate-900 max-w-4xl mx-auto px-6 relative z-20">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            {
              q: "Does Srevox need inbound firewall access into my Kubernetes cluster?",
              a: "No. The Srevox agent runs inside your cluster, registers with the API, watches events, and sends outbound HTTPS diagnostic packets to the server. It requires no inbound ingress or port forwarding configurations."
            },
            {
              q: "Can I run Srevox fully air-gapped without external keys?",
              a: "Yes. Out-of-the-box, Srevox supports local Ollama endpoints. You can point it to a GPU-enabled Ollama container on your network running models like `llama3` or `codellama` for zero-leak local logs analysis."
            },
            {
              q: "How permissions-heavy is the cluster agent?",
              a: "The cluster agent requires read-only (RBAC) permissions to watch Pods and Events. It never asks for write permissions, configuration editing, or access to sensitive Secrets."
            },
            {
              q: "What user auth structure is implemented in the self-hosted version?",
              a: "The self-hosted instance seeds a default admin account (`admin@srevox.local`). Public signups are disabled globally for security; however, administrators can invite team members directly inside the settings dashboard."
            }
          ].map((faq, i) => (
            <div key={i} className="border-b border-slate-900">
              <button 
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex justify-between items-center py-5 text-left text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
              </button>
              {faqOpen === i && (
                <div className="pb-5 text-sm text-slate-400 leading-relaxed pr-8 animate-float">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

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
              <ul className="space-y-2.5 text-sm">
                <li><a href="#demo" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Interactive Demo</a></li>
                <li><a href="#channels" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Alert Channels</a></li>
                <li><a href="#configurator" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Config Builder</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">FAQ</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/docs" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Documentation</Link></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">GitHub Repository</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Deploy Configs</a></li>
                <li><Link href="/docs" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Architecture</Link></li>
              </ul>
            </div>

            {/* Column 4: Community */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Community</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Discord Server</a></li>
                <li><a href="https://x.com/srevox" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Twitter / X</a></li>
                <li><a href="https://github.com/Akshatsainiaks/srevox/issues" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Issue Tracker</a></li>
                <li><a href="mailto:support@srevox.local" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span>© {new Date().getFullYear()} Srevox. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors duration-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
