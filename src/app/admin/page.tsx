"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/srevox/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Redirecting to Srevox Control Center (/srevox/admin)...</p>
      </div>
    </div>
  );
}
