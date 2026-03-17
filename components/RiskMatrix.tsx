import { Card, Title, BarChart, ScatterChart } from "@tremor/react";
import { AnalyzedProjectRow, RiskResult } from "@/types";

interface RiskMatrixProps {
  projects: AnalyzedProjectRow[];
}

export function RiskMatrix({ projects }: RiskMatrixProps) {
  const analyzed = projects.filter(p => p.riskData) as (AnalyzedProjectRow & { riskData: RiskResult })[];
  
  // Data for BarChart (Distribution)
  const dist = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  analyzed.forEach(p => {
    dist[p.riskData.risk_label]++;
  });

  const barData = [
    { name: "Critical", Count: dist.Critical },
    { name: "High", Count: dist.High },
    { name: "Medium", Count: dist.Medium },
    { name: "Low", Count: dist.Low }
  ];

  // Custom colors for tremor bar chart array
  const barColors: any[] = ["red", "orange", "amber", "green"];

  // Data for ScatterChart
  const scatterData = analyzed.map(p => ({
    name: p.name,
    "Schedule Risk": p.riskData.schedule_risk_score,
    "Cost Risk": p.riskData.cost_risk_score,
    "Composite Score": p.riskData.composite_risk_score,
    tier: p.riskData.risk_label,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-6 hover:border-white/16 transition-all duration-200">
        <Title className="text-white text-sm mb-4">Risk Distribution</Title>
        <BarChart
          className="h-64 font-mono text-muted"
          data={barData}
          index="name"
          categories={["Count"]}
          colors={barColors}
          yAxisWidth={40}
          showLegend={false}
          valueFormatter={(v) => v.toString()}
        />
      </Card>

      <Card className="bg-[#1A1D27] border-white/8 rounded-2xl p-6 hover:border-white/16 transition-all duration-200 relative">
        <Title className="text-white text-sm mb-4">Schedule vs. Cost Drivers</Title>
        <ScatterChart
          className="h-64"
          yAxisWidth={40}
          data={scatterData}
          category="tier"
          x="Schedule Risk"
          y="Cost Risk"
          size="Composite Score"
          colors={barColors}
          showLegend={false}
          valueFormatter={{ x: (val) => `${val}`, y: (val) => `${val}`, size: (val) => `${val}` }}
        />
        {/* Quadrant labels overlaid */}
        <div className="absolute inset-x-12 inset-y-16 pointer-events-none">
          <div className="absolute top-2 left-2 text-[10px] text-muted font-mono uppercase">Behind Schedule</div>
          <div className="absolute top-2 right-2 text-[10px] text-red-500/50 font-mono uppercase">Critical</div>
          <div className="absolute bottom-2 left-2 text-[10px] text-green-500/50 font-mono uppercase">On Track</div>
          <div className="absolute bottom-2 right-2 text-[10px] text-muted font-mono uppercase">Blown Budget</div>
        </div>
      </Card>
    </div>
  );
}
