import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

test.describe('Fees module', () => {
  test('loads Fee Configuration and lists clients in selects', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto('/fees/configuration');

    // Table should be visible
    await expect(page.locator('.ant-pro-table')).toBeVisible();

    // Filter by client select should have options
    const filterSelect = page.getByTestId('fee-filter-client');
    await filterSelect.click();
    const dropdown = page.locator('.ant-select-dropdown .ant-select-item-option');
    // Playwright doesn't have toHaveCountGreaterThan; get count and assert > 0
    await expect(async () => {
      const count = await dropdown.count();
      expect(count).toBeGreaterThan(0);
    }).toPass();
    await page.keyboard.press('Escape');

    // Open add modal and verify client select populated
    const addBtn = page.getByRole('button', { name: /Add|New/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const clientSelect = page.getByTestId('fee-form-client');
      await clientSelect.click();
      const options = page.locator('.ant-select-dropdown .ant-select-item-option');
      await expect(async () => {
        const count = await options.count();
        expect(count).toBeGreaterThan(0);
      }).toPass();
      await page.keyboard.press('Escape');
    }
  });
});
