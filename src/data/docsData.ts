export interface DocItem {
  id: string;
  title: string;
}

export interface DocCategory {
  id: string;
  title: string;
  icon: string;
  items: DocItem[];
}

export const NAV_CATEGORIES: DocCategory[] = [
  { 
    id: "intro", 
    title: "Introduction", 
    icon: "BookOpen", 
    items: [
      { id: "what", title: "What is Srevox?" }, 
      { id: "how", title: "How it works" }, 
      { id: "arch", title: "Architecture" }, 
      { id: "qs", title: "Quick start (5 min)" }, 
      { id: "docker-compose", title: "Docker Compose file" }
    ] 
  },
  { 
    id: "clusters", 
    title: "Clusters", 
    icon: "Server", 
    items: [
      { id: "connect", title: "Connect a cluster" }, 
      { id: "agent", title: "Agent installation" }, 
      { id: "agent-yaml", title: "srevox-agent.yaml manifest" }, 
      { id: "kubeconfig", title: "Kubeconfig method" }, 
      { id: "rbac", title: "RBAC permissions" }
    ] 
  },
  { 
    id: "channels", 
    title: "Alert Channels", 
    icon: "Bell", 
    items: [
      { id: "email", title: "Email / Gmail" }, 
      { id: "teams", title: "Microsoft Teams" }, 
      { id: "whatsapp", title: "WhatsApp" }, 
      { id: "webhook", title: "Webhook / Slack" }
    ] 
  },
  { 
    id: "rules", 
    title: "Alert Rules", 
    icon: "Shield", 
    items: [
      { id: "rule-create", title: "Creating rules" }, 
      { id: "noise", title: "Noise control" }, 
      { id: "reasons", title: "Crash reasons" }
    ] 
  },
  { 
    id: "ai", 
    title: "AI Diagnosis", 
    icon: "Zap", 
    items: [
      { id: "ai-overview", title: "Overview" }, 
      { id: "ai-providers", title: "AI providers" }, 
      { id: "ai-local", title: "Local / offline" }
    ] 
  },
  { 
    id: "api", 
    title: "API Reference", 
    icon: "Code", 
    items: [
      { id: "api-auth", title: "Authentication" }, 
      { id: "api-incidents", title: "Incidents" }, 
      { id: "api-clusters", title: "Clusters" }
    ] 
  },
  { 
    id: "k8s", 
    title: "Testing & K8s", 
    icon: "Terminal", 
    items: [
      { id: "k8s-redis", title: "Test via Redis" }, 
      { id: "k8s-crash", title: "Simulate pod crash" }, 
      { id: "k8s-watcher", title: "Run Go watcher" }, 
      { id: "k8s-full", title: "Full cluster setup" }
    ] 
  }
];

export const ALL_TOC_ITEMS = NAV_CATEGORIES.flatMap(c => c.items);
