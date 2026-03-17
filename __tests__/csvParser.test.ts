import { mapColumns } from '@/lib/csvParser';

describe('csvParser', () => {
  describe('mapColumns', () => {
    it('maps correctly using heuristics', () => {
      const headers = ['Project Name', 'Lead', 'Begin Date', 'Due Date', 'Progress %', 'Allocated Budget', 'Actual Cost', 'Current Status', 'Additional Notes'];
      const mapping = mapColumns(headers);

      expect(mapping.name).toBe('Project Name');
      expect(mapping.owner).toBe('Lead');
      expect(mapping.startDate).toBe('Begin Date');
      expect(mapping.endDate).toBe('Due Date');
      expect(mapping.pctComplete).toBe('Progress %');
      expect(mapping.budget).toBe('Allocated Budget');
      expect(mapping.actualSpend).toBe('Actual Cost');
      expect(mapping.status).toBe('Current Status');
      expect(mapping.notes).toBe('Additional Notes');
    });

    it('handles missing columns gracefully', () => {
      const headers = ['Project Name'];
      const mapping = mapColumns(headers);

      expect(mapping.name).toBe('Project Name');
      expect(mapping.owner).toBe('');
      expect(mapping.pctComplete).toBe('');
    });
  });
});
