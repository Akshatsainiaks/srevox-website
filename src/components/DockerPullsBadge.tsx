"use client";
import React, { useState, useEffect } from "react";

// Official Docker SVG Logo Component
export function DockerLogo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-2.257h2.118a.185.185 0 00.186-.186V6.748a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.887c0 .103.083.186.185.186zm0 4.514h2.118a.186.186 0 00.186-.185v-1.887a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-4.514h2.119a.186.186 0 00.186-.186V6.748a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.186v1.887c0 .103.083.186.185.186zm0 4.514h2.119a.186.186 0 00.186-.185v-1.887a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.955-4.514h2.119a.186.186 0 00.186-.186V6.748a.186.186 0 00-.186-.186H5.12a.185.185 0 00-.185.186v1.887c0 .103.083.186.185.186zm0 4.514h2.119a.186.186 0 00.186-.185v-1.887a.186.186 0 00-.186-.186H5.12a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-4.514h2.118a.185.185 0 00.186-.186V6.748a.186.186 0 00-.186-.186H2.166a.185.185 0 00-.185.186v1.887c0 .103.083.186.185.186zm0 4.514h2.118a.186.186 0 00.186-.185v-1.887a.186.186 0 00-.186-.186H2.166a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm0 4.514h2.118a.186.186 0 00.186-.185v-1.887a.186.186 0 00-.186-.186H2.166a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm22.42-3.136c-.347-.234-.997-.378-1.742-.321-.082-.44-.306-.856-.639-1.196a3.522 3.522 0 00-1.851-.976c-.468-.105-.952-.095-1.41.026-.145.039-.286.09-.422.152-.098-.445-.308-.857-.611-1.193a3.504 3.504 0 00-1.73-.979c-.52-.128-1.066-.118-1.577.027a4.015 4.015 0 00-.518.2c-.106-.723-.46-1.385-1.002-1.872a3.916 3.916 0 00-2.316-.921 4.04 4.04 0 00-2.146.425c-.214.103-.418.225-.61.364v-.002a.185.185 0 00-.185.186v.294c0 .102.083.185.185.185h.001c.29-.028.58-.023.868.016.495.066.963.26 1.353.56.39.301.684.7.848 1.155.071.197.112.404.122.613v.018a.186.186 0 00.185.185h.027c.484-.047.973-.004 1.437.126.463.13.886.368 1.229.691.343.323.597.728.738 1.176.054.172.085.351.092.531v.013c0 .103.083.186.185.186h.025c.427-.04.858.006 1.266.136.408.13.778.354 1.077.653.298.298.52.668.647 1.076.046.148.071.302.074.457v.009a.186.186 0 00.186.185h.036c.556-.037 1.112.082 1.603.344.49.261.897.649 1.174 1.12.277.472.417 1.01.403 1.554a3.86 3.86 0 00-.51 1.942c.005.103.088.185.191.185h.01a3.89 3.89 0 002.39-1.025c.677-.611 1.077-1.464 1.117-2.378.04-.914-.305-1.802-.962-2.476z"/>
    </svg>
  );
}

interface DockerPullsBadgeProps {
  variant?: "pill" | "box" | "compact";
  className?: string;
}

export function DockerPullsBadge({ variant = "pill", className = "" }: DockerPullsBadgeProps) {
  // Pulls count from Docker Hub (fetches highest pull count, default 2055)
  const [highestPullCount, setHighestPullCount] = useState<number>(2102);
  const [formattedPulls, setFormattedPulls] = useState("2,102+");

  useEffect(() => {
    // Dynamically fetch pull count from /api/srevox
    const fetchHighestDockerPulls = async () => {
      try {
        const res = await fetch("/api/srevox");
        const token = res.headers.get("x-srevox-v");
        if (token) {
          const val = parseInt(atob(token), 10);
          if (!isNaN(val)) {
            setHighestPullCount(val);
            setFormattedPulls(`${val.toLocaleString()}+`);
          }
        }
      } catch {
        setHighestPullCount(2102);
        setFormattedPulls("2,102+");
      }
    };

    fetchHighestDockerPulls();
  }, []);

  const dockerHubProfileUrl = "https://hub.docker.com/u/akshatsaini08";

  if (variant === "compact") {
    return (
      <a
        href={dockerHubProfileUrl}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all hover:bg-sky-500/15 ${className}`}
        title={`Highest Docker Image Pulls: ${highestPullCount.toLocaleString()}`}
      >
        <DockerLogo size={16} />
        <span>Docker Pulls:</span>
        <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-[11px] font-black tracking-wide text-sky-200">
          {formattedPulls}
        </span>
      </a>
    );
  }

  if (variant === "pill") {
    return (
      <a
        href={dockerHubProfileUrl}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-sky-500/30 hover:border-sky-400/60 text-xs font-bold shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-all hover:scale-[1.02] group ${className}`}
      >
        <div className="flex items-center gap-1.5 text-sky-400">
          <DockerLogo size={16} />
          <span className="text-slate-200 font-extrabold">Docker Pulls</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        <span className="text-sky-300 font-black tracking-wide text-sm">
          {formattedPulls}
        </span>
      </a>
    );
  }

  // Variant: "box" - Displaying strictly only the highest Docker pull count number without image name or tags
  return (
    <a
      href={dockerHubProfileUrl}
      target="_blank"
      rel="noreferrer"
      className={`p-4 rounded-2xl bg-slate-950/90 border border-sky-500/20 shadow-2xl flex items-center justify-between gap-4 hover:border-sky-500/40 transition-all ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
          <DockerLogo size={22} />
        </div>
        <div>
          <div className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Highest Docker Image Pulls</div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{formattedPulls}</span>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Live Stats</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md">
        View on Docker Hub
      </div>
    </a>
  );
}
