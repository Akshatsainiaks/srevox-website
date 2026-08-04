"use client";
import { useState, useEffect } from "react";
import { DockerPullsBadge } from "@/components/DockerPullsBadge";
import { useSrevoxTheme } from "@/components/ThemeProvider";
import { 
  BookOpen, ChevronRight, Search, Server, Bell, Shield, 
  Terminal, Code, Menu, X, Zap, Info, CheckCircle, AlertTriangle, Sparkles, ArrowLeft, MessageSquare,
  Sun, Moon, Eye, AlignLeft
} from "lucide-react";
import Link from "next/link";

import { SrevoxLogo } from "@/components/SrevoxLogo";
import { supabase, getDynamicDocsData } from "@/lib/supabase";

// Custom Callout Box Component (Light/Dark Mode Aware)
function Callout({ type, isLight = false, children }: { type: "info" | "warning" | "success" | "tip"; isLight?: boolean; children: React.ReactNode }) {
  const styles = {
    info: {
      border: isLight ? "border-blue-200 bg-blue-50 text-blue-900" : "border-blue-500/20 bg-blue-500/5 text-blue-300",
      icon: Info,
      iconColor: isLight ? "text-blue-600" : "text-blue-400"
    },
    warning: {
      border: isLight ? "border-amber-200 bg-amber-50 text-amber-900" : "border-amber-500/20 bg-amber-500/5 text-amber-300",
      icon: AlertTriangle,
      iconColor: isLight ? "text-amber-600" : "text-amber-400"
    },
    success: {
      border: isLight ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
      icon: CheckCircle,
      iconColor: isLight ? "text-emerald-600" : "text-emerald-400"
    },
    tip: {
      border: isLight ? "border-cyan-200 bg-cyan-50 text-cyan-900" : "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
      icon: Sparkles,
      iconColor: isLight ? "text-cyan-600" : "text-cyan-400"
    }
  }[type];

  const IconComponent = styles.icon;

  return (
    <div className={`flex gap-3.5 rounded-xl border p-4.5 my-5 text-sm leading-relaxed ${styles.border}`}>
      <IconComponent className={`w-5 h-5 shrink-0 ${styles.iconColor}`} />
      <div>{children}</div>
    </div>
  );
}

// Custom Code Terminal Box Component
function CodeBlock({ code, isLight = false }: { code: string; isLight?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className={`relative rounded-xl overflow-hidden my-5 font-mono border ${
      isLight ? "border-slate-300 bg-slate-900 text-slate-100" : "border-slate-900 bg-slate-950/80"
    }`}>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800 bg-slate-950/60">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <button 
          onClick={handleCopy}
          className="ml-auto text-[10px] font-bold text-slate-400 hover:text-white transition-all px-2 py-0.5 rounded border border-slate-700 bg-slate-800/60 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs md:text-sm text-cyan-400 overflow-x-auto leading-relaxed custom-scrollbar whitespace-pre-wrap select-all">
        {code}
      </pre>
    </div>
  );
}

const NAV = [
  { id: "intro", title: "Introduction", icon: BookOpen, items: [{ id: "what", title: "What is Srevox?" }, { id: "how", title: "How it works" }, { id: "arch", title: "Architecture" }, { id: "qs", title: "Quick start (5 min)" }, { id: "docker-compose", title: "Docker Compose file" }] },
  { id: "clusters", title: "Clusters", icon: Server, items: [{ id: "connect", title: "Connect a cluster" }, { id: "agent", title: "Agent installation" }, { id: "agent-yaml", title: "srevox-agent.yaml manifest" }, { id: "kubeconfig", title: "Kubeconfig method" }, { id: "rbac", title: "RBAC permissions" }] },
  { id: "channels", title: "Alert Channels", icon: Bell, items: [{ id: "email", title: "Email / Gmail" }, { id: "teams", title: "Microsoft Teams" }, { id: "whatsapp", title: "WhatsApp" }, { id: "webhook", title: "Webhook / Slack" }] },
  { id: "rules", title: "Alert Rules", icon: Shield, items: [{ id: "rule-create", title: "Creating rules" }, { id: "noise", title: "Noise control" }, { id: "reasons", title: "Crash reasons" }] },
  { id: "ai", title: "AI Diagnosis", icon: Zap, items: [{ id: "ai-overview", title: "Overview" }, { id: "ai-providers", title: "AI providers" }, { id: "ai-local", title: "Local / offline" }] },
  { id: "api", title: "API Reference", icon: Code, items: [{ id: "api-auth", title: "Authentication" }, { id: "api-incidents", title: "Incidents" }, { id: "api-clusters", title: "Clusters" }] },
  { id: "k8s", title: "Testing & K8s", icon: Terminal, items: [{ id: "k8s-redis", title: "Test via Redis" }, { id: "k8s-crash", title: "Simulate pod crash" }, { id: "k8s-watcher", title: "Run Go watcher" }, { id: "k8s-full", title: "Full cluster setup" }] },
];

