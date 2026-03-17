import { render, screen } from '@testing-library/react';
import { SummaryStats } from '@/components/SummaryStats';
import { AnalyzedProjectRow } from '@/types';

describe('SummaryStats', () => {
  it('computes metrics correctly', () => {
    const projects: AnalyzedProjectRow[] = [
      { name: 'P1', riskData: { composite_risk_score: 80, schedule_risk_score: 90, cost_risk_score: 50, status_risk_score: 50, risk_label: 'Critical', recommended_action: '', risk_summary: '' } },
      { name: 'P2', riskData: { composite_risk_score: 40, schedule_risk_score: 20, cost_risk_score: 50, status_risk_score: 50, risk_label: 'Medium', recommended_action: '', risk_summary: '' } },
    ];

    render(<SummaryStats projects={projects} />);

    // Total Projects = 2
    expect(screen.getByText('Total Projects').parentElement?.nextSibling).toHaveTextContent('2');

    // Critical + High = 1
    expect(screen.getByText('Critical + High').parentElement?.nextSibling).toHaveTextContent('1');

    // On Schedule (< 30) = 1
    expect(screen.getByText('On Schedule').parentElement?.nextSibling).toHaveTextContent('1');

    // Avg Score = (80 + 40) / 2 = 60
    expect(screen.getByText('Avg Risk Score').parentElement?.nextSibling).toHaveTextContent('60');
  });
});
