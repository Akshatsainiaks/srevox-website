/**
 * Centralized Multi-Subdomain & Dynamic URL Engine for Srevox
 * 
 * Base Domains:
 * - Production: srevox.in (or NEXT_PUBLIC_BASE_DOMAIN)
 * - Localhost: localhost:3000 / 127.0.0.1
 * 
 * Supports any current & future subdomains automatically:
 * - docs.srevox.in <--> localhost:3000/docs
 * - feedback.srevox.in <--> localhost:3000/feedback
 * - auditor.srevox.in <--> localhost:3000/db-auditor
 * - status.srevox.in <--> localhost:3000/status
 * - Any future subdomain: [name].srevox.in <--> localhost:3000/[name]
 */

export const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "srevox.in";

/**
 * Mapping for subdomains with custom local route paths
 */
export const SUBDOMAIN_ROUTE_MAP: Record<string, string> = {
  docs: "/docs",
  feedback: "/feedback",
  auditor: "/db-auditor",
  status: "/status",
  admin: "/srevox/admin",
};

/**
 * Check if currently executing in a local / development browser or server environment
 */
export function isLocalEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  }
  return process.env.NODE_ENV === "development";
}

/**
 * Universal Subdomain URL Resolver
 * 
 * @param subdomain e.g. "docs", "feedback", "auditor", "status", "app"
 * @param path Optional inner path e.g. "/getting-started"
 * @returns Fully qualified URL for production, or local relative path for localhost
 */
export function getSubdomainUrl(subdomain: string, path: string = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const localBasePath = SUBDOMAIN_ROUTE_MAP[subdomain] || `/${subdomain}`;

  // Custom env override for specific subdomains if needed (e.g. NEXT_PUBLIC_DOCS_URL)
  const envVarName = `NEXT_PUBLIC_${subdomain.toUpperCase()}_URL`;
  if (typeof process !== "undefined" && process.env && process.env[envVarName]) {
    const base = process.env[envVarName]!.replace(/\/$/, "");
    return `${base}${cleanPath}`;
  }

  // Localhost resolution
  if (isLocalEnvironment()) {
    return `${localBasePath}${cleanPath}`;
  }

  // Production subdomain resolution
  return `https://${subdomain}.${BASE_DOMAIN}${cleanPath}`;
}

/**
 * Main site URL resolver
 */
export function getMainSiteUrl(path: string = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (isLocalEnvironment()) {
    return cleanPath || "/";
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${cleanPath}`;
  }
  return `https://${BASE_DOMAIN}${cleanPath}`;
}

/** Helper shortcuts */
export const getDocsUrl = (path: string = "") => getSubdomainUrl("docs", path);
export const getFeedbackUrl = (path: string = "") => getSubdomainUrl("feedback", path);
export const getAuditorUrl = (path: string = "") => getSubdomainUrl("auditor", path);
export const getStatusUrl = (path: string = "") => getSubdomainUrl("status", path);
