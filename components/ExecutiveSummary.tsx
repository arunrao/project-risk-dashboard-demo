import { PortfolioSummary } from "@/types";
import { AlertCircle, ArrowRight, Download, X } from "lucide-react";

interface ExecutiveSummaryProps {
  summary: PortfolioSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveSummary({ summary, isOpen, onClose }: ExecutiveSummaryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1D27] border-t border-white/16 shadow-2xl transition-all duration-300 ease-in-out transform">
      <div className="max-w-7xl mx-auto p-6 md:p-8 relative">
        
        {/* Header Ribbon */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-2 block">
              AI Executive Briefing
            </span>
            <h2 className="font-serif italic text-2xl md:text-3xl text-white">
              {summary ? summary.headline : "Generating briefing..."}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-muted hover:text-white p-2 transition-colors rounded-full hover:bg-white/5"
            aria-label="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Situation */}
            <div className="md:col-span-1">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Portfolio Situation</h3>
              <p className="text-sm text-white/90 leading-relaxed border-l-2 border-white/10 pl-3">
                {summary.situation}
              </p>
            </div>

            {/* Top Risks */}
            <div className="md:col-span-1">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                Top Risk Drivers
              </h3>
              <ul className="space-y-2">
                {summary.top_risks.map((risk, i) => (
                  <li key={i} className="text-sm text-white/80 flex items-start">
                    <span className="text-red-500 mr-2 mt-0.5">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="md:col-span-1">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-blue-400" />
                Recommended Actions
              </h3>
              <ul className="space-y-2">
                {summary.recommended_actions.map((action, i) => (
                  <li key={i} className="text-sm text-white/80 flex items-start">
                    <span className="text-blue-500 mr-2 mt-0.5">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-muted font-mono text-sm animate-pulse">
            Analyzing portfolio parameters...
          </div>
        )}

        {/* Bottom Line / Callout */}
        {summary && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/8">
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-3 rounded-lg flex-1">
              <strong className="text-red-400 mr-2">The Bottom Line:</strong>
              {summary.bottom_line}
            </div>
            
            <button 
              onClick={() => window.print()}
              className="shrink-0 flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download as PDF</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
