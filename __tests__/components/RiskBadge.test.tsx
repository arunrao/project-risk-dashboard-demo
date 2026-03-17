import { render, screen } from '@testing-library/react';
import { RiskBadge } from '@/components/RiskBadge';

describe('RiskBadge', () => {
  it('renders Critical label correctly', () => {
    render(<RiskBadge label="Critical" />);
    const badge = screen.getByText('Critical');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('text-red-500');
  });

  it('renders Low label correctly', () => {
    render(<RiskBadge label="Low" />);
    const badge = screen.getByText('Low');
    expect(badge).toBeInTheDocument();
  });
});
