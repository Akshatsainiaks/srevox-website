"use client";
import React, { useState } from "react";
import { 
  AlertTriangle, CheckCircle2, ArrowLeft, Sparkles, Server, Copy, Check, 
  RefreshCw, Trash2, Clock, Tag, Zap, Terminal 
} from "lucide-react";
import { defaultIncidentData, IncidentData } from "@/data/incidentData";

export interface InteractiveIncidentConsoleProps {
  isLight: boolean;
  data?: IncidentData;
}

export function InteractiveIncidentConsole({ isLight, data = defaultIncidentData }: InteractiveIncidentConsoleProps) {
  const [aiStatus, setAiStatus] = useState<"idle" | "running" | "completed">("idle");
  const [statusState, setStatusState] = useState<"open" | "acknowledged" | "resolved">("open");
  const [ackBy, setAckBy] = useState<string>(data.defaultAckBy);
  const [resBy, setResBy] = useState<string>(data.defaultResBy);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [reloadingLogs, setReloadingLogs] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const handleRunAi = () => {
    setAiStatus("running");
    setTimeout(() => {
      setAiStatus("completed");
    }, 700);
  };

  const handleAcknowledge = () => {
    setStatusState("acknowledged");
    setAckBy("admin");
  };

  const handleResolve = () => {
    setStatusState("resolved");
    setResBy("admin");
  };

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(data.containerLogs);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch {}
  };

  const handleReloadLogs = () => {
    setReloadingLogs(true);
    setTimeout(() => setReloadingLogs(false), 500);
  };

  const handleCopyPatch = async () => {
    try {
      await navigator.clipboard.writeText(data.solutionYaml);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    } catch {}
  };

  return (
    <div className="relative max-w-6xl mx-auto group">
      {/* Ambient Backdrop Spotlight Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-cyan-500/20 rounded-3xl blur-2xl transition duration-700 pointer-events-none ${
        isLight ? "opacity-30 group-hover:opacity-50" : "opacity-60 group-hover:opacity-80"
      }`}></div>

      {/* Main Console Window Frame */}
      <div className={`relative rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? "bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50" : "bg-[#060913]/95 border-slate-800/90 text-slate-100 backdrop-blur-2xl"
      }`}>
        {/* Top Window Chrome Header Bar */}
        <div className={`px-5 py-3 border-b flex items-center transition-colors ${
          isLight ? "bg-slate-100/90 border-slate-200/90" : "bg-slate-950/80 border-slate-800/80"
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40"></div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6 text-left">
          {/* Incident Banner & Navigation */}
          <div className={`space-y-3 pb-4 border-b ${isLight ? "border-slate-200/80" : "border-slate-800/80"}`}>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to incidents list</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-500 shadow-sm">
                    {data.severity.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                    statusState === "open"
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-500"
                      : statusState === "acknowledged"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-500"
                        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                  }`}>
                    ● {statusState}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 shadow-sm">
                    CLUSTER: {data.cluster.toUpperCase()}
                  </span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  <span>{data.incidentTitle}</span>
                </h2>
                <div className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Namespace: <span className="text-cyan-500 font-bold">{data.namespace}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {statusState !== "resolved" && (
                  <>
                    {statusState !== "acknowledged" && (
                      <button
                        type="button"
                        onClick={handleAcknowledge}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95 ${
                          isLight
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-800"
                            : "bg-slate-900 hover:bg-slate-800 border-slate-750 text-slate-200"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResolve}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark resolved</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Incident</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Details & AI Diagnosis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Incident Metadata & Labels (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Incident Details Card */}
              <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-950/70 border-slate-800/80"
              }`}>
                <div className={`flex items-center gap-2 text-xs font-extrabold pb-3 border-b ${
                  isLight ? "text-slate-900 border-slate-200" : "text-white border-slate-900"
                }`}>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Incident Details</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Crash Reason</span>
                    <span className="font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">CrashLoopBackOff</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Cluster</span>
                    <span className="font-bold text-indigo-500 flex items-center gap-1.5 font-mono">
                      <Server className="w-3.5 h-3.5" /> {data.cluster}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Restart Count</span>
                    <span className="font-extrabold text-amber-500 font-mono">{data.restartCount}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b font-mono ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={`font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Namespace</span>
                    <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{data.namespace}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b font-mono ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={`font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Container</span>
                    <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{data.container}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b font-mono ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={`font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>Exit Code</span>
                    <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{data.exitCode}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>First Seen</span>
                    <span className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>{data.firstSeen}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Last Seen</span>
                    <span className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>{data.lastSeen}</span>
                  </div>
                  <div className={`flex items-center justify-between pb-2 border-b ${isLight ? "border-slate-200/80" : "border-slate-900"}`}>
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Acknowledged By</span>
                    <span className={`font-mono font-bold ${isLight ? "text-slate-800" : "text-slate-300"}`}>{ackBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isLight ? "text-slate-500" : "text-slate-400"}>Resolved By</span>
                    <span className={`font-mono font-bold ${isLight ? "text-slate-800" : "text-slate-300"}`}>{resBy}</span>
                  </div>
                </div>
              </div>

              {/* Pod Labels Card */}
              <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
                isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-950/70 border-slate-800/80"
              }`}>
                <div className={`flex items-center gap-2 text-xs font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Tag className="w-4 h-4 text-indigo-500" />
                  <span>Pod Labels</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.labels.map((lbl, idx) => (
                    <span key={idx} className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold shadow-sm ${
                      isLight ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-sky-500/10 border-sky-500/20 text-sky-300"
                    }`}>
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Diagnosis Panel (7 cols) */}
            <div className={`lg:col-span-7 p-5 sm:p-6 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm ${
              isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-950/70 border-slate-800/80"
            }`}>
              <div className={`flex items-center justify-between pb-3 border-b ${isLight ? "border-slate-200" : "border-slate-900"}`}>
                <div className={`flex items-center gap-2 text-xs font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span>AI Incident Diagnosis</span>
                </div>

                {/* GREEN BADGE */}
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>diagnosing with logs</span>
                </div>
              </div>

              {/* State Handler */}
              {aiStatus === "idle" && (
                <div className={`py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4 my-auto ${
                  isLight ? "border-slate-200 bg-white" : "border-slate-800/80 bg-slate-900/30"
                }`}>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-7 h-7 animate-pulse text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`font-black text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                      AI-Powered Root Cause Analysis
                    </h4>
                    <p className={`text-xs max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      On-demand Kubernetes log parsing and zero-config automated fix generation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAi}
                    className="mt-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Diagnosis</span>
                  </button>
                </div>
              )}

              {aiStatus === "running" && (
                <div className={`py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 my-auto animate-pulse ${
                  isLight ? "border-slate-200 bg-white" : "border-slate-800/80 bg-slate-900/30"
                }`}>
                  <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
                  <div className="text-xs font-bold text-sky-500">Analyzing container logs with Srevox AI Engine...</div>
                  <div className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Parsing stacktrace & evaluating Redis connection timeout...
                  </div>
                </div>
              )}

              {aiStatus === "completed" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Analysis status: <strong className="text-emerald-500">Complete (0.7s)</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleRunAi}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Re-run diagnosis</span>
                    </button>
                  </div>

                  {/* Output Card */}
                  <div className={`p-4 rounded-xl border space-y-3 text-xs ${
                    isLight ? "bg-white border-slate-200" : "bg-[#03050c] border-slate-800/90"
                  }`}>
                    <div className="space-y-1">
                      <span className="font-extrabold text-sky-500 uppercase tracking-wider text-[10px] block">
                        Root Cause Identified:
                      </span>
                      <p className={`leading-relaxed font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {data.rootCause}
                      </p>
                    </div>

                    <div className={`pt-3 border-t space-y-1.5 ${isLight ? "border-slate-100" : "border-slate-900"}`}>
                      <span className={`font-extrabold uppercase tracking-wider text-[10px] block ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                        Recommended Fix Steps:
                      </span>
                      <ol className={`list-decimal list-inside space-y-1 font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                        {data.fixSteps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className={`pt-3 border-t space-y-2 ${isLight ? "border-slate-100" : "border-slate-900"}`}>
                      <span className={`font-extrabold uppercase tracking-wider text-[10px] block ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                        Remediation Patch Manifest:
                      </span>
                      <pre className={`p-3 rounded-xl border font-mono text-xs overflow-x-auto select-all max-h-32 ${
                        isLight ? "bg-slate-950 text-cyan-300 border-slate-900" : "bg-slate-950 text-cyan-300 border-slate-900"
                      }`}>
                        {data.solutionYaml}
                      </pre>
                      <button
                        type="button"
                        onClick={handleCopyPatch}
                        className="w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md cursor-pointer"
                      >
                        {copiedPatch ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" /> Copied Fix Patch Manifest!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy Recommended Fix Manifest
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Container Logs Panel */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isLight ? "bg-slate-50 border-slate-200/90" : "bg-slate-950/70 border-slate-800/80"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className={`flex items-center gap-2 text-xs font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                <Terminal className="w-4 h-4 text-cyan-500" />
                <span>Container Terminal Logs (<code className={`font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>{data.container}</code>)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLogs ? "Copied Logs!" : "Copy Logs"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReloadLogs}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isLight ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reloadingLogs ? "animate-spin text-sky-500" : ""}`} />
                  <span>Reload Logs</span>
                </button>
              </div>
            </div>

            {/* Terminal Log Box */}
            <div className="relative rounded-xl border border-slate-900 bg-[#03050c] p-4 font-mono text-xs leading-relaxed text-cyan-300 max-h-48 overflow-y-auto custom-scrollbar select-all">
              <pre className="whitespace-pre-wrap">{data.containerLogs}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
