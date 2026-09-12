"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SrevoxLogo } from "@/components/SrevoxLogo";
import { DocsLink } from "@/components/DocsLink";
import { FeedbackLink } from "@/components/FeedbackLink";
import { getDocsUrl, getFeedbackUrl } from "@/lib/siteUrls";
import { 
  ChevronDown, Database, Activity, Sparkles, ShieldCheck, 
  Layers, GitCommit, Zap, Sun, Moon, Search, Menu, X,
  ArrowRight, ExternalLink, HardDrive, Cpu, Terminal, CheckCircle2
} from "lucide-react";

interface HeaderNavbarProps {
  isLight: boolean;
  onToggleTheme: () => void;
  activeProduct?: "k8s" | "db-auditor" | "docs" | "general";
}

export function HeaderNavbar({ isLight, onToggleTheme, activeProduct = "general" }: HeaderNavbarProps) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setProductsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = [
    { title: "Srevox Kubernetes Crash Detector", category: "Kubernetes Reliability", href: "/", desc: "Sub-5s pod crash detection and AI RCA" },
    { title: "Srevox DB Auditor", category: "Database Security", href: "/db-auditor", desc: "Real-time CDC, PII masking & SHA-256 ledger" },
    { title: "Interactive Incident Console", category: "Demo", href: "/#demo", desc: "Live pod log diagnostics sandbox" },
    { title: "Interactive CDC Row Diff Viewer", category: "Demo", href: "/db-auditor#live-demo", desc: "Interactive database mutation diffing" },
    { title: "30+ Supported Database Engines", category: "Connectors", href: "/db-auditor#engines", desc: "PostgreSQL, MySQL, Mongo, Redis, ClickHouse" },
    { title: "Documentation Hub", category: "Docs", href: getDocsUrl(), desc: "Architecture, setup guides & API reference" },
    { title: "Community Feedback", category: "Support", href: getFeedbackUrl(), desc: "Feature requests & user feedback" }
  ].filter(item => 
    !searchQuery || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${
        isLight 
          ? "bg-white/85 border-slate-200/80 text-slate-800 shadow-sm" 
          : "bg-[#030712]/90 border-slate-800/80 text-white shadow-2xl shadow-sky-950/20"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Identifier */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md group-hover:bg-sky-400/30 transition-all" />
                <SrevoxLogo size={36} className="relative group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-xl tracking-tight ${
                  isLight ? "text-slate-900" : "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
                }`}>
                  Srevox
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider hidden sm:inline-block ${
                  pathname === "/db-auditor" 
                    ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                    : isLight 
                      ? "bg-slate-100 text-slate-600 border-slate-200" 
                      : "bg-slate-800/80 text-slate-400 border-slate-700/80"
                }`}>
                  {pathname === "/db-auditor" ? "DB Auditor" : "Platform"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
              
              {/* Products Mega Menu Button & Popover */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProductsOpen(!productsOpen)}
                  onMouseEnter={() => setProductsOpen(true)}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    productsOpen || pathname === "/db-auditor"
                      ? isLight ? "bg-slate-100 text-sky-600" : "bg-sky-500/15 text-sky-400"
                      : isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span>Products</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
                </button>

                {/* HashiCorp-style Enterprise Mega Menu */}
                {productsOpen && (
                  <div 
                    onMouseLeave={() => setProductsOpen(false)}
                    className={`absolute top-full left-0 mt-2 w-[680px] rounded-2xl border p-5 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-2 z-50 ${
                      isLight 
                        ? "bg-white border-slate-200/90 shadow-slate-300/60 text-slate-800" 
                        : "bg-[#080d1e] border-slate-800/90 shadow-2xl shadow-black/80 text-slate-100"
                    }`}
                  >
                    {/* Featured Top Card */}
                    <div className={`p-4 rounded-xl border mb-5 flex items-center justify-between gap-4 transition-all ${
                      isLight 
                        ? "bg-gradient-to-r from-sky-50 to-indigo-50/50 border-sky-100 hover:border-sky-300" 
                        : "bg-gradient-to-r from-sky-950/40 via-blue-950/20 to-slate-900 border-sky-800/40 hover:border-sky-600/60"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-sky-400">Srevox Self-Hosted Suite</div>
                          <div className={`text-[11px] ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                            100% telemetry-free Kubernetes crash monitoring &amp; database compliance ledger.
                          </div>
                        </div>
                      </div>
                      <DocsLink 
                        onClick={() => setProductsOpen(false)}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 group/link"
                      >
                        <span>Learn more</span>
                        <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </DocsLink>
                    </div>

                    {/* 2-Column Product Categories */}
                    <div className="grid grid-cols-2 gap-6">
                      
                      {/* Column 1: Kubernetes Reliability */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-sky-400" />
                          <span>Kubernetes Reliability &amp; AI</span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                                <Activity className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold text-xs group-hover:text-sky-400 transition-colors ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}>
                                  K8s Crash Detector
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Sub-5s CrashLoopBackOff &amp; OOM alerts
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/#demo"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold text-xs group-hover:text-cyan-400 transition-colors ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}>
                                  AI Diagnostic Engine
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Automated root-cause analysis &amp; fixes
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/#architecture"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold text-xs group-hover:text-indigo-400 transition-colors ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}>
                                  Cluster Watcher
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Direct token &amp; agentless monitoring
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Column 2: Database Security & Compliance */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-sky-400" />
                          <span>Database Security &amp; Compliance</span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/db-auditor"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              pathname === "/db-auditor"
                                ? isLight ? "bg-sky-50 border border-sky-200" : "bg-sky-950/40 border border-sky-800/50"
                                : isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                                <Database className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold text-xs group-hover:text-emerald-400 transition-colors ${
                                    isLight ? "text-slate-900" : "text-white"
                                  }`}>
                                    Srevox DB Auditor
                                  </span>
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    New
                                  </span>
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Real-time CDC streaming &amp; PII masking
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/db-auditor#architecture"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                                <GitCommit className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold text-xs group-hover:text-purple-400 transition-colors ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}>
                                  Cryptographic Ledger
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Tamper-proof SHA-256 hash chains
                                </div>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/db-auditor#engines"
                            onClick={() => setProductsOpen(false)}
                            className={`p-2.5 rounded-xl block transition-all group ${
                              isLight ? "hover:bg-slate-50" : "hover:bg-slate-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                                <HardDrive className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-bold text-xs group-hover:text-amber-400 transition-colors ${
                                  isLight ? "text-slate-900" : "text-white"
                                }`}>
                                  30+ DB Connectors
                                </div>
                                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                  Postgres, MySQL, Mongo, Redis, ClickHouse
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Direct links */}
              <DocsLink 
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                Docs
              </DocsLink>
              <FeedbackLink 
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  pathname === "/feedback"
                    ? "text-sky-400 bg-sky-500/10"
                    : isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                Feedback
              </FeedbackLink>
            </nav>
          </div>

          {/* Right Section: Search ⌘K + Theme Toggle + Deploy CTA */}
          <div className="flex items-center gap-3">
            
            {/* Search ⌘K Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className={`hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isLight 
                  ? "bg-slate-100/90 border-slate-200 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800" 
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search products, docs...</span>
              <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isLight ? "bg-white border-slate-200 text-slate-600" : "bg-slate-800 border-slate-700 text-slate-300"
              }`}>
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" 
                  : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800"
              }`}
              title={`Switch to ${isLight ? "Dark" : "Light"} Theme`}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Deploy Self-Hosted Action */}
            <a
              href="https://github.com/Akshatsainiaks/srevox"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Deploy Self-Hosted</span>
            </a>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border ${
                isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-6 py-5 space-y-4 text-sm font-bold ${
            isLight ? "bg-white border-slate-200" : "bg-[#070c1a] border-slate-800"
          }`}>
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold uppercase text-slate-400 pb-1">Products</div>
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sky-400 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>K8s Crash Detector &amp; AI</span>
              </Link>
              <Link 
                href="/db-auditor" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-emerald-400 flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Srevox DB Auditor (CDC Ledger)</span>
              </Link>
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-3 space-y-2">
              <DocsLink onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-400 hover:text-white">Documentation</DocsLink>
              <FeedbackLink onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-400 hover:text-white">Feedback</FeedbackLink>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette / Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-[#090e1f] border-slate-800 text-slate-100"
          }`}>
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
              <Search className="w-4 h-4 text-sky-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, documentation, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-400"
              />
              <kbd className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => {
                  const isExternal = item.href.startsWith("http");
                  const content = (
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-bold text-xs group-hover:text-sky-400 transition-colors flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSearchModalOpen(false)}
                        className={`p-3 rounded-xl transition-all block group ${
                          isLight ? "hover:bg-slate-100" : "hover:bg-slate-800/80"
                        }`}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setSearchModalOpen(false)}
                      className={`p-3 rounded-xl transition-all block group ${
                        isLight ? "hover:bg-slate-100" : "hover:bg-slate-800/80"
                      }`}
                    >
                      {content}
                    </Link>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No results matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
