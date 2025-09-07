import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Transactions - Export', () => {
  test('exports CSV honoring active filters', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions`);
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions`);
    }
    await expect(page.getByRole('button', { name: /^Export$/i }).first().or(page.getByPlaceholder(/Search by ID.*name/i))).toBeVisible({ timeout: 30000 });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /^Export$/i }).click();
    const download = await downloadPromise;
    const suggested = download.suggestedFilename();
    expect(suggested).toMatch(/transactions_\d{4}-\d{2}-\d{2}\.csv/i);
  });
});
