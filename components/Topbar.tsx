import { ProgressBar } from "@tremor/react";

interface TopbarProps {
  dashboardName: string;
  organization: string;
  counts: {
    critical: number;
    high: number;
    medium: number;
  };
  lastAnalyzed?: string;
  onAnalysisClick: () => void;
  progress?: { done: number; total: number };
  hasData: boolean;
}

export function Topbar({
  dashboardName,
  organization,
  counts,
  lastAnalyzed,
  onAnalysisClick,
  progress,
  hasData,
}: TopbarProps) {
  return (
    <header className="h-14 w-full bg-[#0F1117] border-b border-white/8 flex items-center justify-between px-6 shrink-0 relative z-10">
      {/* Left */}
      <div className="flex flex-col justify-center">
        <h1 className="text-white font-semibold text-sm leading-tight tracking-tight">
          {dashboardName || "Project Risk Radar"}
        </h1>
        <span className="text-muted text-xs font-medium leading-tight">
          {organization || "Apex PMO"}
        </span>
      </div>

      {/* Center - Pulse Badges (Hide on small screens) */}
      {hasData && !progress && (
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-500 font-mono font-medium">{counts.critical} CRITICAL</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-xs text-orange-500 font-mono font-medium">{counts.high} HIGH</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs text-amber-500 font-mono font-medium">{counts.medium} MEDIUM</span>
          </div>
        </div>
      )}
      
      {/* Center - Progress */}
      {progress && progress.total > 0 && (
        <div className="hidden md:flex flex-col items-center w-64">
           <span className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">
             Analyzing {progress.done} / {progress.total}
           </span>
           <ProgressBar value={(progress.done / progress.total) * 100} color="blue" className="mt-1" />
        </div>
      )}

      {/* Right */}
      <div className="flex items-center space-x-4">
        {hasData && (
          <span className="hidden sm:inline text-xs text-muted font-mono">
            UPDATED: {lastAnalyzed ? new Date(lastAnalyzed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
          </span>
        )}
        <button
          onClick={onAnalysisClick}
          disabled={!hasData || !!progress}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors shadow-sm"
        >
          Executive Summary
        </button>
      </div>
    </header>
  );
}