const ALL_TOC_ITEMS = NAV.flatMap(s => s.items);

function DynamicDocSection({ topicId, defaultTitle, children, isLight }: { topicId: string; defaultTitle: string; children: React.ReactNode; isLight: boolean }) {
  const [customMarkdown, setCustomMarkdown] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local storage cache for published admin edits first
    if (typeof window !== "undefined") {
      try {
        const savedEdits = JSON.parse(localStorage.getItem("srevox_docs_edits") || "{}");
        if (savedEdits[topicId] && savedEdits[topicId].content_markdown) {
          setCustomMarkdown(savedEdits[topicId].content_markdown);
          return;
        }
      } catch {}
    }

    // 2. Fetch from Supabase
    async function fetchSupabaseDoc() {
      try {
        const { data } = await supabase.from("docs_articles").select("content_markdown").eq("id", topicId).single();
        if (data && data.content_markdown) {
          setCustomMarkdown(data.content_markdown);
        }
      } catch {}
    }
    fetchSupabaseDoc();
  }, [topicId]);

  if (customMarkdown) {
    return (
      <div className={`p-6 rounded-2xl border ${isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/80 border-slate-800 text-cyan-300"} space-y-3 font-mono text-xs md:text-sm leading-relaxed shadow-sm`}>
        <div className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-sky-400 pb-2.5 border-b border-slate-800 flex items-center justify-between">
          <span>{defaultTitle}</span>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ✓ Admin Edited & Published Live
          </span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{customMarkdown}</div>
      </div>
    );
  }

  return <>{children}</>;
}

