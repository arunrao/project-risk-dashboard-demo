import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectTable } from '@/components/ProjectTable';
import { AnalyzedProjectRow } from '@/types';

// Mock Tremor components that use ResizeObserver
jest.mock('@tremor/react', () => {
  const originalModule = jest.requireActual('@tremor/react');
  return {
    ...originalModule,
    ProgressBar: () => <div data-testid="progress-bar" />,
    // simplified mocks for multi select to make testing easier
    MultiSelect: ({ children, onValueChange }: any) => (
      <div data-testid="multi-select" onClick={() => onValueChange(['Critical'])}>
        {children}
      </div>
    ),
    MultiSelectItem: ({ children }: any) => <div>{children}</div>,
  };
});

describe('ProjectTable', () => {
  const projects: AnalyzedProjectRow[] = [
    { name: 'Alpha', owner: 'Alice', pctComplete: 50, riskData: { composite_risk_score: 80, schedule_risk_score: 90, cost_risk_score: 50, status_risk_score: 50, risk_label: 'Critical', recommended_action: 'Escalate', risk_summary: 'Bad' } },
    { name: 'Beta', owner: 'Bob', pctComplete: 90, riskData: { composite_risk_score: 20, schedule_risk_score: 10, cost_risk_score: 10, status_risk_score: 10, risk_label: 'Low', recommended_action: 'None', risk_summary: 'Good' } },
  ];

  it('renders rows and searches correctly', () => {
    render(<ProjectTable projects={projects} />);
    
    // Shows both initially
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    // Search for Alpha
    const searchInput = screen.getByPlaceholderText('Search projects or owners...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('filters by risk correctly', () => {
    render(<ProjectTable projects={projects} />);
    
    // Trigger multi select mock to filter by Critical
    const multiSelect = screen.getByTestId('multi-select');
    fireEvent.click(multiSelect);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });
});
