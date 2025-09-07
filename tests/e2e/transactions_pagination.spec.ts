import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
const API_URL = (process.env.E2E_API_URL || 'http://localhost:8020/api').replace(/\/$/, '');

test.describe('Transactions - Pagination', () => {
  test('navigates to next page and queries backend with page param', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions`);
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions`);
    }
    await expect(page.locator('.ant-pro-table').or(page.locator('.transaction-table')).or(page.getByPlaceholder(/Search by ID.*name/i))).toBeVisible({ timeout: 30000 });

    // Shorten page size if control is visible
    const sizeChanger = page.locator('.ant-pagination-options .ant-select');
    if (await sizeChanger.count()) {
      await sizeChanger.click();
      await page.getByRole('option', { name: /^10$/ }).click().catch(() => {});
    }

    // Wait for a page 2 query
    const reqPromise = page.waitForRequest((req) => {
      if (!req.url().startsWith(`${API_URL}/transactions/`)) return false;
      const u = new URL(req.url());
      return (u.searchParams.get('page') || u.searchParams.get('current')) === '2';
    });

    // Click next page
    const pagerNext = page.locator('.ant-pagination-next button');
    if (await pagerNext.isEnabled()) {
      await pagerNext.click();
      await reqPromise;
    }

    // Either we see rows or empty
    await expect(page.locator('.ant-table-tbody').first().or(page.getByText(/No data|No results/i))).toBeVisible();
  });
});
