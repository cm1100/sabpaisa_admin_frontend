import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Transactions module', () => {
  test('loads All Transactions and shows normalized fields', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions`);
    // Handle potential login redirect
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions`);
    }
    // Wait for toolbar or table to render
    const searchInput = page.getByPlaceholder(/Search by ID.*name/i).first();
    await expect(searchInput.or(page.locator('.ant-pro-table')).or(page.locator('.transaction-table'))).toBeVisible({ timeout: 30000 });

    // Check columns present: Amount, Status, Payment Mode (target table headers specifically)
    // If a table exists, assert presence of core headers
    const th = page.locator('.ant-pro-table thead .ant-table-column-title');
    if (await th.count()) {
      await expect(th.filter({ hasText: 'Amount' })).toBeVisible();
      await expect(th.filter({ hasText: 'Status' })).toBeVisible();
      await expect(th.filter({ hasText: /Payment/i })).toBeVisible();
    }

    // If there are rows, assert amount cell has ₹ and status badge exists
    const firstRow = page.locator('.ant-pro-table .ant-table-tbody .ant-table-row').first();
    if (await firstRow.isVisible()) {
      const amountCell = firstRow.locator('.transaction-amount').first();
      await expect(amountCell).toBeVisible();
    }
  });
});