// Full Continuous Documentation Render Component with 27 Anchors
function FullScrollableDoc({ isLight }: { isLight: boolean }) {
  const p = `text-sm leading-7 mb-4 text-left font-normal ${isLight ? "text-slate-700" : "text-slate-400"}`;
  const h2 = `text-2xl md:text-3xl font-black tracking-tight mb-5 text-left pb-3 border-b ${isLight ? "text-slate-900 border-slate-200" : "text-white border-slate-900"}`;
  const h3 = `text-base font-bold mt-8 mb-3 text-left flex items-center gap-2 ${isLight ? "text-slate-800" : "text-slate-200"}`;
  const cardBg = isLight ? "bg-white border-slate-200 text-slate-800 shadow-sm" : "bg-slate-950/40 border-slate-900 text-slate-200";

  return (
    <div className="space-y-16">
      
      {/* 1. What is Srevox */}
      <section id="what" className="scroll-mt-28">
        <DynamicDocSection topicId="what" defaultTitle="What is Srevox?" isLight={isLight}>
          <h1 className={h2}>What is Srevox?</h1>
          <p className={p}>Srevox is a self-hosted, telemetry-free Kubernetes pod crash alerting platform. It monitors your containers 24/7 using lightweight HTTP persistent event streams and delivers structured diagnostics to email, chat endpoints, and webhooks instantly.</p>
          <Callout type="tip" isLight={isLight}>SRE + VOX — The voice of your site reliability. Srevox operates completely inside your secure network with local databases.</Callout>
          <h3 className={h3}>Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {[
              ["⚡", "Instant Detection", "Sub-5 second alerting via persistent K8s Watch API streams."],
              ["🔔", "Multi-channel Alerts", "Structured payloads sent to Email (SMTP), Teams, Slack, and WhatsApp."],
              ["🤖", "AI Diagnostics", "On-demand error diagnostics and YAML config patches using Groq, OpenAI, or Ollama."],
              ["🛡️", "Noise Filtering", "Cooldown block timers, namespace exclusions, and minimum crash count threshold filters."],
              ["☁️", "Universal Watching", "Works with EKS, GKE, AKS, bare-metal clusters, or local minikube nodes."],
              ["🔒", "100% Private", "No remote databases, usage tracking, telemetry, or external cloud storage dependencies."]
            ].map(([e, t, dd]) => (
              <div key={String(t)} className={`flex gap-3.5 p-4 rounded-xl border ${cardBg}`}>
                <span className="text-xl shrink-0">{e}</span>
                <div>
                  <div className={`font-extrabold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{t}</div>
                  <div className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-slate-500"}`}>{dd}</div>
                </div>
              </div>
            ))}
          </div>
        </DynamicDocSection>
      </section>

      {/* 2. How it works */}
      <section id="how" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="how" defaultTitle="How It Works" isLight={isLight}>
          <h1 className={h2}>How It Works</h1>
          <p className={p}>Srevox interfaces directly with the Kubernetes API server using a persistent connection. The cluster agent pushes event streams the moment they register.</p>
          <div className="space-y-4 my-6 text-left">
            {[
              ["1", "Go Watcher Connects", "The srevox-agent establishes a persistent Watch socket on the Kubernetes Pod API, listening for container restarts."],
              ["2", "Event Dispatched to Redis", "Upon detecting OOMKilled or CrashLoopBackOff states, the agent serializes a JSON payload and publishes it to Redis."],
              ["3", "Alert Worker Processes", "A lightweight alert daemon listens to Redis, filters out warning namespaces, validates cooldowns, and executes notifications."],
              ["4", "Diagnostics Stored", "Incidents are cataloged in Postgres. Administrators can examine logs, run AI analysis, or mark them resolved."]
            ].map(([n, t, dd]) => (
              <div key={n} className={`flex gap-4 p-4 rounded-xl border ${cardBg}`}>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold shrink-0">{n}</div>
                <div>
                  <div className={`font-extrabold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>{t}</div>
                  <div className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-slate-500"}`}>{dd}</div>
                </div>
              </div>
            ))}
          </div>
        </DynamicDocSection>
      </section>

      {/* 3. Architecture */}
      <section id="arch" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="arch" defaultTitle="Architecture Overview" isLight={isLight}>
          <h1 className={h2}>Architecture Overview</h1>
          <p className={p}>Srevox uses a decoupled microservices architecture designed for ultra-low memory footprint and high resilience in production environments.</p>
          <Callout type="info" isLight={isLight}>All services communicate locally over internal Docker/Kubernetes bridge networks.</Callout>
        </DynamicDocSection>
      </section>

      {/* 4. Quick start */}
      <section id="qs" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="qs" defaultTitle="Quick Start & Deployment" isLight={isLight}>
          <h1 className={h2}>Quick Start & Deployment</h1>
          <Callout type="info" isLight={isLight}>Deploy Srevox using our single-line bash command, or run via Docker Compose.</Callout>
          <div className="text-left space-y-4">
            <h3 className={h3}>Option 1: One-Line Automatic Setup</h3>
            <CodeBlock isLight={isLight} code="curl -fsSL https://raw.githubusercontent.com/Akshatsainiaks/srevox/main/setup.sh | bash" />
            
            <h3 className={h3}>Option 3: Kubernetes Helm Chart Deployment (v0.1.26)</h3>
            <p className={p}>Deploy, upgrade, or rollback Srevox directly on any Kubernetes cluster (EKS, GKE, AKS, minikube, k3s) using Helm:</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-indigo-400 block mb-1"># 1-Command Install:</span>
                <CodeBlock isLight={isLight} code="helm install srevox ./charts/srevox --namespace srevox --create-namespace --set postgres.password=&quot;MySecurePassword123!&quot;" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 block mb-1"># Zero-Downtime Upgrade:</span>
                <CodeBlock isLight={isLight} code="helm upgrade srevox ./charts/srevox --namespace srevox --reuse-values" />
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 block mb-1"># 1-Click Rollback:</span>
                <CodeBlock isLight={isLight} code="helm rollback srevox 1 --namespace srevox" />
              </div>
            </div>

            <h3 className={h3}>Default Administrator Credentials</h3>
            <div className={`p-4 rounded-xl border font-mono text-xs ${cardBg}`}>
              <div><strong className="text-sky-400">Email:</strong> admin@srevox.local</div>
              <div><strong className="text-sky-400">Password:</strong> admin123</div>
            </div>
          </div>
        </DynamicDocSection>
      </section>

      {/* 5. Docker Compose */}
      <section id="docker-compose" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="docker-compose" defaultTitle="Production docker-compose.yml" isLight={isLight}>
          <h1 className={h2}>Production docker-compose.yml</h1>
          <p className={p}>Use the full production manifest below to boot Srevox services: API, Frontend, Worker, AI Gateway, Activity service, PostgreSQL, and Redis.</p>
          <CodeBlock isLight={isLight} code={`services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: srevox
      POSTGRES_USER: srevox
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
  redis:
    image: redis:7-alpine
    restart: unless-stopped
  api:
    image: akshatsaini08/srevox-api:v0.1.23
    ports:
      - "4000:4000"
  frontend:
    image: akshatsaini08/srevox-frontend:v0.1.23
    ports:
      - "3000:3000"`} />
        </DynamicDocSection>
      </section>

      {/* 6. Connect a Cluster */}
      <section id="connect" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="connect" defaultTitle="Connecting a Kubernetes Cluster" isLight={isLight}>
          <h1 className={h2}>Connecting a Kubernetes Cluster</h1>
          <p className={p}>Srevox supports two primary methods for cluster integration: direct Service Account API Token connection (Agentless) or in-cluster Watcher Daemon (Agent).</p>
        </DynamicDocSection>
      </section>

      {/* 7. Agent Installation */}
      <section id="agent" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="agent" defaultTitle="Agent Installation" isLight={isLight}>
          <h1 className={h2}>Agent Installation</h1>
          <p className={p}>Deploy the srevox-agent binary or container inside your cluster to monitor pod status events outbound.</p>
          <CodeBlock isLight={isLight} code="kubectl apply -f https://raw.githubusercontent.com/Akshatsainiaks/srevox/main/srevox-agent.yaml" />
        </DynamicDocSection>
      </section>

      {/* 8. srevox-agent.yaml Manifest */}
      <section id="agent-yaml" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="agent-yaml" defaultTitle="srevox-agent.yaml Manifest" isLight={isLight}>
          <h1 className={h2}>srevox-agent.yaml Manifest</h1>
          <p className={p}>Full Kubernetes ServiceAccount, ClusterRole, ClusterRoleBinding, and Deployment manifest for cluster watching.</p>
          <CodeBlock isLight={isLight} code={`apiVersion: v1
kind: ServiceAccount
metadata:
  name: srevox-agent
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: srevox-agent-role
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log", "events", "nodes"]
  verbs: ["get", "list", "watch"]`} />
        </DynamicDocSection>
      </section>

      {/* 9. Kubeconfig Method */}
      <section id="kubeconfig" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="kubeconfig" defaultTitle="Kubeconfig Connection Method" isLight={isLight}>
          <h1 className={h2}>Kubeconfig Connection Method</h1>
          <p className={p}>For remote EKS or GKE clusters, upload a sanitized Kubeconfig YAML file directly in the Clusters settings menu.</p>
        </DynamicDocSection>
      </section>

      {/* 10. RBAC Permissions */}
      <section id="rbac" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="rbac" defaultTitle="RBAC & Service Account Security" isLight={isLight}>
          <h1 className={h2}>RBAC & Service Account Security</h1>
          <p className={p}>Srevox requires read-only (<code className="text-sky-400 font-mono font-bold">get, list, watch</code>) permissions on Pods and Events.</p>
        </DynamicDocSection>
      </section>

      {/* 11. Email / Gmail */}
      <section id="email" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="email" defaultTitle="Alert Channels — Email / Gmail (SMTP)" isLight={isLight}>
          <h1 className={h2}>Alert Channels — Email / Gmail (SMTP)</h1>
          <p className={p}>Configure SMTP credentials to receive structured HTML crash reports directly in your engineering team inbox.</p>
        </DynamicDocSection>
      </section>

      {/* 12. Microsoft Teams */}
      <section id="teams" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="teams" defaultTitle="Alert Channels — Microsoft Teams" isLight={isLight}>
          <h1 className={h2}>Alert Channels — Microsoft Teams</h1>
          <p className={p}>Send rich Adaptive Cards into Microsoft Teams channels with single-click direct links to pod stacktraces.</p>
        </DynamicDocSection>
      </section>

      {/* 13. WhatsApp */}
      <section id="whatsapp" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="whatsapp" defaultTitle="Alert Channels — WhatsApp Integration" isLight={isLight}>
          <h1 className={h2}>Alert Channels — WhatsApp Integration</h1>
          <p className={p}>Route urgent P1 CrashLoopBackOff alerts directly to on-call engineer WhatsApp numbers via Twilio API.</p>
        </DynamicDocSection>
      </section>

      {/* 14. Webhook / Slack */}
      <section id="webhook" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="webhook" defaultTitle="Alert Channels — Webhooks & Slack" isLight={isLight}>
          <h1 className={h2}>Alert Channels — Webhooks & Slack</h1>
          <p className={p}>Incoming Webhooks trigger custom HTTP POST payloads to Slack or custom automation endpoints.</p>
        </DynamicDocSection>
      </section>

      {/* 15. Creating Rules */}
      <section id="rule-create" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="rule-create" defaultTitle="Creating Custom Alert Rules" isLight={isLight}>
          <h1 className={h2}>Creating Custom Alert Rules</h1>
          <p className={p}>Set minimum crash counts, target specific Kubernetes namespaces, and define custom alert triggers.</p>
        </DynamicDocSection>
      </section>

      {/* 16. Noise Control */}
      <section id="noise" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="noise" defaultTitle="Noise Control & Global Muting" isLight={isLight}>
          <h1 className={h2}>Noise Control & Global Muting</h1>
          <p className={p}>Use cooldown block timers to prevent alert storms when a pod continuously enters CrashLoopBackOff.</p>
        </DynamicDocSection>
      </section>

      {/* 17. Crash Reasons */}
      <section id="reasons" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="reasons" defaultTitle="Recognized Crash Reasons" isLight={isLight}>
          <h1 className={h2}>Recognized Crash Reasons</h1>
          <p className={p}>Srevox automatically categorizes OOMKilled (Exit 137), SIGSEGV (Exit 139), LivenessProbe failures, and ImagePullBackOff.</p>
        </DynamicDocSection>
      </section>

      {/* 18. AI Overview */}
      <section id="ai-overview" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="ai-overview" defaultTitle="AI Incident Diagnostics Overview" isLight={isLight}>
          <h1 className={h2}>AI Incident Diagnostics Overview</h1>
          <p className={p}>Click "Diagnose with AI" on any incident page to generate an instant root-cause breakdown and YAML fix recommendation.</p>
        </DynamicDocSection>
      </section>

      {/* 19. AI Providers */}
      <section id="ai-providers" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="ai-providers" defaultTitle="Supported AI Providers" isLight={isLight}>
          <h1 className={h2}>Supported AI Providers</h1>
          <p className={p}>Choose between Groq (ultra-fast inference), OpenAI (GPT-4o), Anthropic (Claude 3.5), or local GPU Ollama containers.</p>
        </DynamicDocSection>
      </section>

      {/* 20. Local / Offline AI */}
      <section id="ai-local" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="ai-local" defaultTitle="Local & Offline Ollama AI Setup" isLight={isLight}>
          <h1 className={h2}>Local & Offline Ollama AI Setup</h1>
          <p className={p}>Connect local GPU-enabled Ollama containers (running models like Llama 3 or CodeLlama) for 100% private, zero-egress diagnostics.</p>
        </DynamicDocSection>
      </section>

      {/* 21. API Authentication */}
      <section id="api-auth" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="api-auth" defaultTitle="API Authentication & Bearer Tokens" isLight={isLight}>
          <h1 className={h2}>API Authentication & Bearer Tokens</h1>
          <p className={p}>Authenticate REST API calls using Bearer Tokens generated in Administrator Settings.</p>
          <CodeBlock isLight={isLight} code="curl -H 'Authorization: Bearer <TOKEN>' http://localhost:4000/api/v1/incidents" />
        </DynamicDocSection>
      </section>

      {/* 22. API Incidents */}
      <section id="api-incidents" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="api-incidents" defaultTitle="API Endpoints — Incidents" isLight={isLight}>
          <h1 className={h2}>API Endpoints — Incidents</h1>
          <p className={p}>Query, filter, or resolve active cluster incidents programmatically via REST API endpoints.</p>
        </DynamicDocSection>
      </section>

      {/* 23. API Clusters */}
      <section id="api-clusters" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="api-clusters" defaultTitle="API Endpoints — Clusters" isLight={isLight}>
          <h1 className={h2}>API Endpoints — Clusters</h1>
          <p className={p}>Register new Kubernetes clusters, update API bearer tokens, or query node health metrics.</p>
        </DynamicDocSection>
      </section>

      {/* 24. Test via Redis */}
      <section id="k8s-redis" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="k8s-redis" defaultTitle="Testing Alert Pipeline via Redis" isLight={isLight}>
          <h1 className={h2}>Testing Alert Pipeline via Redis</h1>
          <p className={p}>Publish test incident payloads directly to Redis pub/sub channel to verify alerting rules without crashing real pods.</p>
        </DynamicDocSection>
      </section>

      {/* 25. Simulate Pod Crash */}
      <section id="k8s-crash" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="k8s-crash" defaultTitle="Simulating Pod Crashes" isLight={isLight}>
          <h1 className={h2}>Simulating Pod Crashes</h1>
          <p className={p}>Verify Srevox alerts by deploying a test container that exits with code 139 or OOMKilled states.</p>
          <CodeBlock isLight={isLight} code="kubectl run test-crash --image=busybox --restart=Never -- sh -c 'exit 1'" />
        </DynamicDocSection>
      </section>

      {/* 26. Run Go Watcher */}
      <section id="k8s-watcher" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="k8s-watcher" defaultTitle="Running the Go Watcher Service" isLight={isLight}>
          <h1 className={h2}>Running the Go Watcher Service</h1>
          <p className={p}>Run the srevox-agent Go binary directly from source code during local development.</p>
        </DynamicDocSection>
      </section>

      {/* 27. Full Cluster Setup */}
      <section id="k8s-full" className="scroll-mt-28 pt-8 border-t border-slate-200/60 dark:border-slate-900/60">
        <DynamicDocSection topicId="k8s-full" defaultTitle="Full Multi-Cluster Production Setup" isLight={isLight}>
          <h1 className={h2}>Full Multi-Cluster Production Setup</h1>
          <p className={p}>Complete guide for deploying Srevox across production EKS, GKE, and bare-metal Kubernetes environments.</p>
        </DynamicDocSection>
      </section>

    </div>
  );
}

