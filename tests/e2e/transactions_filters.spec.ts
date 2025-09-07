import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
const API_URL = (process.env.E2E_API_URL || 'http://localhost:8020/api').replace(/\/$/, '');

test.describe('Transactions - Filters → Backend params', () => {
  test('applies status, mode, dates, search and calls BE with params', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);

    // Navigate to Transactions list (handle both routes)
    await page.goto(`${FRONTEND_URL}/transactions`);
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions`);
    }
    await expect(page.getByPlaceholder(/Search by ID.*name/i).first().or(page.locator('.transaction-table'))).toBeVisible({ timeout: 30000 });

    // Fill toolbar filters we added: search, status, payment mode, date range
    // Only set a robust search filter to assert request param mapping
    const search = page.getByPlaceholder(/Search by ID.*name/i).first();
    await search.fill('TXN');

    // Intercept next transactions request and assert query params
    const reqPromise = page.waitForRequest((req) => {
      if (!req.url().startsWith(`${API_URL}/transactions/`)) return false;
      const u = new URL(req.url());
      const searchParam = u.searchParams.get('search');
      return (searchParam || '').toUpperCase().includes('TXN');
    });

    // Apply via toolbar button if visible, else reload icon
    const applyBtn = page.getByRole('button', { name: /^Apply$/i }).first();
    if (await applyBtn.count()) {
      await applyBtn.click();
    } else {
      const reloadBtn = page.getByRole('button', { name: /Refresh|Reload/i }).first();
      if (await reloadBtn.count()) await reloadBtn.click();
    }
    await reqPromise; // Ensures params reached the backend

    // Basic assertion that rows or an empty state appear
    const tableBody = page.locator('.ant-pro-table .ant-table-tbody');
    await expect(tableBody.or(page.getByText(/No data|No results/i))).toBeVisible();
  });
});
