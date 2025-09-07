import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Phase B — Routing Policies UI', () => {
  test('Create, activate, simulate policy; visible in Gateways page', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);

    await page.goto(`${FRONTEND}/config/routing-policies`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /New Policy/i }).click();
    await page.getByPlaceholder(/Default UPI Card Routing/i).fill('E2E Policy');
    await page.getByRole('switch').first().check();
    await page.getByPlaceholder(/{ "payment_mode": "UPI" }/i).fill(JSON.stringify({ payment_method: ['UPI'], amount: { max: 50000 }, description: 'E2E flow', priority: 2 }));
    await page.getByPlaceholder(/{ "GatewayA": 70, "GatewayB": 30 }/i).fill(JSON.stringify({ razorpay: 60, payu: 40 }));
    await page.getByRole('button', { name: /Create|Save|Update/i }).click();

    // Ensure policy row visible
    await expect(page.getByRole('cell', { name: 'E2E Policy' }).first()).toBeVisible({ timeout: 60000 });

    // Toggle deactivate then activate
    const row = page.getByRole('row', { name: /E2E Policy/ });
    const toggle = row.getByRole('switch');
    await toggle.uncheck();
    await toggle.check();

    // Go to Gateways and verify policy appears in Routing Rules table
    await page.goto(`${FRONTEND}/config/gateways`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Routing Rules')).toBeVisible();
    await expect(page.getByRole('cell', { name: /E2E Policy/ }).first()).toBeVisible({ timeout: 60000 });
  });
});
