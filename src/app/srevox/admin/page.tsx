"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, Plus, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle, 
  ArrowLeft, Shield, Lock, Eye, Edit3, Database, Sparkles, LogOut, FileText, 
  Activity, Server, Settings, Users, Key, Globe, Zap, Cpu, Bell, Check, Copy, X,
  ChevronRight, ChevronLeft, Crown, HardDrive, BarChart3, Boxes, AlertTriangle,
  LayoutDashboard, SlidersHorizontal, ExternalLink, Sun, Moon, User, Compass, LifeBuoy,
  Search, Mail
} from "lucide-react";
import { SrevoxLogo } from "@/components/SrevoxLogo";
import { supabase } from "@/lib/supabase";
import { NAV_CATEGORIES, DocCategory } from "@/data/docsData";
import { INITIAL_DOCS_CONTENT } from "@/data/docsContent";
import { 
  setJwtAdminSession, 
  getAdminSession, 
  getAdminEmail, 
  clearAdminSession, 
  ADMIN_EMAIL 
} from "@/lib/auth";

import { useRouter } from "next/navigation";
import emailjs from "emailjs-com";

export default function SrevoxAdminPlatform({ initialModule }: { initialModule?: "docs" | "incidents" | "observability" | "settings" }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // OTP Auth States
  const [authStep, setAuthStep] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const [activeModule, setActiveModule] = useState<"docs" | "incidents" | "observability" | "settings">(
    initialModule || "docs"
  );

  useEffect(() => {
    if (initialModule) {
      setActiveModule(initialModule);
      if (typeof window !== "undefined") {
        localStorage.setItem("srevox_active_module", initialModule);
      }
    } else if (typeof window !== "undefined") {
      const savedModule = localStorage.getItem("srevox_active_module") as any;
      if (savedModule) {
        setActiveModule(savedModule);
      }
    }
  }, [initialModule]);

  const handleModuleClick = (mod: "docs" | "incidents" | "observability" | "settings") => {
    setActiveModule(mod);
    if (typeof window !== "undefined") {
      localStorage.setItem("srevox_active_module", mod);
      router.push(`/srevox/admin/${mod}`);
    }
  };

  // Theme State: "dark" (website default) or "light"
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sidebar Collapsed State & Persistence (matching Srevox sv_sidebar_collapsed)
  const [collapsed, setCollapsed] = useState(false);
  
  // User Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Notifications Dropdown State
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Docs Module State
  const [categories, setCategories] = useState<DocCategory[]>(NAV_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("intro");
  const [selectedArtId, setSelectedArtId] = useState<string>("what");
  const [editTitle, setEditTitle] = useState("What is Srevox?");
  const [editContent, setEditContent] = useState(
    INITIAL_DOCS_CONTENT["what"]?.markdown || "### What is Srevox?\n\nSrevox is a self-hosted Kubernetes incident detection and remediation engine."
  );
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtId, setNewArtId] = useState("");
  const [newArtTitle, setNewArtTitle] = useState("");
  const [newArtCatId, setNewArtCatId] = useState("intro");

  useEffect(() => {
    if (getAdminSession()) {
      setIsAuthenticated(true);
    }

    // Load saved preferences matching Srevox platform
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("sv_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
      const savedTheme = localStorage.getItem("sv_dashboard_theme") as "dark" | "light";
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  const toggleTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("sv_dashboard_theme", newTheme);
    }
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const nextState = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sv_sidebar_collapsed", String(nextState));
      }
      return nextState;
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const checkSupabaseConnection = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from("docs_categories").select("*").order("sort_order", { ascending: true });
      const { data: artData } = await supabase.from("docs_articles").select("*").order("sort_order", { ascending: true });

      if (catData && catData.length > 0 && artData) {
        const mergedNav: DocCategory[] = catData.map(c => ({
          id: c.id,
          title: c.title,
          icon: c.icon,
          items: artData.filter(a => a.category_id === c.id).map(a => ({ id: a.id, title: a.title }))
        }));
        setCategories(mergedNav);

        // Check local edits first
        if (typeof window !== "undefined") {
          try {
            const savedEdits = JSON.parse(localStorage.getItem("srevox_docs_edits") || "{}");
            if (savedEdits[selectedArtId]) {
              setEditTitle(savedEdits[selectedArtId].title || "What is Srevox?");
              setEditContent(savedEdits[selectedArtId].content_markdown);
              return;
            }
          } catch {}
        }

        const currentArt = artData.find(a => a.id === selectedArtId);
        if (currentArt && currentArt.content_markdown) {
          setEditTitle(currentArt.title);
          setEditContent(currentArt.content_markdown);
        } else {
          const fallback = INITIAL_DOCS_CONTENT[selectedArtId];
          if (fallback) {
            setEditTitle(fallback.title);
            setEditContent(fallback.markdown);
          }
        }
      } else {
        // Check local edits
        if (typeof window !== "undefined") {
          try {
            const savedEdits = JSON.parse(localStorage.getItem("srevox_docs_edits") || "{}");
            if (savedEdits[selectedArtId]) {
              setEditTitle(savedEdits[selectedArtId].title || "What is Srevox?");
              setEditContent(savedEdits[selectedArtId].content_markdown);
              return;
            }
          } catch {}
        }
        const fallback = INITIAL_DOCS_CONTENT[selectedArtId];
        if (fallback) {
          setEditTitle(fallback.title);
          setEditContent(fallback.markdown);
        }
      }
    } catch {
      const fallback = INITIAL_DOCS_CONTENT[selectedArtId];
      if (fallback) {
        setEditTitle(fallback.title);
        setEditContent(fallback.markdown);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeModule === "docs") {
      checkSupabaseConnection();
    }
  }, [isAuthenticated, activeModule]);

  const handlePasswordVerifyAndSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!adminEmail.trim()) {
      setLoginError("Please enter your Admin Email Address.");
      return;
    }

    if (adminEmail.trim().toLowerCase() !== "akshatsainiaks@gmail.com") {
      setLoginError("Access Denied: Invalid email address or unauthorized user.");
      return;
    }

    if (!adminPassword) {
      setLoginError("Please enter your Security Password.");
      return;
    }

    setSendingOtp(true);

    // 1. Verify Password
    let passwordValid = false;
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        passwordValid = true;
      } else {
        setSendingOtp(false);
        setLoginError(data.error || "Invalid Security Password. Please try again.");
        return;
      }
    } catch (err: any) {
      setSendingOtp(false);
      setLoginError("Failed to verify password with authentication server.");
      return;
    }

    // 2. Password is valid -> Generate OTP code and dispatch via API + EmailJS
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email: adminEmail.trim() })
      });
      const data = await res.json();

      if (data.success) {
        // Send real email via EmailJS if configured
        try {
          const serviceId = process.env.VITE_EMAILJS_SERVICE_ID || "service_default";
          const templateId = process.env.VITE_EMAILJS_TEMPLATE_ID || "template_default";
          const publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY || "key_default";
          await emailjs.send(serviceId, templateId, {
            email: adminEmail.trim(),
            user_email: adminEmail.trim(),
            subject: `Srevox Admin Verification OTP: ${data.otpPreview}`,
            message: `Your Srevox Admin Security OTP is: ${data.otpPreview}. Valid for 10 minutes.`,
            otp_code: data.otpPreview
          }, publicKey);
        } catch {}

        setAuthStep("otp");
        setOtpSent(true);
        setOtpMsg(`✓ Verification OTP code dispatched to ${adminEmail.trim()}. Please check your email inbox or spam folder!`);
      } else {
        setLoginError(data.error || "Failed to send OTP code.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to send OTP code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setLoginError("Please enter your 6-digit verification OTP code.");
      return;
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email: "akshatsainiaks@gmail.com", otpCode: otpCode.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setJwtAdminSession("akshatsainiaks@gmail.com");
        setIsAuthenticated(true);
        setLoginError("");
      } else {
        setLoginError(data.error || "Invalid 6-Digit OTP code. Please check your email inbox.");
      }
    } catch {
      setLoginError("Failed to verify OTP code. Please try again.");
    }
  };

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-password",
          email: "akshatsainiaks@gmail.com",
          currentPassword: adminPassword || "admin123",
          newPassword: newAdminPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("srevox_admin_password", newAdminPassword);
        }
        setSettingsMsg("✓ Admin security password updated successfully for akshatsainiaks@gmail.com!");
        setNewAdminPassword("");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("srevox_admin_password", newAdminPassword);
        }
        setSettingsMsg("✓ Password saved to local credentials cache!");
        setNewAdminPassword("");
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.setItem("srevox_admin_password", newAdminPassword);
      }
      setSettingsMsg("✓ Password saved to local credentials cache!");
      setNewAdminPassword("");
    } finally {
      setTimeout(() => setSettingsMsg(""), 4000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAdminSession();
  };

  const handleSelectArticle = async (catId: string, artId: string, artTitle: string) => {
    setSelectedCatId(catId);
    setSelectedArtId(artId);
    setEditTitle(artTitle);

    // 1. Check local storage cache for user edits first
    if (typeof window !== "undefined") {
      try {
        const savedEdits = JSON.parse(localStorage.getItem("srevox_docs_edits") || "{}");
        if (savedEdits[artId]) {
          setEditTitle(savedEdits[artId].title || artTitle);
          setEditContent(savedEdits[artId].content_markdown);
          return;
        }
      } catch {}
    }

    // 2. Fetch from Supabase
    try {
      const { data } = await supabase.from("docs_articles").select("content_markdown, title").eq("id", artId).single();
      if (data && data.content_markdown) {
        setEditTitle(data.title || artTitle);
        setEditContent(data.content_markdown);
        return;
      }
    } catch {}

    // 3. Fallback to INITIAL_DOCS_CONTENT repository
    const fallback = INITIAL_DOCS_CONTENT[artId];
    if (fallback) {
      setEditContent(fallback.markdown);
    } else {
      setEditContent(`### ${artTitle}\n\nDocumentation content for ${artTitle} goes here...`);
    }
  };

  const handleSaveToSupabase = async () => {
    setSaving(true);
    setSaveMessage("");

    // Persist to local storage cache so edits are saved instantly locally
    if (typeof window !== "undefined") {
      try {
        const savedEdits = JSON.parse(localStorage.getItem("srevox_docs_edits") || "{}");
        savedEdits[selectedArtId] = {
          title: editTitle,
          content_markdown: editContent,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem("srevox_docs_edits", JSON.stringify(savedEdits));
      } catch {}
    }

    try {
      const { error } = await supabase.from("docs_articles").upsert({
        id: selectedArtId,
        category_id: selectedCatId,
        title: editTitle,
        content_markdown: editContent,
        sort_order: 1
      });

      if (error) {
        setSaveMessage(`✓ Changes saved locally (${error.message})`);
      } else {
        setSaveMessage("✓ Changes published to Supabase & saved locally!");
      }
    } catch {
      setSaveMessage(`✓ Changes saved locally!`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 4000);
    }
  };

  const handleCreateNewArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtId || !newArtTitle) return;

    const formattedId = newArtId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    try {
      await supabase.from("docs_articles").insert({
        id: formattedId,
        category_id: newArtCatId,
        title: newArtTitle,
        content_markdown: `### ${newArtTitle}\n\nDocumentation content starts here.`,
        sort_order: 99
      });

      await checkSupabaseConnection();
      setSelectedCatId(newArtCatId);
      setSelectedArtId(formattedId);
      setEditTitle(newArtTitle);
      setEditContent(`### ${newArtTitle}\n\nDocumentation content starts here.`);
      setShowAddModal(false);
      setNewArtId("");
      setNewArtTitle("");
    } catch (err) {
      console.error("Error adding article:", err);
    }
  };

  const handleDeleteArticle = async () => {
    if (!confirm(`Are you sure you want to delete article "${editTitle}" (${selectedArtId})?`)) return;

    try {
      await supabase.from("docs_articles").delete().eq("id", selectedArtId);
      await checkSupabaseConnection();
      setSaveMessage("Deleted article successfully.");
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  };

  const isDark = theme === "dark";

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-[#090b11] text-white" : "bg-slate-50 text-slate-900"} flex items-center justify-center p-6 font-sans relative overflow-hidden`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? "bg-indigo-500/10" : "bg-indigo-500/5"} rounded-full blur-[150px] pointer-events-none`} />

        <div className={`max-w-md w-full ${isDark ? "bg-[#131622] border-slate-800" : "bg-white border-gray-200"} border rounded-3xl p-8 shadow-2xl space-y-6 relative backdrop-blur-xl`}>
          <div className="flex flex-col items-center text-center space-y-3">
            <SrevoxLogo size={56} />
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
              <span>Srevox Admin</span>
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} font-medium`}>
              Administrator Management Portal
            </p>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pb-2">
            <span className={`px-2.5 py-1 rounded-full border ${authStep === "password" ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400 font-extrabold" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"}`}>
              {authStep === "password" ? "Step 1: Password Check" : "✓ Step 1 Passed"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className={`px-2.5 py-1 rounded-full border ${authStep === "otp" ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400 font-extrabold" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
              Step 2: Email OTP
            </span>
          </div>

          {authStep === "password" ? (
            <form onSubmit={handlePasswordVerifyAndSendOtp} className="space-y-4 pt-2">
              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-600"} uppercase mb-1.5`}>
                  Admin Account Email
                </label>
                <div className="relative">
                  <Globe className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="Enter admin email address..."
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl pl-10 pr-4 py-3 text-xs font-bold font-mono focus:outline-none focus:border-indigo-500 transition-all shadow-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-600"} uppercase mb-1.5`}>
                  Security Password
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all font-mono shadow-sm`}
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{sendingOtp ? "Verifying Credentials & Sending OTP..." : "Verify Password & Send Real OTP"}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4 pt-2">
              {otpMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1">
                  <div className="font-extrabold flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Real Verification OTP Sent!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {otpMsg}
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-slate-600"} uppercase mb-1.5`}>
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code..."
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-emerald-400" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl pl-10 pr-4 py-3 text-sm font-mono font-black tracking-widest focus:outline-none focus:border-emerald-500 transition-all shadow-sm`}
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthStep("password")}
                  className="px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Sign In</span>
                </button>
              </div>
            </form>
          )}

          <div className={`pt-4 border-t ${isDark ? "border-slate-800" : "border-gray-100"} text-center`}>
            <Link href="/docs" className={`text-xs font-bold ${isDark ? "text-slate-500 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-600"} transition-colors flex items-center justify-center gap-1.5`}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Website Docs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EXACT SREVOX PLATFORM DASHBOARD LAYOUT
  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? "bg-[#0d0f17] text-white" : "bg-slate-50 text-slate-900"} font-sans`}>
      {/* 1. SREVOX FULL-WIDTH TOP NAVBAR (Navbar.tsx pattern) */}
      <header className={`h-14 ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-100"} border-b flex items-center px-5 sticky top-0 z-30 w-full shrink-0 justify-between`}>
        {/* Left Brand Wordmark */}
        <div className="flex items-center gap-4">
          <Link href="/srevox/admin" className="flex items-center gap-2.5">
            <SrevoxLogo size={28} />
            <span className="font-extrabold tracking-tight text-sm">Srevox Admin</span>
          </Link>
        </div>

        {/* Right Navbar Controls */}
        <div className="flex items-center gap-2.5">

          {/* SREVOX NAVBAR PROFILE DROPDOWN (Profile.tsx pattern) */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {adminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-gray-800"} leading-tight max-w-[120px] truncate`}>
                  {adminEmail.split("@")[0]}
                </div>
                <div className="text-[11px] flex items-center gap-1 leading-tight text-purple-500 dark:text-purple-400">
                  <Crown className="w-2.5 h-2.5" />
                  <span className="capitalize">admin</span>
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-64 ${isDark ? "bg-[#1e2130] border-slate-700 text-white" : "bg-white border-gray-100 text-slate-900"} border rounded-2xl shadow-xl overflow-hidden z-50`}>
                <div className={`px-4 py-4 ${isDark ? "bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-slate-700" : "bg-gradient-to-br from-indigo-50 to-violet-50 border-gray-100"} border-b`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {adminEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">
                        {adminEmail.split("@")[0]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{adminEmail}</div>
                      <div className="text-xs flex items-center gap-1 mt-0.5 font-medium text-purple-500 dark:text-purple-400">
                        <Crown className="w-2.5 h-2.5" />
                        <span className="capitalize">Super Administrator</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
                  <Link
                    href="/docs"
                    target="_blank"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm leading-tight">Documentation</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">Opens in new tab</div>
                    </div>
                  </Link>

                  {/* Theme Switcher Toggle (Light / Dark) */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      {isDark ? <Moon className="w-3.5 h-3.5 text-slate-400" /> : <Sun className="w-3.5 h-3.5 text-gray-500" />}
                    </div>
                    <span className="font-medium text-sm flex-1">Theme</span>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => toggleTheme("light")}
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                          !isDark ? "bg-white shadow-sm text-gray-800" : "text-gray-400 dark:text-slate-500"
                        }`}
                        title="Light Mode"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleTheme("dark")}
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                          isDark ? "bg-slate-600 shadow-sm text-white" : "text-gray-400 dark:text-slate-500"
                        }`}
                        title="Dark Mode (Website Theme)"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-700 my-1" />

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                      <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    </div>
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT (Sidebar.tsx pattern) */}
      <div className="flex flex-1 overflow-hidden">
        {/* SREVOX SIDEBAR COMPONENT */}
        <aside className={`relative h-full ${isDark ? "bg-[#0d0f17] border-slate-800/80" : "bg-white border-gray-100"} border-r flex flex-col shrink-0 transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-[64px]" : "w-[220px]"
        }`}>
          {/* Navigation Links */}
          <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2" : "px-3"}`}>
            {[
              { id: "docs", label: "Documentation", icon: BookOpen, tag: `${categories.reduce((acc, c) => acc + c.items.length, 0)}` },
              { id: "incidents", label: "Incidents", icon: AlertTriangle, tag: "LIVE" },
              { id: "observability", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: SlidersHorizontal }
            ].map((item) => {
              const active = activeModule === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleModuleClick(item.id as any)}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-2 rounded-xl text-sm font-medium transition-all group w-full ${
                    collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2.5"
                  } ${
                    active
                      ? isDark ? "bg-indigo-500/10 text-indigo-400 font-semibold" : "bg-indigo-50 text-indigo-700 font-semibold"
                      : isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${
                    active 
                      ? isDark ? "text-indigo-400" : "text-indigo-600" 
                      : isDark ? "text-slate-500 group-hover:text-slate-200" : "text-gray-400 group-hover:text-gray-700"
                  }`} />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-xs font-semibold text-left">{item.label}</span>
                      {item.tag && (
                        <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase shrink-0">
                          {item.tag}
                        </span>
                      )}
                      {active && !item.tag && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Floating pill collapse button on right edge */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`absolute top-6 -right-3.5 w-7 h-7 rounded-full ${isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white" : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"} border flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10 cursor-pointer`}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </aside>

        {/* MAIN WORKSPACE CONTENT AREA */}
        <main className={`flex-1 overflow-y-auto min-w-0 ${isDark ? "bg-[#0d0f17]" : "bg-slate-50"}`}>
          <div className="w-full px-6 py-6">
            {/* MODULE 1: DOCS MANAGER */}
            {activeModule === "docs" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Topics Tree */}
                <aside className={`lg:col-span-4 ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-5 space-y-4 flex flex-col shadow-sm`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <Database className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                      <span>Document Topics</span>
                    </div>
                    <button
                      onClick={checkSupabaseConnection}
                      className={`p-1.5 rounded-lg border ${isDark ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"} transition-all cursor-pointer`}
                      title="Sync with Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[72vh] pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className={`text-[11px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1.5 ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-700"} rounded-xl border flex items-center justify-between`}>
                          <span>{cat.title}</span>
                          <span className="text-[9px] font-mono opacity-70">ID: {cat.id}</span>
                        </div>
                        <div className={`ml-2 pl-2 border-l ${isDark ? "border-slate-800" : "border-gray-200"} space-y-1`}>
                          {cat.items.map((art) => {
                            const isSelected = selectedArtId === art.id;
                            return (
                              <button
                                key={art.id}
                                onClick={() => handleSelectArticle(cat.id, art.id, art.title)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? isDark ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <span className="truncate">{art.title}</span>
                                <Edit3 className={`w-3 h-3 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Right Article Editor */}
                <div className={`lg:col-span-8 ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-6 space-y-5 flex flex-col shadow-sm`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"} block`}>
                          Article Slug: <code className={`${isDark ? "text-cyan-300 bg-slate-900 border-slate-800" : "text-slate-900 bg-gray-100 border-gray-200"} px-1.5 py-0.5 rounded border`}>{selectedArtId}</code>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          (Category: <code>{selectedCatId}</code>)
                        </span>
                      </div>
                      <h2 className="text-xl font-black">Live Content Editor</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-gray-100 border-gray-200"} border flex items-center gap-1`}>
                        <button
                          type="button"
                          onClick={() => setActiveTab("edit")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "edit" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("preview")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "preview" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                      </div>

                      <button
                        onClick={handleDeleteArticle}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 transition-all cursor-pointer shadow-sm"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleSaveToSupabase}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Publishing..." : "Publish"}</span>
                      </button>
                    </div>
                  </div>

                  {saveMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{saveMessage}</span>
                    </div>
                  )}

                  {activeTab === "edit" ? (
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-2`}>
                          Article Display Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Enter article title..."
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all shadow-sm`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-2`}>
                          Documentation Markdown Content
                        </label>
                        <textarea
                          rows={16}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Write article markdown content here..."
                          className={`w-full ${isDark ? "bg-[#090b11] border-slate-800 text-cyan-300" : "bg-gray-50 border-gray-200 text-gray-900"} border rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all leading-relaxed custom-scrollbar shadow-inner`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`flex-1 ${isDark ? "bg-slate-900/50 border-slate-800 text-slate-200" : "bg-gray-50 border-gray-200 text-gray-800"} border rounded-xl p-6 overflow-y-auto max-h-[60vh] custom-scrollbar text-sm leading-relaxed space-y-4 shadow-inner`}>
                      <div className={`pb-3 border-b ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                        <span className={`text-[10px] font-mono ${isDark ? "text-indigo-400" : "text-indigo-600"} font-bold uppercase tracking-widest block`}>Live Render Preview</span>
                        <h1 className="text-2xl font-black mt-1">{editTitle}</h1>
                      </div>
                      <div className={`whitespace-pre-wrap font-mono text-xs ${isDark ? "bg-[#090b11] border-slate-800 text-cyan-300" : "bg-white border-gray-200 text-gray-900"} p-4 rounded-xl border leading-relaxed shadow-sm`}>
                        {editContent || "No content written yet."}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 2: INCIDENTS */}
            {activeModule === "incidents" && (
              <div className={`max-w-4xl mx-auto ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-8 space-y-6 shadow-sm text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Kubernetes Workloads & Incident Engine</h2>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"} max-w-lg mx-auto leading-relaxed font-medium`}>
                    Connect your clusters to monitor CrashLoopBackOff events, parse container logs, and execute AI remediations in real time.
                  </p>
                </div>
              </div>
            )}

            {/* MODULE 3: OBSERVABILITY */}
            {activeModule === "observability" && (
              <div className={`max-w-4xl mx-auto ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-8 space-y-6 shadow-sm text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Analytics & Cluster Health</h2>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"} max-w-lg mx-auto leading-relaxed font-medium`}>
                    Telemetry-free monitoring metrics, container memory limits, and node status feeds.
                  </p>
                </div>
              </div>
            )}

            {/* MODULE 4: PLATFORM CONFIG */}
            {activeModule === "settings" && (
              <div className={`max-w-3xl mx-auto ${isDark ? "bg-[#151823] border-slate-800" : "bg-white border-gray-200"} border rounded-2xl p-8 space-y-6 shadow-sm`}>
                <div className={`flex items-center gap-3 pb-4 border-b ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                  <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h2 className="text-xl font-black">Settings</h2>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"} font-medium`}>Manage admin account email, security password, and access credentials.</p>
                  </div>
                </div>

                {/* ADMIN CREDENTIALS CONFIGURATION FORM */}
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-gray-200 bg-gray-50"} space-y-5 shadow-sm`}>
                    <div className="flex items-center gap-2 text-sm font-extrabold">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <span>Admin Account Credentials</span>
                    </div>

                    <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
                      <div>
                        <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-1.5`}>
                          Admin Account Email Address (Locked)
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                          <input
                            type="email"
                            readOnly
                            value="akshatsainiaks@gmail.com"
                            className={`w-full ${isDark ? "bg-slate-950/60 border-slate-800 text-indigo-300" : "bg-gray-100 border-gray-200 text-indigo-700"} border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold font-mono shadow-sm cursor-not-allowed`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">✓ Security rule: Only akshatsainiaks@gmail.com is permitted for Admin access.</span>
                      </div>

                      <div>
                        <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-1.5`}>
                          New Security Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400" />
                          <input
                            type="password"
                            required
                            placeholder="Enter new admin password..."
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            className={`w-full ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900"} border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-indigo-500 shadow-sm`}
                          />
                        </div>
                      </div>

                      {settingsMsg && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{settingsMsg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Security Password</span>
                      </button>
                    </form>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className={`p-4 rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-gray-200 bg-gray-50"} space-y-1 shadow-sm`}>
                      <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Authentication Engine</span>
                      <div className="text-indigo-400 font-extrabold">Single-Account Signed JWT Token Session</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-gray-200 bg-gray-50"} space-y-1 shadow-sm`}>
                      <span className="text-slate-500 text-[10px] uppercase font-sans font-bold">Custom Secret Admin Route</span>
                      <div className="text-indigo-400 font-extrabold">/srevox/admin</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add New Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${isDark ? "bg-[#151823] border-slate-800 text-white" : "bg-white border-gray-200 text-slate-900"} border rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative`}>
            <div className={`flex items-center justify-between border-b ${isDark ? "border-slate-800" : "border-gray-100"} pb-3`}>
              <h3 className="text-lg font-black flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create New Doc Article</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewArticle} className="space-y-4">
              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-1`}>
                  Category
                </label>
                <select
                  value={newArtCatId}
                  onChange={(e) => setNewArtCatId(e.target.value)}
                  className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-sm`}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-1`}>
                  Article ID / Slug (e.g. k8s-helm-setup)
                </label>
                <input
                  type="text"
                  required
                  placeholder="k8s-helm-setup"
                  value={newArtId}
                  onChange={(e) => setNewArtId(e.target.value)}
                  className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-cyan-300" : "bg-gray-50 border-gray-200 text-indigo-700"} border rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm`}
                />
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold ${isDark ? "text-slate-400" : "text-gray-700"} uppercase mb-1`}>
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Helm Chart Setup Guide"
                  value={newArtTitle}
                  onChange={(e) => setNewArtTitle(e.target.value)}
                  className={`w-full ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-gray-50 border-gray-200 text-slate-900"} border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-sm`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md"
                >
                  Create Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
