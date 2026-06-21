"use client";
import { useState, useEffect } from "react";
import { 
  BookOpen, ChevronRight, Search, Server, Bell, Shield, 
  Terminal, Code, Menu, X, Zap, Info, CheckCircle, AlertTriangle, Sparkles, ArrowLeft
} from "lucide-react";
import Link from "next/link";

// Srevox Logo Component
function SrevoxLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 680 680" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="docs-logo-g1" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#00cfff"/>
          <stop offset="40%" stopColor="#1a7fff"/>
          <stop offset="100%" stopColor="#0033cc"/>
        </linearGradient>
        <linearGradient id="docs-logo-g2" x1="0%" y1="0%" x2="0%" y2="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="docs-logo-g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60e0ff" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0044ff" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      
      <path d="M340,60 L540,175 L540,445 Q540,580 340,625 Q140,580 140,445 L140,175 Z" fill="url(#docs-logo-g1)" stroke="url(#docs-logo-g3)" strokeWidth="3"/>
      <path d="M340,60 L540,175 L540,310 Q445,275 340,255 Q255,245 140,275 L140,175 Z" fill="url(#docs-logo-g2)" opacity="0.7"/>
      <path d="M340,80 L522,188 L522,443 Q522,562 340,602 Q158,562 158,443 L158,188 Z" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25"/>
      <polyline points="175,345 235,345 255,298 278,398 304,282 328,345 395,345 418,302 442,385 464,345 510,345" fill="none" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Custom Callout Box Component
