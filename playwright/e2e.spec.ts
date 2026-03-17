import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Dashboard Happy Path', () => {
  test('uploads CSV, views table, and opens executive summary', async ({ page }) => {
    // Navigate to local app
    await page.goto('/');

    // Ensure we are on the upload page
    await expect(page.getByText('Ingest Portfolio Data')).toBeVisible();

    // Mock Gemini API calls if we don't have a real key or just rely on fallback
    // We will rely on the fallback logic since NEXT_PUBLIC_GEMINI_API_KEY might not be set in test env

    // We need a dummy CSV file, create one on the fly in the test or use buffer
    const csvContent = `Project Name,Owner,Start Date,End Date,% Complete,Budget,Actual Spend,Status,Notes
Project Alpha,Alice,2023-01-01,2023-12-31,100,100000,95000,Complete,All good
Project Beta,Bob,2024-01-01,2024-06-30,50,50000,60000,At Risk,Over budget
Project Gamma,Charlie,2024-03-01,2024-12-31,10,200000,10000,On Track,Just started`;
    
    // Choose file
    await page.setInputFiles('input[type="file"]', {
      name: 'portfolio.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });

    // Wait for the table to appear (meaning CSV was parsed and analysis started/finished)
    await expect(page.getByText('Project Alpha')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Project Beta')).toBeVisible();

    // Wait for analysis to complete by looking for the fallback text on all 3 rows
    await expect(page.getByText('AI analysis unavailable.')).toHaveCount(3, { timeout: 15000 });

    // Click a row to expand
    // Find the cell with Project Alpha and click the row
    await page.getByText('Project Alpha').click();
    
    // Check if expansion shows "Recommended Action"
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright/debug.png' });
    await expect(page.getByText('Recommended Action')).toBeVisible();

    // Click CTA for Executive Summary
    await page.getByRole('button', { name: 'Executive Summary' }).click();

    // Check if summary panel opened
    await expect(page.getByText('AI Executive Briefing')).toBeVisible();
    await expect(page.getByText('Portfolio Situation')).toBeVisible();
  });
});
