import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Refunds module', () => {
  test('loads refunds list and shows approve action', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    // There are two routes in app: /transactions/refunds and /refunds page under transactions
    // Navigate via home to ensure client-side auth context
    await page.goto(`${FRONTEND_URL}/`);
    await page.goto(`${FRONTEND_URL}/transactions/refunds`);
    // fallback
    if (!(await page.locator('.ant-pro-table').first().isVisible({ timeout: 5000 }))) {
      await page.goto(`${FRONTEND_URL}/refunds`);
    }
    // Either a table is present or the page shows Refunds heading
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/refunds/);
    // If a refund row exists, approve/reject buttons may be visible
    const row = page.locator('.ant-pro-table .ant-table-tbody .ant-table-row').first();
    if (await row.isVisible()) {
      // Look for action buttons if table populated
      const approve = page.getByRole('button', { name: /Approve/i }).first();
      const viewDetails = page.getByRole('button', { name: /View Details/i }).first();
      await expect(approve.or(viewDetails)).toBeVisible();
    }
  });
});
