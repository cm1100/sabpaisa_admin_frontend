import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Phase B — Client Templates Integration', () => {
  test('Create template then apply it to Clients form', async ({ page, request }) => {
    const login = await loginAndSeedTokens(request, page);
    if (!login.access_token) {
      test.skip(true, 'Auth not available. Set E2E_USER/E2E_PASS to a valid admin.');
    }

    // Create template
    await page.goto(`${FRONTEND}/clients/templates`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /New Template/i }).click();
    await page.getByPlaceholder(/Education Basic Client/i).fill('E2E Client Template');
    await page.getByPlaceholder(/existing client code/i).fill('E2E-BASE');
    await page.getByRole('switch').first().check();
    await page.locator('textarea').first().fill(JSON.stringify({
      name: 'E2E Co.',
      clientCode: 'E2E001',
      industry: 'Education',
      email: 'e2e@example.com',
      risk_category: 3
    }));
    await page.getByRole('button', { name: /Create|Add|Save|New Template/i }).first().click();

    // Go to Clients and apply template via toolbar
    await page.goto(`${FRONTEND}/clients`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Templates$/ }).click();
    await page.getByRole('menuitem', { name: /E2E Client Template/ }).click();

    // Modal opens prefilled
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByPlaceholder(/Enter client name/i)).toHaveValue('E2E Co.');
    await expect(page.getByPlaceholder(/e\.g\.,? CLT001/i)).toHaveValue('E2E001');
    await expect(page.getByText(/Risk Category/i)).toBeVisible();
  });
});