function Callout({ type, children }: { type: "info" | "warning" | "success" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: {
      border: "border-blue-500/20 bg-blue-500/5 text-blue-300",
      icon: Info,
      iconColor: "text-blue-400"
    },
    warning: {
      border: "border-amber-500/20 bg-amber-500/5 text-amber-300",
      icon: AlertTriangle,
      iconColor: "text-amber-400"
    },
    success: {
      border: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
      icon: CheckCircle,
      iconColor: "text-emerald-400"
    },
    tip: {
      border: "border-purple-500/20 bg-purple-500/5 text-purple-300",
      icon: Sparkles,
      iconColor: "text-purple-400"
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
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-900 bg-slate-950/80 my-5 font-mono scan-line">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-900/60 bg-slate-950/50">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <button 
          onClick={handleCopy}
          className="ml-auto text-[10px] font-bold text-slate-500 hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] px-2 py-0.5 rounded border border-slate-800 bg-slate-900/40 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs md:text-sm text-cyan-400/90 overflow-x-auto leading-relaxed custom-scrollbar whitespace-pre-wrap select-all">
        {code}
      </pre>
    </div>
  );
}

const NAV = [
  { id: "intro", title: "Introduction", icon: BookOpen, items: [{ id: "what", title: "What is Srevox?" }, { id: "how", title: "How it works" }, { id: "arch", title: "Architecture" }, { id: "qs", title: "Quick start (5 min)" }] },
  { id: "clusters", title: "Clusters", icon: Server, items: [{ id: "connect", title: "Connect a cluster" }, { id: "agent", title: "Agent installation" }, { id: "kubeconfig", title: "Kubeconfig method" }, { id: "rbac", title: "RBAC permissions" }] },
  { id: "channels", title: "Alert Channels", icon: Bell, items: [{ id: "email", title: "Email / Gmail" }, { id: "teams", title: "Microsoft Teams" }, { id: "whatsapp", title: "WhatsApp" }, { id: "webhook", title: "Webhook / Slack" }] },
  { id: "rules", title: "Alert Rules", icon: Shield, items: [{ id: "rule-create", title: "Creating rules" }, { id: "noise", title: "Noise control" }, { id: "reasons", title: "Crash reasons" }] },
  { id: "ai", title: "AI Diagnosis", icon: Zap, items: [{ id: "ai-overview", title: "Overview" }, { id: "ai-providers", title: "AI providers" }, { id: "ai-local", title: "Local / offline" }] },
  { id: "api", title: "API Reference", icon: Code, items: [{ id: "api-auth", title: "Authentication" }, { id: "api-incidents", title: "Incidents" }, { id: "api-clusters", title: "Clusters" }] },
  { id: "k8s", title: "Testing & K8s", icon: Terminal, items: [{ id: "k8s-redis", title: "Test via Redis" }, { id: "k8s-crash", title: "Simulate pod crash" }, { id: "k8s-watcher", title: "Run Go watcher" }, { id: "k8s-full", title: "Full cluster setup" }] },
];

function Content({ id }: { id: string }) {
  const p = "text-sm text-slate-400 leading-7 mb-4 text-left";
  const h2 = "text-2xl md:text-3xl font-black text-white tracking-tight mb-5 text-left border-b border-slate-900 pb-3";
  const h3 = "text-base font-bold text-slate-200 mt-8 mb-3 text-left flex items-center gap-2";

  const map: Record<string, React.ReactNode> = {
    what: (<>
      <h1 className={h2}>What is Srevox?</h1>
      <p className={p}>Srevox is an open-source, telemetry-free Kubernetes pod crash alerting platform. It monitors your containers 24/7 using lightweight HTTP persistent event streams and delivers structured diagnostics to email, chat endpoints, and webhooks instantly.</p>
      <Callout type="tip">SRE + VOX — The voice of your site reliability. Srevox operates completely inside your secure network with local databases.</Callout>
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
          <div key={String(t)} className="flex gap-3.5 p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-left">
            <span className="text-xl shrink-0">{e}</span>
            <div>
              <div className="font-extrabold text-sm text-white">{t}</div>
              <div className="text-xs text-slate-500 mt-1">{dd}</div>
            </div>
          </div>
        ))}
      </div>
    </>),
    how: (<>
      <h1 className={h2}>How It Works</h1>
      <p className={p}>Srevox interfaces directly with the Kubernetes API server using a persistent connection. The cluster agent pushes event streams the moment they register.</p>
      <div className="space-y-4 my-6 text-left">
        {[
          ["1", "Go Watcher Connects", "The srevox-agent establishes a persistent Watch socket on the Kubernetes Pod API, listening for container restarts."],
          ["2", "Event Dispatched to Redis", "Upon detecting OOMKilled or CrashLoopBackOff states, the agent serializes a JSON payload and publishes it to Redis."],
          ["3", "Alert Worker Processes", "A lightweight alert daemon listens to Redis, filters out warning namespaces, validates cooldowns, and executes notifications."],
          ["4", "Diagnostics Stored", "Incidents are cataloged in Postgres. Administrators can examine logs, run AI analysis, or mark them resolved."]
        ].map(([n, t, dd]) => (
          <div key={n} className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/20">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">{n}</div>
            <div>
              <div className="font-extrabold text-sm text-white">{t}</div>
              <div className="text-xs text-slate-500 mt-1">{dd}</div>
            </div>
          </div>
        ))}
      </div>
    </>),
    qs: (<>
      <h1 className={h2}>Quick Start</h1>
      <Callout type="info">For local source execution, ensure you have Node.js 18+, Python 3.10+, Go 1.21+, PostgreSQL 16, and Redis 7 active.</Callout>
      {[
        ["1. Spin up Backend API", "cd apps/api\nnpm install\nnpm run dev"],
        ["2. Start Python AI Gateway", "cd apps/backend\npip install -r requirements.txt\nuvicorn ai_service:app --port 8000 --reload"],
        ["3. Start Alert Worker Daemon", "cd apps/alert-worker\nnpm install\nnpm run dev"],
        ["4. Spin up Dashboard Frontend", "cd apps/frontend\nnpm install\nnpm run dev"]
      ].map(([t, c]) => (
        <div key={String(t)} className="text-left">
          <h3 className={h3}>{t}</h3>
          <CodeBlock code={String(c)} />
        </div>
      ))}
      <Callout type="success">Default Administrator Credentials: admin@srevox.local / admin123</Callout>
    </>),
    agent: (<>
      <h1 className={h2}>Agent Installation</h1>
      <p className={p}>The Srevox agent is deployed as a single replica pod. It establishes an outbound socket to Redis — keeping ingress rules closed.</p>
      <CodeBlock code={`kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: srevox-agent
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels: { app: srevox-agent }
  template:
    metadata:
      labels: { app: srevox-agent }
    spec:
      containers:
      - name: agent
        image: srevox/agent:latest
        env:
        - name: REDIS_URL
          value: "redis://YOUR_REDIS_IP:6379"
        - name: CLUSTER_ID
          value: "YOUR_CLUSTER_UUID"
        resources:
          requests: { cpu: 5m, memory: 16Mi }
          limits:   { cpu: 50m, memory: 64Mi }
EOF`}/>
    </>),
    email: (<>
      <h1 className={h2}>Email / SMTP Setup</h1>
      <p className={p}>Send structured incident reports directly to your on-call inbox using custom mail relay hosts.</p>
      <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden my-4 text-left">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-950/80 text-slate-500 text-left">
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Field</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Sample Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {[
              ["smtp_host", "smtp.gmail.com"],
              ["smtp_port", "587 (TLS)"],
              ["smtp_user", "operations@yourdomain.com"],
              ["smtp_pass", "16-char App Password key"],
              ["to", "oncall@yourdomain.com"]
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="px-4 py-3 text-indigo-400 font-bold">{k}</td>
                <td className="px-4 py-3 text-slate-400">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout type="info">Gmail: Navigate to Google Account Security → 2-Step Verification → App Passwords. Select "Other", type "Srevox", and copy the 16-character code.</Callout>
    </>),
    arch: (<>
      <h1 className={h2}>Platform Architecture</h1>
      <p className={p}>Srevox consists of 5 modular services communicating securely over local loops:</p>
      <div className="space-y-4 my-4 text-left">
        {[
          ["Go Watch Agent", "Monitors the Kubernetes API stream inside the target cluster. Sends lightweight JSON logs to Redis."],
          ["Redis Queue Broker", "Handles message buffering. Acts as the queue channel (srevox:crashes) between watchers and the alerting daemon."],
          ["Alert Worker Node", "Subscribes to Redis, evaluates cooldown periods and alert criteria rules, and fires notifications."],
          ["Fastify Web API", "Powers the dashboard backend, handles database lookups, credentials validation, and cluster mapping."],
          ["Next.js Frontend Client", "Translates cluster metrics, log streams, settings, and rule filters into a dark dashboard UI."]
        ].map(([t, d2]) => (
          <div key={String(t)} className="p-4 rounded-xl border border-slate-900 bg-slate-950/20">
            <div className="font-extrabold text-sm text-indigo-400 mb-1">{t}</div>
            <div className="text-xs text-slate-400">{d2}</div>
          </div>
        ))}
      </div>
    </>),
    connect: (<>
      <h1 className={h2}>Connect a Cluster</h1>
      <p className={p}>Srevox supports two cluster monitoring modes: Agent-based (recommended for production) and direct Kubeconfig polling.</p>
      <h3 className={h3}>1. Agent Method (Recommended)</h3>
      <p className={p}>From Srevox Dashboard → Clusters → Add Cluster → choose "Agent" and copy the UUID. Next, install the agent deployment inside your cluster:</p>
      <CodeBlock code={`kubectl apply -f https://raw.githubusercontent.com/Akshatsainiaks/srevox-setup/main/srevox-agent.yml

kubectl set env deployment/srevox-agent -n kube-system \\
  REDIS_URL=redis://YOUR_SREVOX_IP:6379 \\
  CLUSTER_ID=YOUR_CLUSTER_UUID \\
  CLUSTER_NAME=production`}/>
      <h3 className={h3}>2. Kubeconfig Method (Alternative)</h3>
      <p className={p}>Paste your credentials directory file text content directly in the cluster add panel. The Srevox server runs watcher subprocesses locally on your host.</p>
      <Callout type="warning">The Kubeconfig method stores raw credentials on the Srevox server. Use the Agent deployment method for better security isolation.</Callout>
    </>),
    kubeconfig: (<>
      <h1 className={h2}>Kubeconfig Connection</h1>
      <p className={p}>Use the kubeconfig option to monitor external clusters without deploying workloads inside them.</p>
      <CodeBlock code={`# Dump local kubernetes credentials
cat ~/.kube/config

# Or for minified cluster contexts
kubectl config view --minify --raw`}/>
    </>),
    rbac: (
      <>
        <h1 className={h2}>RBAC Cluster Permissions</h1>
        <p className={p}>The Go agent requires read-only permissions to watch pod streams, events, deployments, and cronjobs inside your cluster.</p>
        
        <h3 className={h3}>Apply Permissions Manifest</h3>
        <p className={p}>Run the following command to deploy the ServiceAccount, ClusterRole, and ClusterRoleBinding resources:</p>
        <CodeBlock code={`kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: srevox-agent
rules:
  - apiGroups: [""]
    resources: ["pods", "nodes", "namespaces", "services", "endpoints", "persistentvolumes", "persistentvolumeclaims", "events"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["batch"]
    resources: ["jobs", "cronjobs"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: srevox-agent
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: srevox-agent
subjects:
  - kind: ServiceAccount
    name: srevox-agent
    namespace: kube-system
EOF`} />
        
        <h3 className={h3}>Restart Agent Deployment</h3>
        <CodeBlock code={`kubectl rollout restart deployment/srevox-agent -n kube-system`} />
      </>
    ),
    teams: (<>
      <h1 className={h2}>Microsoft Teams Setup</h1>
      <p className={p}>Route crash notification adaptive cards directly to a Teams channel.</p>
      <h3 className={h3}>Setup Steps</h3>
      <p className={p}>1. In Teams, go to your target channel → click ... (Options) → select "Connectors" or "Incoming Webhook" and compile details.</p>
      <p className={p}>2. Name the integration "Srevox" and copy the webhook URL.</p>
      <p className={p}>3. Inside Srevox Dashboard → Channels → Add → Microsoft Teams, paste the URL.</p>
      <CodeBlock code={`webhook_url: https://your-org.webhook.office.com/webhookb2/...`}/>
    </>),
    whatsapp: (<>
      <h1 className={h2}>WhatsApp / Twilio</h1>
      <p className={p}>Configure real-time message notifications for high-priority outages via WhatsApp.</p>
      <h3 className={h3}>Configuration Parameter template</h3>
      <CodeBlock code={`account_sid: ACxxxxxxxxxxxxxxxxxxxxxxxx
auth_token:  your_twilio_auth_token_here
from:        whatsapp:+14155238886 (Twilio Sandbox number)
to:          whatsapp:+your_mobile_number`}/>
    </>),
    webhook: (<>
      <h1 className={h2}>Generic Webhook / Slack</h1>
      <p className={p}>Send JSON notifications to any target HTTP endpoint, including custom monitoring pipelines.</p>
      <h3 className={h3}>Slack Webhook Setup</h3>
      <p className={p}>Create an app on api.slack.com, enable "Incoming Webhooks", authorize it for your channel, and paste the webhook URL in Srevox Channel Settings.</p>
      <h3 className={h3}>Payload Format Schema</h3>
      <CodeBlock code={`{
  "pod_name": "payment-gateway-78xbd",
  "namespace": "billing",
  "crash_reason": "OOMKilled",
  "restart_count": 4,
  "severity": "critical",
  "incident_id": "uuid-v4-token-key",
  "cluster_name": "production-gke-01",
  "detected_at": "2026-06-20T10:00:00Z"
}`}/>
    </>),
    "rule-create": (<>
      <h1 className={h2}>Creating Alert Rules</h1>
      <p className={p}>Configure criteria thresholds that determine when a pod failure routes notification alerts.</p>
      <h3 className={h3}>Fields Mapping</h3>
      <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden my-4 text-left">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-950/80 text-slate-500 text-left">
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Field</th>
              <th className="px-4 py-3 font-bold uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {[
              ["Cluster", "Target Kubernetes cluster context to watch."],
              ["Namespaces", "Define comma-separated scopes, or leave empty for all."],
              ["Reasons", "Select CrashLoopBackOff, OOMKilled, etc."],
              ["Min Restarts", "Filter transient crashes (e.g., alert after 3 restarts)."],
              ["Cooldown", "Ignore repeating identical alerts for X minutes."]
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="px-4 py-3 text-indigo-400 font-bold">{k}</td>
                <td className="px-4 py-3 text-slate-400">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>),
    noise: (<>
      <h1 className={h2}>Noise Control Filters</h1>
      <p className={p}>Prevent alert fatigue. Fine-tune your rules with cooldown periods, namespace exclusions, and crash count thresholds to avoid alerting on temporary startups.</p>
    </>),
    reasons: (<>
      <h1 className={h2}>Crash Reasons Matrix</h1>
      <p className={p}>Srevox captures these pod failures from the Kubernetes event stream:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 text-left">
        {[
          "CrashLoopBackOff", "OOMKilled", "Error", "BackOff", "Failed", "FailedMount",
          "FailedScheduling", "ImagePullBackOff", "ErrImagePull", "CreateContainerError",
          "Evicted", "Unhealthy", "Killing", "NetworkNotReady"
        ].map(r => (
          <div key={r} className="px-3.5 py-2.5 rounded-lg border border-red-500/10 bg-red-500/5 font-mono text-[10px] text-red-400 text-center">
            {r}
          </div>
        ))}
      </div>
    </>),
    "ai-overview": (<>
      <h1 className={h2}>AI Diagnosis Engine</h1>
      <p className={p}>When a container restarts, Srevox extracts logs, queries selected AI models (OpenAI, Anthropic, Groq, Ollama), and provides root-cause analysis with fix steps directly in your incident dashboard.</p>
    </>),
    "ai-providers": (<>
      <h1 className={h2}>Supported AI Providers</h1>
      <p className={p}>Configure API endpoints inside Dashboard → Settings → AI Configuration.</p>
      <div className="space-y-4 my-4 text-left">
        {[
          ["Groq Cloud API", "Recommended for low cost. Highly fast response times.", "llama-3.3-70b-versatile, llama-3.1-8b-instant"],
          ["OpenAI Platform", "Standard API integration for GPT models.", "gpt-4o-mini, gpt-4o"],
          ["Anthropic Console", "High diagnostic accuracy using Claude models.", "claude-3-5-sonnet-latest"],
          ["Ollama (Fully Local)", "Offline diagnostics. Data never leaves your container loop.", "llama3, mistral"]
        ].map(([name, desc, models]) => (
          <div key={name} className="p-4 rounded-xl border border-slate-900 bg-slate-950/20">
            <div className="font-extrabold text-sm text-white mb-0.5">{name}</div>
            <div className="text-xs text-slate-500 mb-2">{desc}</div>
            <div className="font-mono text-[10px] text-indigo-400">{models}</div>
          </div>
        ))}
      </div>
    </>),
    "ai-local": (<>
      <h1 className={h2}>Local / Offline AI Setup</h1>
      <p className={p}>Use Ollama to diagnose Kubernetes pod crashes completely offline.</p>
      <h3 className={h3}>Install and Run Ollama</h3>
      <CodeBlock code={`# Install Ollama CLI
curl -fsSL https://ollama.com/install.sh | sh

# Download Llama model
ollama pull llama3

# Start serving local API
ollama serve`}/>
    </>),
    "api-auth": (<>
      <h1 className={h2}>API Authentication</h1>
      <p className={p}>The Srevox API uses standard JSON Web Tokens. Authenticate your requests using the bearer header:</p>
      <CodeBlock code={`# Obtain JWT token
curl -X POST http://localhost:4000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@srevox.local","password":"admin123"}'

# Access metrics route
curl http://localhost:4000/api/incidents \\
  -H "Authorization: Bearer YOUR_ACCESS_JWT"`}/>
    </>),
    "api-incidents": (<>
      <h1 className={h2}>Incidents Endpoint</h1>
      <CodeBlock code={`# List open incident tickets
GET /api/incidents?status=open

# Acknowledge incident
POST /api/incidents/:id/acknowledge

# Run AI diagnosis
POST /api/incidents/:id/diagnose`}/>
    </>),
    "api-clusters": (<>
      <h1 className={h2}>Clusters Endpoint</h1>
      <CodeBlock code={`# Fetch connected contexts
GET /api/clusters

# Delete a context
DELETE /api/clusters/:id`}/>
    </>),
    "k8s-redis": (<>
      <h1 className={h2}>Simulate alerts via Redis</h1>
      <p className={p}>Trigger a test incident in Srevox manually by publishing events directly to Redis:</p>
      <CodeBlock code={`docker exec srevox-redis redis-cli PUBLISH srevox:crashes '{
  "cluster_id": "YOUR_CLUSTER_UUID",
  "pod_name": "billing-payment-worker-v2",
  "namespace": "production",
  "container_name": "app",
  "crash_reason": "OOMKilled",
  "restart_count": 3,
  "detected_at": "2026-06-20T10:00:00Z"
}'`}/>
    </>),
    "k8s-crash": (<>
      <h1 className={h2}>Crash Loop Simulation</h1>
      <p className={p}>Deploy a crashing pod template to test the alert loop pipeline live in your cluster:</p>
      <CodeBlock code={`# Deploy a crashing busybox pod
kubectl run crash-test \\
  --image=busybox --restart=Always \\
  -- /bin/sh -c "exit 1"`}/>
    </>),
    "k8s-watcher": (<>
      <h1 className={h2}>Run Agent Separately</h1>
      <p className={p}>Run the Go watcher agent binary locally in your terminal for debugging purposes:</p>
      <CodeBlock code={`cd apps/watcher
go mod tidy
REDIS_URL=redis://localhost:6379 CLUSTER_ID=YOUR_UUID CLUSTER_NAME=dev go run cmd/watcher/main.go`}/>
    </>),
    "k8s-full": (<>
      <h1 className={h2}>Complete Setup Validation</h1>
      <p className={p}>Verify Srevox alerts by connecting a cluster agent, creating a notification rule pointing to email/Slack, and triggering a container crash in the watched namespace.</p>
    </>),
  };
  return <>{map[id] || <p className="text-sm text-slate-500 text-left">Select a topic from the sidebar.</p>}</>;
}

