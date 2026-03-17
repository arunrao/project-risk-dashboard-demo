import { computeScheduleRisk, computeCostRisk, computeCompositeScore, getRiskLabel } from '@/lib/riskModel';

describe('riskModel', () => {
  describe('computeScheduleRisk', () => {
    it('returns High/Critical risk when past due', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(computeScheduleRisk(undefined, pastDate.toISOString(), 90)).toBe(100);
      expect(computeScheduleRisk(undefined, pastDate.toISOString(), 100)).not.toBe(100);
    });

    it('returns critical when buffer is very small', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      
      expect(computeScheduleRisk(start, end)).toBe(90);
    });
    
    it('returns low when buffer is large', () => {
      const now = new Date();
      const start = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      
      expect(computeScheduleRisk(start, end)).toBe(15);
    });
  });

  describe('computeCostRisk', () => {
    it('returns Critical for over budget > 110%', () => {
      expect(computeCostRisk(100, 115)).toBe(95);
    });

    it('returns Low for under budget < 70%', () => {
      expect(computeCostRisk(100, 50)).toBe(15);
    });

    it('handles missing cost data', () => {
      expect(computeCostRisk(undefined, 100)).toBe(-1);
    });
  });

  describe('computeCompositeScore', () => {
    it('averages three scores normally', () => {
      expect(computeCompositeScore(90, 90, 90)).toBe(90);
      expect(computeCompositeScore(10, 20, 30)).toBe(20);
    });

    it('re-weights to 50/50 if cost is missing', () => {
      expect(computeCompositeScore(90, -1, 10)).toBe(50); // (90*0.5) + (10*0.5) = 50
    });
  });

  describe('getRiskLabel', () => {
    it('maps correctly', () => {
      expect(getRiskLabel(80)).toBe('Critical');
      expect(getRiskLabel(60)).toBe('High');
      expect(getRiskLabel(40)).toBe('Medium');
      expect(getRiskLabel(10)).toBe('Low');
    });
  });
});
