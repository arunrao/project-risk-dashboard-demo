"use server";

import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { ProjectRow, RiskResult, PortfolioSummary } from "@/types";
import { computeScheduleRisk, computeCostRisk, computeCompositeScore, getRiskLabel } from "./riskModel";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const projectSchema: Schema = {
  type: "object" as any,
  properties: {
    schedule_risk_score: { type: "integer" as any, description: "0-100 score" },
    cost_risk_score: { type: "integer" as any, description: "0-100 score" },
    status_risk_score: { type: "integer" as any, description: "0-100 score" },
    composite_risk_score: { type: "integer" as any, description: "0-100 score" },
    risk_label: { type: "string" as any, description: "Must be exactly: Critical, High, Medium, or Low" },
    risk_summary: { type: "string" as any, description: "one sentence — the single biggest risk driver" },
    recommended_action: { type: "string" as any, description: "one sentence — the single most important next step" }
  },
  required: ["schedule_risk_score", "cost_risk_score", "status_risk_score", "composite_risk_score", "risk_label", "risk_summary", "recommended_action"]
};

// Fallback logic in case Gemini fails completely
function fallbackComputeRisk(row: ProjectRow): RiskResult {
  const schedScore = computeScheduleRisk(row.startDate, row.endDate, row.pctComplete);
  const costScore = computeCostRisk(row.budget, row.actualSpend);
  const statusScore = 50; // default unknown status risk
  const compScore = computeCompositeScore(schedScore, costScore, statusScore);
  return {
    schedule_risk_score: schedScore,
    cost_risk_score: costScore === -1 ? 50 : costScore,
    status_risk_score: statusScore,
    composite_risk_score: compScore,
    risk_label: getRiskLabel(compScore),
    risk_summary: "AI analysis unavailable.",
    recommended_action: "Review manually."
  };
}

export async function analyzeProject(row: ProjectRow): Promise<RiskResult> {
  if (!GEMINI_API_KEY) {
    return fallbackComputeRisk(row);
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: projectSchema,
      temperature: 0.1,
    }
  });

  const prompt = `You are a project risk analyst. Given this project data, return ONLY a valid JSON object — no markdown, no preamble.

Project: ${row.name || 'N/A'}
Owner: ${row.owner || 'N/A'}
Start Date: ${row.startDate || 'N/A'}
End Date: ${row.endDate || 'N/A'}
Percent Complete: ${row.pctComplete ?? 'N/A'}
Budget: ${row.budget ?? 'N/A'}
Actual Spend: ${row.actualSpend ?? 'N/A'}
Status: ${row.status || 'N/A'}
Notes: ${row.notes || 'N/A'}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as RiskResult;
  } catch (error) {
    console.error("Gemini row analysis error:", error);
    // Retry once with a stricter fallback or just return fallback compute
    return fallbackComputeRisk(row);
  }
}

const portfolioSchema: Schema = {
  type: "object" as any,
  properties: {
    headline: { type: "string" as any },
    situation: { type: "string" as any },
    top_risks: { type: "array" as any, items: { type: "string" as any } },
    recommended_actions: { type: "array" as any, items: { type: "string" as any } },
    bottom_line: { type: "string" as any }
  },
  required: ["headline", "situation", "top_risks", "recommended_actions", "bottom_line"]
};

export async function generatePortfolioSummary(
  results: RiskResult[],
  projects: ProjectRow[]
): Promise<PortfolioSummary> {
  if (!GEMINI_API_KEY || results.length === 0) {
    return {
      headline: "Portfolio Analysis Defaults Rendered.",
      situation: "API Key missing or no results analyzed.",
      top_risks: ["Check environment configuration"],
      recommended_actions: ["Add NEXT_PUBLIC_GEMINI_API_KEY"],
      bottom_line: "Analysis cannot complete without AI models."
    };
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: portfolioSchema,
      temperature: 0.2,
    }
  });

  const total = results.length;
  const critical = results.filter(r => r.risk_label === "Critical");
  const high = results.filter(r => r.risk_label === "High");
  const medium = results.filter(r => r.risk_label === "Medium");
  const low = results.filter(r => r.risk_label === "Low");
  
  const avgScore = total > 0 
    ? Math.round(results.reduce((s, r) => s + r.composite_risk_score, 0) / total) 
    : 0;

  // sort for top 3
  const combined = projects.map((p, i) => ({ name: p.name, score: results[i]?.composite_risk_score || 0 })).sort((a,b) => b.score - a.score);
  const top3 = combined.slice(0, 3).map(c => `${c.name} (${c.score})`).join(", ");

  const prompt = `You are a PMO executive analyst. Given this portfolio risk summary, write a concise executive briefing. Return ONLY a valid JSON object — no markdown, no preamble.

Total Projects: ${total}
Critical: ${critical.length}
High: ${high.length}
Medium: ${medium.length}
Low: ${low.length}
Average Composite Risk Score: ${avgScore}
Top 3 Riskiest Projects: ${top3}
Most Common Risk Driver: Infer from the distribution across schedule, cost, and typical real-world portfolio risks.

Remember to follow the JSON schema strictly.`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    return JSON.parse(text) as PortfolioSummary;
  } catch (error) {
    console.error("Gemini portfolio summary error", error);
    return {
      headline: "Failed to generate AI executive briefing.",
      situation: "An error occurred while calling the Gemini API.",
      top_risks: ["AI API unavailable"],
      recommended_actions: ["Review projects manually in the grid"],
      bottom_line: "Analysis degraded."
    };
  }
}
