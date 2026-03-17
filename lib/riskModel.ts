export function computeScheduleRisk(startDateStr?: string, endDateStr?: string, pctComplete?: number): number {
  if (!endDateStr) return 50; // default to medium if no schedule data
  
  const end = new Date(endDateStr);
  const now = new Date();
  const isPast = end < now;
  const isComplete = pctComplete !== undefined ? pctComplete >= 100 : false;

  if (isComplete) return 15; // Low risk if fully completed
  if (isPast) return 100; // Passed due date and not complete

  if (!startDateStr) return 50;

  const start = new Date(startDateStr);
  const totalDuration = end.getTime() - start.getTime();
  const timeRemaining = end.getTime() - now.getTime();

  if (totalDuration <= 0) return 50;

  const bufferPct = timeRemaining / totalDuration;

  if (bufferPct < 0.1) return 90; // Critical (85-100)
  if (bufferPct >= 0.1 && bufferPct < 0.25) return 75; // High (60-84)
  if (bufferPct >= 0.25 && bufferPct < 0.5) return 45; // Medium (30-59)
  return 15; // Low (0-29)
}

export function computeCostRisk(budget?: number, actualSpend?: number): number {
  // Return -1 to indicate missing cost data
  if (budget === undefined || actualSpend === undefined || budget <= 0) return -1;

  const spendPct = actualSpend / budget;

  if (spendPct > 1.1) return 95; // Critical
  if (spendPct >= 0.9 && spendPct <= 1.1) return 75; // High
  if (spendPct >= 0.7 && spendPct < 0.9) return 45; // Medium
  return 15; // Low
}

export function computeCompositeScore(
  scheduleScore: number,
  costScore: number, // May be -1 if missing
  statusScore: number
): number {
  if (costScore === -1) {
    // missing cost data -> weight schedule & status at 50% each
    return Math.round((scheduleScore * 0.5) + (statusScore * 0.5));
  }
  // equal weight 33.3% each
  return Math.round((scheduleScore / 3) + (costScore / 3) + (statusScore / 3));
}

export function getRiskLabel(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

export function getRiskColor(label: 'Critical' | 'High' | 'Medium' | 'Low'): string {
  switch (label) {
    case 'Critical': return '#EF4444'; // var(--risk-critical)
    case 'High': return '#F97316'; // var(--risk-high)
    case 'Medium': return '#F59E0B'; // var(--risk-medium)
    case 'Low': return '#22C55E'; // var(--risk-low)
  }
}
