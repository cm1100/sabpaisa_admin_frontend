import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Transactions - Live Monitor', () => {
  test('renders stats and table/cards without crashing', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND_URL}/transactions/live`);
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/transactions/live`);
    }

    // Expect some key stats or labels
    await expect(page.getByText(/Live|Monitoring|Exceptions|Failed/i).first()).toBeVisible({ timeout: 30000 });

    // Either a table or a card is visible without strict locator conflicts
    const table = page.locator('.ant-table').first();
    const card = page.locator('.ant-card').first();
    const tableVisible = await table.isVisible().catch(() => false);
    const cardVisible = await card.isVisible().catch(() => false);
    expect(tableVisible || cardVisible).toBeTruthy();

    // Auto-refresh switch if present
    const sw = page.getByRole('switch');
    if (await sw.count()) await expect(sw).toBeVisible();
  });
});
