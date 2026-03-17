import { analyzeProject } from '@/lib/gemini';
import { ProjectRow } from '@/types';

// Mock the Gemini API Key to test the fallback behavior
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn()
  }))
}));

describe('gemini', () => {
  it('falls back to local logic if no API key is provided', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    process.env.NEXT_PUBLIC_GEMINI_API_KEY = '';

    const row: ProjectRow = {
      name: 'Test Project',
      pctComplete: 50,
      budget: 1000,
      actualSpend: 1200 // over budget
    };

    const result = await analyzeProject(row);
    expect(result.cost_risk_score).toBe(95); // Critical because 1200/1000 = 1.2 > 1.1
    expect(result.schedule_risk_score).toBe(50); // Default

    process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalEnv;
  });
});
