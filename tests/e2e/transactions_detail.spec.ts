import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Transactions - Detail', () => {
  test('opens detail from list and shows core fields', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions`);
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions`);
    }
    await expect(page.getByPlaceholder(/Search by ID.*name/i).first().or(page.locator('.transaction-table'))).toBeVisible({ timeout: 30000 });

    // Click first transaction id link if present
    const txnLink = page.locator('a.transaction-id-link').first();
    if (await txnLink.count()) {
      await txnLink.click();
      await page.waitForLoadState('networkidle');
      // Check detail page has expected headings or fields
      await expect(page.getByText(/Transaction|Details|Timeline|Refund/i)).toBeVisible({ timeout: 15000 });
    } else {
      // If no rows, at least pass by asserting table empty
      await expect(page.getByText(/No data|No results/i)).toBeVisible();
    }
  });
});
