export interface ProjectRow {
  // Original CSV fields
  name: string;
  owner?: string;
  startDate?: string;
  endDate?: string;
  pctComplete?: number;
  budget?: number;
  actualSpend?: number;
  status?: string;
  notes?: string;

  // Added by parsing if any missing
  rawRowData?: Record<string, string>;
}

export interface RiskResult {
  schedule_risk_score: number;
  cost_risk_score: number;
  status_risk_score: number;
  composite_risk_score: number;
  risk_label: 'Critical' | 'High' | 'Medium' | 'Low';
  risk_summary: string;
  recommended_action: string;
}

export interface AnalyzedProjectRow extends ProjectRow {
  riskData?: RiskResult | null; // null if pending, RiskResult if complete
  isError?: boolean;
}

export interface PortfolioSummary {
  headline: string;
  situation: string;
  top_risks: string[];
  recommended_actions: string[];
  bottom_line: string;
}

export interface ColumnMapping {
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  pctComplete: string;
  budget: string;
  actualSpend: string;
  status: string;
  notes: string;
}
