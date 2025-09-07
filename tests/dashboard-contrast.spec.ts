import { test, expect } from '@playwright/test';

// Helpers to compute WCAG contrast ratio in the browser context
const scriptContrastHelpers = () => {
  function parseRGB(input: string) {
    const m = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 };
  }
  function rel(c: number) {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  function luminance(rgb: { r: number; g: number; b: number }) {
    return 0.2126 * rel(rgb.r) + 0.7152 * rel(rgb.g) + 0.0722 * rel(rgb.b);
  }
  function contrast(rgb1: any, rgb2: any) {
    const L1 = luminance(rgb1) + 0.05;
    const L2 = luminance(rgb2) + 0.05;
    return L1 > L2 ? L1 / L2 : L2 / L1;
  }
  return { parseRGB, contrast };
};

test.describe('Dashboard contrast audit', () => {
  test('Page header and cards have adequate contrast', async ({ page }) => {
    // Start dev server separately (npm run dev) and set BASE_URL via env if non-default
    const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
    await page.goto(`${base}/dashboard`);

    // Ensure page header title is visible and has contrast >= 4.5 against page container bg
    const hasGoodHeaderContrast = await page.evaluate(({ helpers }) => {
      const { parseRGB, contrast } = (helpers as any)();
      const header = document.querySelector('.ant-page-header-heading-title') as HTMLElement | null;
      if (!header) return { ok: false, reason: 'Header title not found' };
      const cs = getComputedStyle(header);
      const color = parseRGB(cs.color);
      // Try nearest container bg or fall back to body
      let el: HTMLElement | null = header;
      let bg: any = null;
      while (el && !bg) {
        const bgc = getComputedStyle(el).backgroundColor;
        const parsed = parseRGB(bgc);
        if (parsed && parsed.a > 0) bg = parsed;
        el = el.parentElement;
      }
      if (!bg) {
        const b = getComputedStyle(document.body).backgroundColor;
        bg = parseRGB(b);
      }
      if (!color || !bg) return { ok: false, reason: 'Could not parse colors' };
      const ratio = contrast(color, bg);
      return { ok: ratio >= 4.5, ratio };
    }, { helpers: scriptContrastHelpers.toString() });

    expect(hasGoodHeaderContrast.ok, `Header contrast ratio = ${(hasGoodHeaderContrast as any).ratio}`).toBeTruthy();

    // Check first few cards for readable text vs card background
    const badCards = await page.evaluate(({ helpers }) => {
      const { parseRGB, contrast } = (helpers as any)();
      const cards = Array.from(document.querySelectorAll('.ant-card')) as HTMLElement[];
      const issues: { index: number; ratio: number }[] = [];
      cards.slice(0, 6).forEach((card, idx) => {
        const csCard = getComputedStyle(card);
        const bg = parseRGB(csCard.backgroundColor);
        // Pick a typical text element inside the card
        const textEl = card.querySelector('h1, h2, h3, h4, h5, .ant-typography, span, p, div') as HTMLElement | null;
        if (!textEl || !bg) return;
        const csText = getComputedStyle(textEl);
        const color = parseRGB(csText.color);
        if (!color) return;
        const ratio = contrast(color, bg);
        if (ratio < 4.5) issues.push({ index: idx, ratio });
      });
      return issues;
    }, { helpers: scriptContrastHelpers.toString() });

    expect(badCards, `Low-contrast cards detected: ${JSON.stringify(badCards)}`).toHaveLength(0);
  });
});

