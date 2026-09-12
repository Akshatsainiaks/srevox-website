import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Custom route mappings for specific subdomains
const SUBDOMAIN_INTERNAL_PATHS: Record<string, string> = {
  docs: "/docs",
  feedback: "/feedback",
  auditor: "/db-auditor",
  admin: "/srevox/admin",
};

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Strip port from hostname if present (e.g. localhost:3000 -> localhost)
  const currentHost = hostname.split(":")[0].toLowerCase();

  // Exclude static assets, API routes, and Next.js internals
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".") // e.g. favicon.ico, icon.svg, robots.txt, sitemap.xml
  ) {
    return NextResponse.next();
  }

  // Check for Srevox production subdomains (e.g. docs.srevox.in, feedback.srevox.in)
  // Supports *.srevox.in, *.srevox.dev, *.vercel.app preview subdomains
  const baseDomains = ["srevox.in", "srevox.dev", "localhost"];
  
  for (const base of baseDomains) {
    if (currentHost.endsWith(`.${base}`) || (base === "localhost" && currentHost.includes(".localhost"))) {
      const subdomain = currentHost.replace(`.${base}`, "").replace(".localhost", "");
      
      // Ignore "www" as a subdomain
      if (subdomain && subdomain !== "www") {
        const internalPath = SUBDOMAIN_INTERNAL_PATHS[subdomain] || `/${subdomain}`;
        
        // Rewrite root path "/" of subdomain to the target internal section
        if (url.pathname === "/") {
          return NextResponse.rewrite(new URL(internalPath, request.url));
        }
        
        // Rewrite subpaths if not already prefixed
        if (!url.pathname.startsWith(internalPath)) {
          return NextResponse.rewrite(new URL(`${internalPath}${url.pathname}`, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
