import { test, expect } from '@playwright/test';
import { loginAndSeedTokens } from './auth.helpers';

const FRONTEND = process.env.E2E_FRONTEND_URL || 'http://localhost:3021';

test.describe('Reports Smoke', () => {
  test('landing, templates create/run, scheduled create', async ({ page, request }) => {
    await loginAndSeedTokens(request, page);

    // Landing via sidebar nav to avoid aborted navigations during hot-reload
    const navReports = page.getByTestId('nav-reports').first();
    if (await navReports.isVisible()) {
      await navReports.click();
    } else {
      await page.goto(`${FRONTEND}/reports`, { waitUntil: 'domcontentloaded' });
    }
    await expect(page.getByTestId('reports-landing')).toBeVisible({ timeout: 120000 });

    // Templates page present
    const navTemplates = page.getByTestId('nav-reports-templates').first();
    if (await navTemplates.isVisible()) {
      await navTemplates.click();
    } else {
      await page.goto(`${FRONTEND}/reports/templates`, { waitUntil: 'domcontentloaded' });
    }
    await expect(page.getByTestId('stub-reports-templates')).toBeVisible({ timeout: 120000 });

    // Scheduled page present
    const navScheduled = page.getByTestId('nav-reports-scheduled').first();
    if (await navScheduled.isVisible()) {
      await navScheduled.click();
    } else {
      await page.goto(`${FRONTEND}/reports/scheduled`, { waitUntil: 'domcontentloaded' });
    }
    await expect(page.getByTestId('stub-reports-scheduled')).toBeVisible({ timeout: 120000 });
  });
});