export default function DocsPage() {
  const [active, setActive] = useState("what");
  const [open, setOpen] = useState(["intro", "k8s"]);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<"yes" | "no" | null>(null);

  const handleSectionClick = (s: typeof NAV[number]) => {
    const isOpen = open.includes(s.id);
    if (isOpen) {
      setOpen(p => p.filter(x => x !== s.id));
    } else {
      setOpen(p => [...p, s.id]);
      if (s.items && s.items.length > 0) {
        setActive(s.items[0].id);
      }
    }
  };

  const filtered = search ? NAV.map(s => ({ ...s, items: s.items.filter(i => i.title.toLowerCase().includes(search.toLowerCase())) })).filter(s => s.items.length > 0) : NAV;

  return (
    <div className="min-h-screen bg-[#070913] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden bg-grid-pattern relative">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-100px] left-[5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-float z-0" />
      <div className="absolute bottom-[100px] right-[5%] w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none animate-float-reverse z-0" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070913]/70 backdrop-blur-xl border-b border-slate-900/60 h-20 flex items-center px-6 gap-6 justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <SrevoxLogo size={32} />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-lg tracking-tight leading-none">Srevox</span>
              <span className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Docs Console</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/80 rounded-xl px-4 py-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <button 
            onClick={() => setMobileNav(!mobileNav)} 
            className="md:hidden w-10 h-10 border border-slate-800 bg-slate-900/30 flex items-center justify-center rounded-xl cursor-pointer text-slate-400 hover:text-white"
          >
            {mobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Docs Layout */}
      <div className="flex pt-20 min-h-screen">
        
        {/* Sidebar */}
        <aside className={`fixed top-20 left-0 w-64 h-[calc(100vh-80px)] border-r border-slate-900/60 bg-[#070913]/90 md:bg-[#070913]/40 backdrop-blur-md flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}>
          {/* Search */}
          <div className="p-4 border-b border-slate-900/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="Search guide..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#070913] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans placeholder-slate-600"
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
                      isSectionOpen ? "bg-slate-900/30 text-white" : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
                    }`}
                  >
                    <s.icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isSectionOpen ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="flex-1 text-[10px] font-black uppercase tracking-wider">{s.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectionOpen ? "rotate-90 text-indigo-400" : "text-slate-500"}`} />
                  </button>
                  {isSectionOpen && (
                    <div className="ml-5 border-l border-slate-900 pl-3.5 py-1 space-y-1 text-left relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-indigo-500/30 before:to-transparent">
                      {s.items.map(item => {
                        const isItemActive = active === item.id;
                        return (
                          <button 
                            key={item.id} 
                            onClick={() => { setActive(item.id); setMobileNav(false); }} 
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-all duration-200 cursor-pointer relative ${
                              isItemActive 
                                ? "bg-indigo-500/10 text-indigo-300 font-extrabold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-indigo-500 pl-2 rounded-l-none" 
                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/20"
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

          <div className="p-4 border-t border-slate-900/60 text-center text-[10px] text-slate-600 font-mono">
            Srevox v1.0.0
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 md:ml-64 p-8 md:p-12 overflow-y-auto max-w-4xl mx-auto z-10 flex flex-col justify-between min-h-[calc(100vh-80px)]">
          <div className="flex-1">
            <Content id={active} />
          </div>

          {/* Helpfulness Widget & Doc Footer */}
          <div className="mt-16 pt-12 border-t border-slate-900/80 space-y-12">
            {/* Helpfulness Widget */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-white">Was this page helpful?</h4>
                <p className="text-xs text-slate-500 mt-1">Help us improve the Srevox documentation.</p>
              </div>
              <div className="flex items-center gap-3">
                {feedbackSubmitted ? (
                  <div className="text-xs text-indigo-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                    <span>Thank you for your feedback!</span>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setFeedbackSubmitted("yes")}
                      className="px-4 py-2 border border-slate-800 bg-slate-900/40 text-xs font-bold rounded-xl hover:bg-indigo-600/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-slate-300"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => setFeedbackSubmitted("no")}
                      className="px-4 py-2 border border-slate-800 bg-slate-900/40 text-xs font-bold rounded-xl hover:bg-indigo-600/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-slate-300"
                    >
                      No
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Utility Doc Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600 pb-4 font-mono">
              <div className="flex items-center gap-2">
                <SrevoxLogo size={20} />
                <span className="text-slate-400 font-bold">Srevox Docs</span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                <a href="https://github.com/Akshatsainiaks/srevox" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">GitHub</a>
                <a href="https://github.com/Akshatsainiaks/srevox-setup" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Setup Guide</a>
                <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Discord</a>
                <a href="https://x.com/srevox" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Twitter</a>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
