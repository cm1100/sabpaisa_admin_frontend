import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Transactions - Failed', () => {
  test('loads Failed Transactions page and shows table', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions/failed`);

    // Heading and helper text (select first heading to avoid strict errors)
    const heading = page.getByRole('heading', { name: /Failed Transactions/i }).first();
    await expect(heading).toBeVisible({ timeout: 30000 });

    // Table should render or empty state should show
    const table = page.locator('.ant-table');
    await expect(table.first().or(page.getByText(/No data|No results|empty/i))).toBeVisible();

    // Retry button may exist per row; assert presence if rows exist
    const row = page.locator('.ant-table-tbody .ant-table-row').first();
    if (await row.isVisible()) {
      const maybeRetry = page.getByRole('button', { name: /Retry|View Details/i }).first();
      await expect(maybeRetry).toBeVisible();
    }
  });
});
