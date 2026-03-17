'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Topbar } from '@/components/Topbar';
import { UploadZone } from '@/components/UploadZone';
import { SummaryStats } from '@/components/SummaryStats';
import { RiskMatrix } from '@/components/RiskMatrix';
import { ProjectTable } from '@/components/ProjectTable';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { parseCSV } from '@/lib/csvParser';
import { analyzeProject, generatePortfolioSummary } from '@/lib/gemini';
import { AnalyzedProjectRow, PortfolioSummary } from '@/types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<AnalyzedProjectRow[]>([]);
  const [hasData, setHasData] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | undefined>();
  const [lastAnalyzed, setLastAnalyzed] = useState<string | undefined>();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [isExecSummaryOpen, setIsExecSummaryOpen] = useState(false);

  // Derived state for topbar
  const criticalCount = projects.filter(p => p.riskData?.risk_label === 'Critical').length;
  const highCount = projects.filter(p => p.riskData?.risk_label === 'High').length;
  const mediumCount = projects.filter(p => p.riskData?.risk_label === 'Medium').length;

  const handleFileUpload = async (file: File) => {
    try {
      const parsed = await parseCSV(file);
      const initialProjects: AnalyzedProjectRow[] = parsed.data.map(p => ({
        ...p,
        riskData: null,
      }));
      setProjects(initialProjects);
      setHasData(true);
      setPortfolioSummary(null); // Reset summary
      startAnalysis(initialProjects);
    } catch (error) {
      console.error("CSV Parse Error", error);
      alert("Failed to parse CSV file. Please check the format.");
    }
  };

  const startAnalysis = async (initialProjects: AnalyzedProjectRow[]) => {
    setProgress({ done: 0, total: initialProjects.length });
    
    // Process sequentially or with small concurrency to avoid rate limits
    // Next.js client-side so we map over them and update progressively
    const analyzeQueue = [...initialProjects];
    const resultsMap = new Map<number, NonNullable<AnalyzedProjectRow['riskData']>>();

    for (let i = 0; i < analyzeQueue.length; i++) {
        const row = analyzeQueue[i];
        try {
            const riskData = await analyzeProject(row);
            resultsMap.set(i, riskData);
            
            // Progressive update
            setProjects(prev => {
                const updated = [...prev];
                updated[i].riskData = riskData;
                return updated;
            });
            setProgress(prev => prev ? { ...prev, done: prev.done + 1 } : undefined);
        } catch (error) {
            console.error(`Error analyzing row ${i}`, error);
            setProgress(prev => prev ? { ...prev, done: prev.done + 1 } : undefined);
        }
    }

    setProgress(undefined);
    setLastAnalyzed(new Date().toISOString());
  };

  const handleExecSummaryClick = async () => {
    setIsExecSummaryOpen(true);
    
    // Only generate once if we don't have it (or if data changed, but we reset it on new upload)
    if (!portfolioSummary) {
      const allResults = projects.map(p => p.riskData).filter(Boolean) as NonNullable<AnalyzedProjectRow['riskData']>[];
      if (allResults.length > 0 && !progress) {
          const summary = await generatePortfolioSummary(allResults, projects);
          setPortfolioSummary(summary);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col relative overflow-x-hidden">
      <Topbar 
        dashboardName="Project Risk Radar"
        organization="Apex PMO"
        counts={{ critical: criticalCount, high: highCount, medium: mediumCount }}
        hasData={hasData}
        progress={progress}
        lastAnalyzed={lastAnalyzed}
        onAnalysisClick={handleExecSummaryClick}
      />

      <main className="flex-1 p-6 z-10 w-full max-w-[1600px] mx-auto">
        {!hasData ? (
          <UploadZone onFileSelect={handleFileUpload} />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SummaryStats projects={projects} />
            <RiskMatrix projects={projects} />
            <ProjectTable projects={projects} />
          </div>
        )}
      </main>

      <ExecutiveSummary 
        isOpen={isExecSummaryOpen} 
        onClose={() => setIsExecSummaryOpen(false)}
        summary={portfolioSummary}
      />
    </div>
  );
}
