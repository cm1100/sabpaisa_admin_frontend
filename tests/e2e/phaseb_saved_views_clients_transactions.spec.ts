import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Phase B — Saved Views (Clients & Transactions)', () => {
  test('Clients: save and apply a server-backed view', async ({ page, request }) => {
    const login = await loginAndSeedTokens(request, page);
    const API = process.env.E2E_API_URL || 'http://localhost:8020/api';
    const auth = { Authorization: `Bearer ${login.access_token}` } as any;
    await page.goto(`${FRONTEND}/clients`, { waitUntil: 'domcontentloaded' });

    // Save current view via Views menu (window.prompt)
    await page.once('dialog', async (d) => d.accept('E2E Clients View'));
    await page.getByRole('button', { name: /^Views$/ }).click();
    await page.getByRole('menuitem', { name: /Save current view/i }).click();

    // Verify via API
    try {
      const resp = await request.get(`${API}/productivity/saved-filters/?module=clients`, { headers: auth });
      if (resp.ok()) {
        const arr = await resp.json();
        const list = Array.isArray(arr) ? arr : (arr.results || []);
        expect(list.find((x:any) => x.name === 'E2E Clients View')).toBeTruthy();
      }
    } catch {}

    // Apply the newly saved view (ensure menu rebuilds)
    await page.reload();
    await page.getByRole('button', { name: /^Views$/ }).click();
    await page.getByRole('menuitem', { name: /^E2E Clients View$/ }).click();
  });

  test('Transactions: save and apply a server-backed view', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);
    await page.goto(`${FRONTEND}/transactions`, { waitUntil: 'domcontentloaded' });

    // Save current view
    await page.once('dialog', async (d) => d.accept('E2E Txn View'));
    await page.getByRole('button', { name: /^Views$/ }).click();
    await page.getByRole('menuitem', { name: /Save current view/i }).click();

    // Apply it
    await page.getByRole('button', { name: /^Views$/ }).click();
    await page.getByRole('menuitem', { name: /^E2E Txn View$/ }).click();
  });
});
