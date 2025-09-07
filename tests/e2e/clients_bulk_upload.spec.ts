import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Clients Bulk Upload (CSV)', () => {
  test('uploads CSV and shows success summary', async ({ page, request }) => {
    // Login with provided or default creds
    await loginAndSeedTokens(request, page, {
      username: process.env.E2E_USER || 'admin@sabpaisa.com',
      password: process.env.E2E_PASS || 'admin123',
    });

    // Navigate to bulk upload page (re-seed if redirected to login)
    await page.goto(`${FRONTEND}/clients/bulk`, { waitUntil: 'domcontentloaded' });
    if (page.url().includes('/login')) {
      await loginAndSeedTokens(request, page, {
        username: process.env.E2E_USER || 'admin@sabpaisa.com',
        password: process.env.E2E_PASS || 'admin123',
      });
      await page.goto(`${FRONTEND}/clients/bulk`, { waitUntil: 'domcontentloaded' });
    }
    await expect(page.getByText(/Click or drag file to this area to upload/i)).toBeVisible({ timeout: 120000 });

    // Prepare a small CSV in-memory
    const ts = Date.now();
    const code = `BULK${ts}`;
    const csv = [
      'client_code,client_name,client_type,email,contact,address,risk_category,active',
      `${code},Bulk Test Client,Business,bulk${ts}@example.com,9999999999,Test Address,1,true`,
    ].join('\n');

    // Attach CSV to the file input rendered by AntD Upload.Dragger
    let fileChooser = page.locator('input[type="file"]').first();
    try {
      await fileChooser.setInputFiles({ name: 'clients.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf-8') });
    } catch {
      // If a surprise redirect occurred, re-login and retry once
      if (page.url().includes('/login')) {
        await loginAndSeedTokens(request, page, {
          username: process.env.E2E_USER || 'admin@sabpaisa.com',
          password: process.env.E2E_PASS || 'admin123',
        });
        await page.goto(`${FRONTEND}/clients/bulk`, { waitUntil: 'domcontentloaded' });
        await expect(page.getByText(/Click or drag file to this area to upload/i)).toBeVisible({ timeout: 60000 });
        fileChooser = page.locator('input[type="file"]').first();
        await fileChooser.setInputFiles({ name: 'clients.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf-8') });
      } else {
        throw new Error('Failed to attach file');
      }
    }

    // Click Upload & Process
    await page.getByRole('button', { name: /Upload & Process/i }).click();

    // Wait for processing or completion (backend may skip explicit processing step)
    try {
      await expect(page.getByText(/Processing File/i)).toBeVisible({ timeout: 15000 });
    } catch {}
    // Consider completion when either "Complete" text or summary stats appear
    // Prefer summary metrics once available
    const statTitle = page.locator('.ant-statistic-title', { hasText: 'Total Processed' }).first();
    try {
      await expect(statTitle).toBeVisible({ timeout: 120000 });
    } catch {
      // Fallback to step badge
      await expect(page.locator('.ant-steps-item-finish .ant-steps-item-title', { hasText: 'Complete' }).first()).toBeVisible({ timeout: 120000 });
    }

    // Assert summary metrics are displayed (scope to statistic titles to avoid toast text)
    await expect(page.locator('.ant-statistic-title', { hasText: 'Total Processed' })).toBeVisible();
    await expect(page.locator('.ant-statistic-title', { hasText: 'Successful' }).first()).toBeVisible();

    // Finally, go back to Clients and ensure the page loads
    await page.getByRole('button', { name: /View All Clients/i }).click();
    // Use explicit navigation to avoid redirect timing (\n/clients/list -> /clients)
    await page.goto(`${FRONTEND}/clients`, { waitUntil: 'domcontentloaded' });
    const table = page.locator('.ant-pro-table').first();
    const addBtn = page.getByRole('button', { name: /Add Client/i }).first();
    const searchInput = page.getByPlaceholder(/Search clients|Search/i).first();
    // Wait for any one of the ready markers with shorter sequential timeouts
    try {
      await expect(table).toBeVisible({ timeout: 20000 });
    } catch {
      try {
        await expect(addBtn).toBeVisible({ timeout: 20000 });
      } catch {
        await expect(searchInput).toBeVisible({ timeout: 20000 });
      }
    }
  });
});
