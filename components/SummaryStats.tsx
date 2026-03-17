import { Card, Metric, Text } from "@tremor/react";
import { FolderKanban, AlertTriangle, CalendarCheck, Activity } from "lucide-react";
import { AnalyzedProjectRow } from "@/types";

interface SummaryStatsProps {
  projects: AnalyzedProjectRow[];
}

export function SummaryStats({ projects }: SummaryStatsProps) {
  const total = projects.length;
  
  const analyzed = projects.filter(p => p.riskData);
  
  const critHighCount = analyzed.filter(
    p => p.riskData?.composite_risk_score !== undefined && p.riskData.composite_risk_score >= 50
  ).length;

  const onScheduleCount = analyzed.filter(
    p => p.riskData?.schedule_risk_score !== undefined && p.riskData.schedule_risk_score < 30
  ).length;

  const avgRisk = analyzed.length > 0
    ? Math.round(analyzed.reduce((sum, p) => sum + (p.riskData?.composite_risk_score || 0), 0) / analyzed.length)
    : 0;

  // color mapping for avg score
  let avgColor = "text-green-400";
  if (avgRisk >= 75) avgColor = "text-red-400";
  else if (avgRisk >= 50) avgColor = "text-orange-400";
  else if (avgRisk >= 25) avgColor = "text-amber-400";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-4 hover:border-white/16 transition-all duration-200">
        <div className="flex items-center space-x-2 text-muted mb-2">
          <FolderKanban className="w-4 h-4" />
          <Text className="text-xs font-semibold uppercase tracking-wider">Total Projects</Text>
        </div>
        <Metric className="text-white font-mono">{total}</Metric>
      </Card>

      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-4 hover:border-white/16 transition-all duration-200">
        <div className="flex items-center space-x-2 text-muted mb-2">
          <AlertTriangle className="w-4 h-4" />
          <Text className="text-xs font-semibold uppercase tracking-wider">Critical + High</Text>
        </div>
        <Metric className="text-red-400 font-mono">{critHighCount}</Metric>
      </Card>

      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-4 hover:border-white/16 transition-all duration-200">
        <div className="flex items-center space-x-2 text-muted mb-2">
          <CalendarCheck className="w-4 h-4" />
          <Text className="text-xs font-semibold uppercase tracking-wider">On Schedule</Text>
        </div>
        <Metric className="text-green-400 font-mono">{onScheduleCount}</Metric>
      </Card>

      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-4 hover:border-white/16 transition-all duration-200">
        <div className="flex items-center space-x-2 text-muted mb-2">
          <Activity className="w-4 h-4" />
          <Text className="text-xs font-semibold uppercase tracking-wider">Avg Risk Score</Text>
        </div>
        <Metric className={`${avgColor} font-mono`}>{analyzed.length > 0 ? avgRisk : '--'}</Metric>
      </Card>
    </div>
  );
}