export default function DocsPage() {
  const { theme, setTheme, mounted, isLight } = useSrevoxTheme("srevox_docs_theme", "dark");
  const [active, setActive] = useState("what");
  const [open, setOpen] = useState(["intro", "k8s", "clusters", "channels", "rules", "ai", "api"]);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<"yes" | "no" | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [dynamicNav, setDynamicNav] = useState(NAV);

  useEffect(() => {
    async function loadDynamicNav() {
      const data = await getDynamicDocsData();
      if (data && data.length > 0) {
        // Map icon strings to Lucide components if needed
        const mapped = data.map(cat => ({
          ...cat,
          icon: cat.icon === "Server" ? Server : cat.icon === "Bell" ? Bell : cat.icon === "Shield" ? Shield : cat.icon === "Zap" ? Zap : cat.icon === "Code" ? Code : cat.icon === "Terminal" ? Terminal : BookOpen
        }));
        setDynamicNav(mapped);
      }
    }
    loadDynamicNav();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && readingMode) {
        setReadingMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readingMode]);

  // Bulletproof Window Scroll Spy to update Minimap TOC and Left Sidebar dynamically while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = ALL_TOC_ITEMS.length - 1; i >= 0; i--) {
        const item = ALL_TOC_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActive(item.id);
          // Automatically expand matching parent category in Left Sidebar
          const parentNav = NAV.find(s => s.items.some(it => it.id === item.id));
          if (parentNav) {
            setOpen(prev => prev.includes(parentNav.id) ? prev : [...prev, parentNav.id]);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Automatically scroll the Minimap box internally (Without moving the main page viewport scroll)
  useEffect(() => {
    if (active && mounted) {
      const activeEl = document.getElementById(`minimap-item-${active}`);
      const minimapAside = document.getElementById("minimap-sidebar-aside");
      if (activeEl && minimapAside) {
        const topOffset = activeEl.offsetTop - minimapAside.offsetTop;
        minimapAside.scrollTo({ top: Math.max(0, topOffset - 60), behavior: "smooth" });
      }
    }
  }, [active, mounted]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSectionClick = (s: typeof NAV[number]) => {
    const isOpen = open.includes(s.id);
    if (isOpen) {
      setOpen(p => p.filter(x => x !== s.id));
    } else {
      setOpen(p => [...p, s.id]);
    }
  };

  const scrollToTopic = (topicId: string) => {
    setActive(topicId);
    setMobileNav(false);
    const el = document.getElementById(topicId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filtered = search ? dynamicNav.map(s => ({ ...s, items: s.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())) })).filter(s => s.items.length > 0) : dynamicNav;

  return (
    <div suppressHydrationWarning className={`min-h-screen font-sans selection:bg-sky-500/30 overflow-x-hidden relative transition-colors duration-300 ${
      isLight ? "bg-[#f8fafc] text-slate-800" : "bg-[#030712] text-slate-200"
    }`}>
      
      {/* Decorative Orbs & Production Spotlights */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isLight ? "hidden" : ""}`}>
        <div className="absolute top-[-100px] left-[5%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none animate-float" />
        <div className="absolute bottom-[100px] right-[5%] w-[550px] h-[550px] bg-cyan-500/8 rounded-full blur-[160px] pointer-events-none animate-float-reverse" />
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 gap-6 justify-between border-b transition-all duration-300 ${
        readingMode ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100"
      } ${
        isLight ? "bg-white/85 backdrop-blur-2xl border-slate-200/80" : "bg-[#030712]/85 backdrop-blur-2xl border-slate-800/60 text-white shadow-2xl shadow-sky-950/20"
      }`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md group-hover:bg-sky-400/30 transition-all" />
              <SrevoxLogo size={32} className="relative group-hover:scale-105 transition-transform" />
            </div>
            <span className={`font-black text-lg tracking-tight leading-none flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              Srevox Docs
              <span className="px-2 py-0.5 text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full font-mono">
                v0.1.23
              </span>
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Reading Mode Button */}
          <button
            type="button"
            onClick={() => setReadingMode(true)}
            className={`text-xs font-bold transition-all flex items-center gap-1.5 rounded-xl px-3.5 py-2 cursor-pointer ${
              isLight 
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200" 
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
            }`}
            title="Focus Reading Mode (Distraction-Free)"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Reading Mode</span>
          </button>

          {/* Independent Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight 
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
            title={mounted ? `Switch to ${isLight ? "Dark" : "Light"} Theme (Docs Only)` : "Switch Theme"}
          >
            {mounted ? (
              isLight ? (
                <>
                  <Moon className="w-4 h-4 text-sky-600" />
                  <span className="hidden md:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Light</span>
                </>
              )
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Light</span>
              </>
            )}
          </button>

          <Link href="/feedback" className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-2">
            <MessageSquare className="w-3.5 h-3.5" /> Feedback
          </Link>
          <Link href="/" className={`text-xs font-bold transition-colors flex items-center gap-1.5 border rounded-xl px-4 py-2 ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white"
          }`}>
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <button 
            onClick={() => setMobileNav(!mobileNav)} 
            className="md:hidden w-10 h-10 border border-slate-800 bg-slate-900/50 flex items-center justify-center rounded-xl cursor-pointer text-slate-400 hover:text-white"
          >
            {mobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Docs Layout */}
      <div className={`flex min-h-screen transition-all duration-300 ${readingMode ? "pt-6 justify-center" : "pt-20"}`}>
        
        {/* Left Sidebar Navigation */}
        <aside className={`fixed top-20 left-0 w-64 h-[calc(100vh-80px)] border-r flex flex-col z-40 transition-all duration-300 ${
          readingMode ? "hidden" : ""
        } ${
          mobileNav ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          isLight ? "bg-white/90 border-slate-200 backdrop-blur-xl" : "bg-[#030712]/90 border-slate-800/80 backdrop-blur-2xl text-slate-200"
        }`}>
          {/* Search */}
          <div className={`p-4 border-b ${isLight ? "border-slate-200" : "border-slate-900/60"}`}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search guide..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans ${
                  isLight ? "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400" : "bg-[#030712] border-slate-800 text-white placeholder-slate-600"
                }`}
              />
            </div>
          </div>

          {/* Navigation menu list */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
            {filtered.map(s => {
              const isSectionOpen = open.includes(s.id);
              return (
                <div key={s.id} className="space-y-1">
                  <button 
                    onClick={() => handleSectionClick(s)} 
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                      isSectionOpen 
                        ? (isLight ? "bg-slate-100 text-sky-600 font-bold" : "bg-slate-900/30 text-white") 
                        : (isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-slate-900/40 hover:text-white")
                    }`}
                  >
                    <s.icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isSectionOpen ? "text-sky-400" : "text-slate-400"}`} />
                    <span className="flex-1 text-[10px] font-black uppercase tracking-wider">{s.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectionOpen ? "rotate-90 text-sky-400" : "text-slate-400"}`} />
                  </button>
                  {isSectionOpen && (
                    <div className={`ml-5 border-l pl-3.5 py-1 space-y-1 text-left relative ${isLight ? "border-slate-200" : "border-slate-900"}`}>
                      {s.items.map(item => {
                        const isItemActive = active === item.id;
                        return (
                          <button 
                            key={item.id} 
                            onClick={() => scrollToTopic(item.id)} 
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-all duration-200 cursor-pointer relative ${
                              isItemActive 
                                ? (isLight ? "bg-sky-50 text-sky-600 font-black border-l-2 border-sky-600 pl-2 rounded-l-none" : "bg-sky-500/10 text-sky-300 font-extrabold border-l-2 border-sky-500 pl-2 rounded-l-none")
                                : (isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100" : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/20")
                            }`}
                          >
                            {item.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`p-4 border-t text-center text-[10px] font-mono ${isLight ? "border-slate-200 text-slate-400" : "border-slate-900/60 text-slate-500"}`}>
            Srevox v0.1.23
          </div>
        </aside>

        {/* Main Center Content Container */}
        <main className={`flex-1 transition-all duration-300 p-6 md:p-12 z-10 flex flex-col justify-between min-h-[calc(100vh-80px)] ${
          readingMode ? "max-w-3xl text-base leading-relaxed" : "md:ml-64 xl:mr-64 max-w-4xl pr-4 lg:pr-8"
        }`}>
          <div className="flex-1">
            <FullScrollableDoc isLight={isLight} />
          </div>

          {/* Helpfulness Widget & Doc Footer */}
          <div className={`mt-16 pt-12 border-t space-y-12 ${isLight ? "border-slate-200" : "border-slate-900/80"}`}>
            {/* Helpfulness Widget */}
            <div className={`p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "glass-panel"
            }`}>
              <div className="text-center sm:text-left">
                <h4 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Was this page helpful?</h4>
                <p className="text-xs text-slate-500 mt-1">Help us improve the Srevox documentation.</p>
              </div>
              <div className="flex items-center gap-3">
                {feedbackSubmitted ? (
                  <div className="text-xs text-sky-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle className="w-4 h-4 text-sky-400" />
                    <span>Thank you for your feedback!</span>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setFeedbackSubmitted("yes")}
                      className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600" : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-sky-500/10 hover:text-sky-400"
                      }`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setFeedbackSubmitted("no")}
                      className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600" : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-sky-500/10 hover:text-sky-400"
                      }`}
                    >
                      No
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Utility Doc Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 pb-4 font-mono">
              <div className="flex items-center gap-2">
                <SrevoxLogo size={20} />
                <span className={`font-bold ${isLight ? "text-slate-700" : "text-slate-400"}`}>Srevox Docs</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                <a href="https://github.com/Akshatsainiaks/srevox" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">GitHub</a>
                <a href="https://github.com/Akshatsainiaks/srevox" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Setup Guide</a>
                <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Discord</a>
                <a href="https://x.com/srevox" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">Twitter</a>
              </div>
            </div>
          </div>
        </main>

        {/* Right-Side Minimap TOC (Halved Height with Auto-Scroll & Modern Title "IN THIS GUIDE") */}
        {!readingMode && (
          <aside id="minimap-sidebar-aside" className={`w-60 hidden xl:block fixed top-24 right-6 max-h-[380px] overflow-y-auto custom-scrollbar p-4 rounded-2xl border text-left shrink-0 z-30 transition-all duration-300 shadow-xl ${
            isLight ? "bg-white/95 border-slate-200 backdrop-blur-md" : "bg-[#030712]/95 border-slate-800 backdrop-blur-2xl text-slate-200"
          }`}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-400 mb-3 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>IN THIS GUIDE</span>
            </div>
            <ul className="space-y-1 text-xs">
              {ALL_TOC_ITEMS.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      id={`minimap-item-${item.id}`}
                      type="button"
                      onClick={() => scrollToTopic(item.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                        isActive
                          ? (isLight ? "bg-sky-50 text-sky-600 font-extrabold border-l-2 border-sky-600 pl-2 rounded-l-none" : "bg-sky-500/10 text-sky-400 font-extrabold border-l-2 border-sky-500 pl-2 rounded-l-none")
                          : (isLight ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40")
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

      </div>

      {/* Floating Exit Reading Mode Bar */}
      {readingMode && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            type="button"
            onClick={() => setReadingMode(false)}
            className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-sky-400/40 cursor-pointer active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Exit Reading Mode (Esc)</span>
          </button>
        </div>
      )}

    </div>
  );
}
