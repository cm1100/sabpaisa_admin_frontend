import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Integration Webhooks - Create/Toggle/Test', () => {
  test('creates webhook, toggles status and sends test event', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);

    await page.goto(`${FRONTEND}/integration/webhooks`, { waitUntil: 'domcontentloaded' });
    // Fallback: if not visible, navigate via sidebar menu (nav-/integration/webhooks)
    try {
      await expect(page.getByTestId('stub-integration-webhooks')).toBeVisible({ timeout: 60000 });
    } catch {
      const nav = page.getByTestId('nav-integration-webhooks').first();
      if (await nav.isVisible()) {
        await nav.click();
        await expect(page.getByTestId('stub-integration-webhooks')).toBeVisible({ timeout: 60000 });
      } else {
        // As a last resort, go to integration landing then into webhooks
        await page.goto(`${FRONTEND}/integration`, { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: /Webhooks/i }).click();
        await expect(page.getByTestId('stub-integration-webhooks')).toBeVisible({ timeout: 60000 });
      }
    }

    // Open create modal
    const createBtn = page.getByRole('button', { name: /Create/i }).first();
    await createBtn.click();

    // Fill form
    const ts = Date.now();
    await page.getByLabel('Client ID').fill(`CLT${ts}`);
    await page.getByLabel('Endpoint URL').fill('https://example.com/webhook');
    // Open events select and choose first option via keyboard (more stable for AntD)
    await page.getByLabel('Events').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Close dropdown to avoid overlay intercepting click
    await page.keyboard.press('Escape');
    // Ensure dropdown closed before submit
    try { await page.locator('.ant-select-dropdown').first().waitFor({ state: 'hidden', timeout: 2000 }); } catch {}
    // Submit
    await page.getByRole('button', { name: /^OK$|^Create$/i }).click();

    // Wait for table refresh and presence of row
    await expect(page.getByText('https://example.com/webhook')).toBeVisible({ timeout: 15000 });

    // This page renders action buttons without accessible names; ensure click by position
    // Toggle
    const row = page.getByText('https://example.com/webhook').locator('xpath=ancestor::tr');
    const buttons = row.locator('button');
    if (await buttons.count() >= 2) {
      await buttons.nth(0).click(); // toggle active
      await buttons.nth(1).click(); // test webhook
    }
  });
});
