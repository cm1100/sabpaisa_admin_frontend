import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Settlements Smoke', () => {
  test('loads page and shows statistics cards', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);

    const navSettlements = page.getByTestId('nav-settlements').first();
    if (await navSettlements.isVisible()) {
      await navSettlements.click();
    } else {
      await page.goto(`${FRONTEND}/settlements`, { waitUntil: 'domcontentloaded' });
    }
    await expect(page.locator('.ant-statistic-title', { hasText: 'Pending Settlements' })).toBeVisible({ timeout: 120000 });
    await expect(page.locator('.ant-statistic-title', { hasText: 'Processing' }).first()).toBeVisible({ timeout: 120000 });
    await expect(page.locator('.ant-statistic-title', { hasText: 'Completed Today' })).toBeVisible({ timeout: 120000 });
  });
});
