import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Phase B — Reports run and download', () => {
  test('Create a CSV template, run it, and download the generated file', async ({ page, request, context }) => {
    await loginAndSeedTokens(request, page);

    // Create a template
    await page.goto(`${FRONTEND}/reports/builder`, { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder(/Monthly Settlements/i).fill('E2E Download Template');
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /Transactions/i }).click();
    // Format defaults to CSV; submit
    await page.getByRole('button', { name: /Create Template/i }).click();

    // Run it from Templates page
    await page.goto(`${FRONTEND}/reports/templates`, { waitUntil: 'domcontentloaded' });
    // Click first "Run" link (or the one matching our template if available)
    const runLink = page.getByRole('link', { name: /^Run$/ }).first();
    await runLink.click();
    // Optional: wait a moment for backend to create file
    await page.waitForTimeout(1000);

    // Go to Reports landing and download latest
    await page.goto(`${FRONTEND}/reports`, { waitUntil: 'domcontentloaded' });
    // Wait for at least one Download link to appear
    await page.getByRole('link', { name: /^Download$/ }).first().waitFor({ timeout: 60000 });
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /^Download$/ }).first().click();
    const download = await downloadPromise;
    const suggested = download.suggestedFilename();
    expect(suggested).toBeTruthy();
  });
});
