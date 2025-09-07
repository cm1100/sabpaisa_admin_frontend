import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';
const API = process.env.E2E_API_URL || 'http://localhost:8020/api';

test.describe('Phase B — Audits & Logs UI', () => {
  test('Create a notification log via API, then view in UI with JSON viewer', async ({ page, request }) => {
    const login = await loginAndSeedTokens(request, page);
    const token = login.access_token || '';
    const auth = token ? { Authorization: `Bearer ${token}` } : {} as any;

    // Seed one log
    const seed = await request.post(`${API}/audits/notification-logs/`, {
      headers: auth,
      data: {
        channel: 'email',
        recipient: 'qa@example.com',
        template: 'e2e_notice',
        payload: { hello: 'world', run: 'phaseB' },
        status: 'SENT',
        response_code: '200',
      }
    });
    if (!seed.ok()) {
      test.skip(true, 'Auth not available to seed logs. Set E2E_USER/E2E_PASS to a valid admin.');
    }

    // Open UI and check
    await page.goto(`${FRONTEND}/admin/audits`, { waitUntil: 'domcontentloaded' });
    // Switch to Notification Logs tab
    await page.getByRole('tab', { name: /Notification Logs/i }).click();
    const row = page.getByRole('row', { name: /qa@example\.com/ }).first();
    await expect(row).toBeVisible();
    // Open JSON viewer in that row
    await row.getByRole('button', { name: /View/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/hello/)).toBeVisible();
  });
});
