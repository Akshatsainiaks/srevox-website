export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface ArchitectureItem {
  step: string;
  title: string;
  description: string;
  detail: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  githubUrl: string;
  docsUrl: string;
  installScriptCmd: string;
  installDockerCmd: string;
  navLinks: NavLink[];
  features: FeatureItem[];
  architectureSteps: ArchitectureItem[];
  faqs: FAQItem[];
}

export const siteConfig: SiteConfig = {
  name: "SREVOX",
  tagline: "Autonomous AI Incident Diagnostics for Kubernetes Workloads",
  description: "Self-hosted, air-gapped root cause analysis engine. Monitor cluster health, catch CrashLoopBackOff events, and receive auto-remediation patches in seconds.",
  githubUrl: "https://github.com/Akshatsainiaks/srevox",
  docsUrl: "/docs",
  installScriptCmd: "curl -sSL https://srevox.dev/install.sh | bash",
  installDockerCmd: "docker run -d -p 3000:3000 --name srevox-engine srevox/srevox:latest",
  navLinks: [
    { label: "Features", href: "#features" },
    { label: "Architecture", href: "#architecture" },
    { label: "Quick Setup", href: "#setup" },
    { label: "Documentation", href: "/docs", external: true },
    { label: "Feedback", href: "/feedback" },
    { label: "FAQ", href: "#faq" }
  ],
  features: [
    {
      id: "realtime-k8s",
      icon: "Activity",
      title: "Real-Time Pod Crash Detection",
      description: "Continuously watches cluster events via Kubernetes Informer APIs. Catches CrashLoopBackOff, OOMKilled, and FailedCreate pods instantly.",
      badge: "Zero-Latency"
    },
    {
      id: "ai-diagnostics",
      icon: "Sparkles",
      title: "AI-Powered Stacktrace Analysis",
      description: "Parses pod logs, stderr traces, and event metadata on-demand to pinpoint root causes without sending data to third-party clouds.",
      badge: "Self-Hosted LLM"
    },
    {
      id: "remediation-patches",
      icon: "Zap",
      title: "Automated YAML Fix Generation",
      description: "Generates ready-to-apply Kubernetes deployment manifests, resource limit patches, and secret/env updates to resolve incidents faster.",
      badge: "One-Click Apply"
    },
    {
      id: "air-gapped-security",
      icon: "ShieldCheck",
      title: "100% Air-Gapped & Private",
      description: "Deployable in strictly isolated VPCs and government clouds. No external telemetry, outbound metrics, or telemetry leaks.",
      badge: "Compliance Ready"
    },
    {
      id: "docker-native",
      icon: "Server",
      title: "Single Docker Container Deploy",
      description: "Spins up in under 30 seconds with zero external database dependencies. SQLite persistence embedded out of the box.",
      badge: "Fast Setup"
    },
    {
      id: "multi-cluster-support",
      icon: "Cpu",
      title: "Multi-Cluster & Namespace Mesh",
      description: "Unifies observability across ASCA, staging, and production clusters with customizable RBAC and namespace scoping.",
      badge: "Multi-Region"
    }
  ],
  architectureSteps: [
    {
      step: "01",
      title: "Informer Event Stream",
      description: "Watches pod status transitions directly via Kube-API stream.",
      detail: "Informer WebSocket Pool",
      icon: "Radio"
    },
    {
      step: "02",
      title: "Log Buffer Parsing",
      description: "Extracts container stderr traces and tail buffers instantly.",
      detail: "Tail Log Collector",
      icon: "Terminal"
    },
    {
      step: "03",
      title: "On-Demand AI Engine",
      description: "Evaluates stack trace against local Srevox LLM diagnostic models.",
      detail: "Private Local LLM",
      icon: "Sparkles"
    },
    {
      step: "04",
      title: "YAML Remediation",
      description: "Outputs validated Kubernetes patch manifests ready to apply.",
      detail: "Manifest Generator",
      icon: "CheckCircle2"
    }
  ],
  faqs: [
    {
      question: "What makes Srevox different from traditional APM tools?",
      answer: "Srevox is 100% self-hosted, lightweight, and focused purely on automated AI incident diagnostics. Instead of overwhelming you with passive charts, Srevox catches pod crashes, analyzes container logs, and delivers executable fix manifests."
    },
    {
      question: "Does Srevox send my Kubernetes logs or metrics outside my network?",
      answer: "No. Srevox operates entirely inside your cluster or VPC. It works fully air-gapped without any phone-home telemetry or third-party cloud data transfer."
    },
    {
      question: "How do I install Srevox on my cluster?",
      answer: "You can deploy Srevox in under a minute using our one-liner shell script or by running our official Docker image: `docker run -d -p 3000:3000 srevox/srevox:latest`."
    },
    {
      question: "Is Srevox open source?",
      answer: "Yes! Srevox is free and open-source software built for DevOps engineers, SREs, and Kubernetes administrators."
    }
  ]
};
