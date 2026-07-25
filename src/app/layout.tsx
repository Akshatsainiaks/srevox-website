import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Srevox — Self-Hosted Kubernetes Observability & AI Root-Cause Analysis",
  description: "Detect Kubernetes pod crashes, CrashLoopBackOffs, and node resource bottlenecks in real time with automated AI diagnostics and zero-data-leak self-hosted privacy.",
  keywords: [
    "Kubernetes Observability",
    "K8s Incident Management",
    "Pod Crash Alerting",
    "Self-Hosted Observability",
    "CrashLoopBackOff AI Diagnosis",
    "Datadog Alternative",
    "On-Premises Kubernetes Monitoring"
  ],
  authors: [{ name: "Srevox Core Team", url: "https://srevox.com" }],
  metadataBase: new URL("https://srevox.com"),
  openGraph: {
    title: "Srevox — Self-Hosted Kubernetes Observability & AI Root-Cause Analysis",
    description: "Detect pod crashes instantly with automated AI diagnostics and zero-data-leak privacy. 100% open-source & self-hosted.",
    url: "https://srevox.com",
    siteName: "Srevox",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Srevox — Self-Hosted Kubernetes Observability",
    description: "Zero-data-leak Kubernetes monitoring with instant AI incident root-cause analysis.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Srevox",
  "operatingSystem": "Linux, Kubernetes",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  },
  "description": "Self-hosted Kubernetes monitoring and AI root-cause incident diagnostics platform."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <Script
          id="srevox-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isDocs = window.location.pathname.startsWith('/docs');
                  var key = isDocs ? 'srevox_docs_theme' : 'srevox_main_theme';
                  var saved = localStorage.getItem(key) || 'dark';
                  var resolved = saved;
                  if (saved === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (resolved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.backgroundColor = '#f8fafc';
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.backgroundColor = '#070913';
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
