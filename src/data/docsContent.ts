export const INITIAL_DOCS_CONTENT: Record<string, { title: string; markdown: string }> = {
  "what": {
    title: "What is Srevox?",
    markdown: `### What is Srevox?

Srevox is an **open-source, self-hosted Kubernetes incident detection and remediation engine** engineered for Site Reliability Engineers (SREs), DevOps teams, and platform engineers.

It connects directly to your Kubernetes API server, streams pod events via **Watch API**, parses container log tails upon crash events, runs AI-assisted root-cause diagnosis using Gemini/Claude/GPT or local Ollama, and dispatches rich alert cards to Slack, Teams, WhatsApp, and email.

### Key Features
- **Zero Telemetry Overhead**: No heavyweight Prometheus query loops or noisy agents. Uses native Kubernetes Client-Go Informer.
- **Instant Crash Detection**: Catches \`CrashLoopBackOff\`, \`OOMKilled\`, \`ImagePullBackOff\`, and \`ErrImagePull\` events under 100ms.
- **AI Diagnosis Engine**: Parses pod \`kubectl logs --tail=100\` and generates immediate remediation instructions.
- **Multi-Channel Alerting**: Instant notifications via Email, Teams, Slack, and WhatsApp.`
  },
  "how": {
    title: "How it works",
    markdown: `### How Srevox Works

Srevox operates using an event-driven architecture designed to minimize CPU and memory footprint on your control plane:

1. **Informer Watch Loop**: The Srevox watcher connects to \`kube-apiserver\` using WebSocket or client-go Watchers to listen for \`Pod\` status transitions.
2. **Log Extraction**: Upon detecting \`status.containerStatuses[].state.waiting.reason == "CrashLoopBackOff"\` or exit code != 0, it fetches container logs.
3. **AI Root-Cause Diagnosis**: The log snippet is passed to the configured AI provider to analyze stack traces and misconfigurations.
4. **Alert Dispatch**: Formatted markdown alerts are sent to your designated alert channels.`
  },
  "arch": {
    title: "Architecture",
    markdown: `### Srevox Architecture

The platform consists of four primary decoupled microservices:

\`\`\`text
+-------------------+      +-------------------+      +-------------------+
|  K8s API Server   | ---> |   Srevox Watcher  | ---> |   AI Diagnosis    |
| (kube-apiserver)  |      |   (Go Informer)   |      | (Gemini/Claude)   |
+-------------------+      +-------------------+      +-------------------+
                                    |                           |
                                    v                           v
                           +-------------------+      +-------------------+
                           |  Supabase DB / DB |      | Alert Dispatcher  |
                           | (Incidents & Docs)|      | (Slack/Teams/Email)|
                           +-------------------+      +-------------------+
\`\`\`

- **Watcher Node**: Written in Go for ultra-low latency event monitoring.
- **AI Service**: Python FastAPI / Node.js worker analyzing log tracebacks.
- **Web Console**: Next.js 16 App Router interface for documentation & incident management.`
  },
  "qs": {
    title: "Quick start (5 min)",
    markdown: `### Quick Start Guide (5 Minutes)

Deploy Srevox locally or to your Kubernetes cluster in under 5 minutes:

#### Step 1: Clone the Repository
\`\`\`bash
git clone https://github.com/Akshatsainiaks/srevox-website.git
cd srevox-website
\`\`\`

#### Step 2: Configure Environment Variables
Copy \`.env.example\` to \`.env.local\`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

#### Step 3: Launch Local Server
\`\`\`bash
npm run dev
\`\`\`
Navigate to \`http://localhost:3000/srevox/admin\` to manage your cluster incidents and documentation.`
  },
  "docker-compose": {
    title: "Docker Compose file",
    markdown: `### Docker Compose Setup

Run Srevox with Docker Compose for local testing:

\`\`\`yaml
version: '3.8'

services:
  srevox-web:
    image: srevox/website:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=https://igjmgrdtrveoigepkuau.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    restart: always
\`\`\``
  },
  "connect": {
    title: "Connect a cluster",
    markdown: `### Connect a Kubernetes Cluster

Srevox connects to any standard Kubernetes cluster (EKS, GKE, AKS, Minikube, Kind, or bare-metal):

1. **ServiceAccount Token**: Create a dedicated \`srevox-watcher\` service account.
2. **Kubeconfig**: Or provide a scoped kubeconfig with \`get\`, \`list\`, and \`watch\` permissions on \`pods\` and \`pods/log\`.`
  },
  "agent": {
    title: "Agent installation",
    markdown: `### Agent Installation

Apply the Srevox cluster agent manifest using kubectl:

\`\`\`bash
kubectl apply -f https://raw.githubusercontent.com/Akshatsainiaks/srevox-website/main/srevox-agent.yaml
\`\`\`

Verify deployment status:
\`\`\`bash
kubectl get pods -n srevox-system
\`\`\``
  },
  "agent-yaml": {
    title: "srevox-agent.yaml manifest",
    markdown: `### srevox-agent.yaml Manifest

\`\`\`yaml
apiVersion: v1
kind: Namespace
metadata:
  name: srevox-system
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: srevox-agent
  namespace: srevox-system
spec:
  replicas: 1
  template:
    spec:
      serviceAccountName: srevox-agent-sa
      containers:
      - name: watcher
        image: srevox/agent:latest
\`\`\``
  },
  "kubeconfig": {
    title: "Kubeconfig method",
    markdown: `### Kubeconfig Authentication Method

For non-in-cluster setups, pass a valid \`kubeconfig\` file or base64-encoded string:

\`\`\`bash
export KUBECONFIG=~/.kube/config
srevox-agent --kubeconfig=$KUBECONFIG
\`\`\``
  },
  "rbac": {
    title: "RBAC permissions",
    markdown: `### Cluster RBAC Permissions

Srevox requires minimal read-only permissions:

\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: srevox-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log", "events", "namespaces"]
  verbs: ["get", "list", "watch"]
\`\`\``
  },
  "email": {
    title: "Email / Gmail",
    markdown: `### Email & Gmail Notifications

Configure SMTP credentials to receive incident summary alerts directly in your inbox:

- **SMTP Host**: \`smtp.gmail.com\`
- **SMTP Port**: \`587\` (TLS)
- **Authentication**: App Password`
  },
  "teams": {
    title: "Microsoft Teams",
    markdown: `### Microsoft Teams Webhook

Add an Incoming Webhook connector in your Teams channel and paste the Webhook URL into Srevox Settings.`
  },
  "whatsapp": {
    title: "WhatsApp",
    markdown: `### WhatsApp Alerts

Connect Twilio WhatsApp API or WhatsApp Business Cloud API to dispatch high-priority incident alerts directly to your phone.`
  },
  "webhook": {
    title: "Webhook / Slack",
    markdown: `### Slack & Custom Webhooks

Paste your Slack Incoming Webhook URL to receive interactive crash cards with logs and AI fix suggestions.`
  },
  "rule-create": {
    title: "Creating rules",
    markdown: `### Creating Alert Rules

Define threshold criteria for when notifications should be triggered (e.g. restart count > 3 within 10 minutes).`
  },
  "noise": {
    title: "Noise control",
    markdown: `### Alert Noise Suppression

Configure deduplication windows to prevent alert fatigue when containers repeatedly CrashLoop.`
  },
  "reasons": {
    title: "Crash reasons",
    markdown: `### Supported Container Crash Reasons

- \`CrashLoopBackOff\`
- \`OOMKilled\` (Exit code 137)
- \`ImagePullBackOff\`
- \`ErrImagePull\`
- \`DeadlineExceeded\``
  },
  "ai-overview": {
    title: "Overview",
    markdown: `### AI Diagnosis Overview

Srevox leverages LLMs to turn cryptic stack traces into actionable 1-step remediation steps.`
  },
  "ai-providers": {
    title: "AI providers",
    markdown: `### Supported AI Providers

- **Google Gemini 1.5 Pro / Flash**
- **Anthropic Claude 3.5 Sonnet**
- **OpenAI GPT-4o**
- **Ollama Local LLM** (Offline / Air-Gapped)`
  },
  "ai-local": {
    title: "Local / offline",
    markdown: `### Local Offline AI Setup (Ollama)

Run \`ollama run llama3\` on your cluster or control node to keep log diagnosis 100% private and telemetry-free.`
  },
  "api-auth": {
    title: "Authentication",
    markdown: `### API Authentication

Pass your API token in the \`Authorization\` header:

\`\`\`text
Authorization: Bearer srevox_token_here
\`\`\``
  },
  "api-incidents": {
    title: "Incidents API",
    markdown: `### Incidents Endpoint

- \`GET /api/v1/incidents\`: List recent crash events.
- \`GET /api/v1/incidents/:id\`: Get detailed diagnosis.`
  },
  "api-clusters": {
    title: "Clusters API",
    markdown: `### Clusters Endpoint

- \`GET /api/v1/clusters\`: List connected clusters and health statuses.`
  },
  "k8s-redis": {
    title: "Test via Redis",
    markdown: `### Test Crash via Redis Pod

Deploy a misconfigured Redis pod to verify immediate detection:

\`\`\`bash
kubectl run redis-test --image=redis --command -- redis-server /nonexistent/config.conf
\`\`\``
  },
  "k8s-crash": {
    title: "Simulate pod crash",
    markdown: `### Simulate Container Crash

Force exit a pod to trigger CrashLoopBackOff:

\`\`\`bash
kubectl run crash-pod --image=busybox -- /bin/sh -c "exit 1"
\`\`\``
  },
  "k8s-watcher": {
    title: "Run Go watcher",
    markdown: `### Run Go Watcher Locally

\`\`\`bash
go run cmd/watcher/main.go --kubeconfig=~/.kube/config
\`\`\``
  },
  "k8s-full": {
    title: "Full cluster setup",
    markdown: `### Complete Cluster Deployment Guide

Deploy Srevox Helm chart:

\`\`\`bash
helm repo add srevox https://charts.srevox.dev
helm install srevox srevox/srevox-engine
\`\`\``
  }
};
