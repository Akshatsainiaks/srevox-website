"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SrevoxLogo } from "@/components/SrevoxLogo";
import { DocsLink } from "@/components/DocsLink";
import { FeedbackLink } from "@/components/FeedbackLink";
import { getDocsUrl, getFeedbackUrl } from "@/lib/siteUrls";
import { 
  Activity, Sparkles, Layers, Zap, Sun, Moon, Search, Menu, X,
  ArrowRight, ExternalLink
} from "lucide-react";

interface HeaderNavbarProps {
  isLight: boolean;
  onToggleTheme: () => void;
  activeProduct?: string;
}

export function HeaderNavbar({ isLight, onToggleTheme, activeProduct = "general" }: HeaderNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = [
    { title: "Srevox Kubernetes Crash Detector", category: "Core Platform", href: "/", desc: "Sub-5s pod crash detection and AI RCA" },
    { title: "Interactive Incident Console", category: "Live Demo", href: "/#demo", desc: "Live pod log diagnostics sandbox" },
    { title: "Connection & Monitoring Modes", category: "Architecture", href: "/#architecture", desc: "Cluster Agent, Direct Token, and Kubeconfig" },
    { title: "Quick Setup Guide", category: "Deployment", href: "/#setup", desc: "One-line bash installer and Docker deployment" },
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
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-md group-hover:bg-sky-400/30 transition-all" />
                <SrevoxLogo size={36} className="relative group-hover:scale-105 transition-transform" />
              </div>
              <span className={`font-black text-xl tracking-tight ${
                isLight ? "text-slate-900" : "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
              }`}>
                Srevox
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
              <a 
                href="/#features" 
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                Features
              </a>
              <a 
                href="/#architecture" 
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                Architecture
              </a>
              <a 
                href="/#setup" 
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                Quick Setup
              </a>
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
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sky-400 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                <span>Kubernetes Crash Detector</span>
              </Link>
              <a 
                href="/#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a 
                href="/#architecture" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-300 hover:text-white"
              >
                Architecture
              </a>
              <a 
                href="/#setup" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-300 hover:text-white"
              >
                Quick Setup
              </a>
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
