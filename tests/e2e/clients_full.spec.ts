import { test, expect } from '@playwright/test';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
import { loginAndSeedTokens } from './auth.helpers';

/**
 * End-to-end UI flow for Clients module
 * - loads list
 * - creates a client via modal
 * - searches by code
 * - opens detail
 * - triggers API key generation (via API fallback) and verifies display
 * - checks KYC status page
 */

test.describe('Clients module - full flow', () => {
  test('create, search, view detail, kyc', async ({ page, request }) => {
    const creds = { username: process.env.E2E_USER || 'admin@sabpaisa.com', password: process.env.E2E_PASS || 'admin123' };
    await loginAndSeedTokens(request, page, creds);

    // Go to client management (baseURL from config)
    await page.goto(`${FRONTEND_URL}/clients`);
    await page.waitForLoadState('domcontentloaded');
    // If redirected to login, re-seed and retry
    if (page.url().includes('/login')) {
      await page.goto(`${FRONTEND_URL}/`);
      await page.goto(`${FRONTEND_URL}/clients`);
      await page.waitForLoadState('domcontentloaded');
    }
    // Wait for either toolbar button or table container
    const addButton = page.getByRole('button', { name: /Add Client/i });
    const table = page.locator('.ant-pro-table');
    await Promise.race([
      addButton.waitFor({ state: 'visible', timeout: 30000 }),
      table.waitFor({ state: 'visible', timeout: 30000 }),
    ]);

    // Open add client modal
    const addBtn = page.getByRole('button', { name: /Add Client/i }).first();
    await addBtn.click();

    const ts = Date.now();
    const code = `CLT${ts}`;

    // Fill form
    await page.getByLabel(/Client Name/i).fill('E2E Test Client');
    await page.getByLabel(/Client Code/i).fill(code);
    await page.getByLabel(/Email/i).fill(`e2e+${ts}@example.com`);
    await page.getByLabel(/^Phone$/i).fill('+911234567890');
    // Optional fields
    await page.getByLabel(/Tier/i).click();
    await page.getByRole('option', { name: /Standard/i }).click();
    await page.getByLabel(/Status/i).click();
    await page.getByRole('option', { name: /Active/i }).click();
    // Risk Category (if present)
    const riskLabel = page.getByLabel(/Risk Category/i);
    if (await riskLabel.count()) {
      await riskLabel.click();
      await page.getByRole('option', { name: /^1 - Low$/i }).click();
    }

    // Submit
    const ok = page.getByRole('button', { name: /Create|Update/i }).last();
    await ok.click();

    // Wait for toast and table reload
    await expect(page.getByText(/Client created successfully|Client updated successfully/i)).toBeVisible({ timeout: 15000 });

    // Search by code - use table search input
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await searchInput.fill(code);
    // Smash reload button if present
    const reloadBtn = page.getByRole('button', { name: /Reload|Refresh/i }).first();
    if (await reloadBtn.isVisible()) await reloadBtn.click();

    // Open actions menu for first row, navigate to details
    const more = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await more.click();
    const viewDetails = page.getByRole('menuitem', { name: /View Details/i });
    await viewDetails.click();

    // On detail page, check title and ID presence
    await expect(page.getByText(/Client Information/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(new RegExp(code))).toBeVisible();

    // Fallback: trigger API key generation via API to avoid UI dependency differences
    // Derive client_id from URL if possible
    const url = new URL(page.url());
    const id = url.pathname.split('/').filter(Boolean).pop();
    const apiBase = process.env.E2E_API_URL || 'http://localhost:8020/api';
    if (id) {
      const resp = await request.post(`${apiBase}/clients/${id}/generate_api_key/`);
      expect(resp.ok()).toBeTruthy();
    }

    // Reload detail and verify API Key labels exist (presence is enough)
    await page.reload();
    await expect(page.getByText(/API Key/i)).toBeVisible();

    // Navigate to KYC module and ensure it loads
    await page.goto('/clients/kyc');
    await expect(page.getByText(/KYC Verification/i)).toBeVisible({ timeout: 15000 });
  });
});
