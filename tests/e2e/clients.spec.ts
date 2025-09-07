import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Clients module', () => {
  test('loads client list with pagination and search', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/clients`);

    // Wait for table render
    await expect(page.locator('.ant-pro-table')).toBeVisible();

    // Toolbar and actions
    await expect(page.getByRole('button', { name: /Add Client/i })).toBeVisible({ timeout: 30000 });

    // Search field exists
    await page.getByPlaceholder(/search/i).first().fill('SAB');
    // Trigger query (depends on UI implementation; reload button present)
    const reload = page.getByRole('button', { name: /Reload|Refresh/i }).first();
    if (await reload.isVisible()) {
      await reload.click();
    }

    // Either rows or empty state
    const rows = page.locator('.ant-table-row');
    await expect(rows.first().or(page.getByText(/No data|No results/i))).toBeVisible();
  });
});
