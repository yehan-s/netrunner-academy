import { test, expect } from '@playwright/test';

// Story 12：特性开关回退（DevTools Console 热补丁）

test.describe('Story 12 - 特性开关回退', () => {
  test('在 DevTools Console 中执行热补丁脚本即可通关', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await expect(page.getByText(/特性开关回退/)).toBeVisible();
    await page.getByText(/特性开关回退/).click();

    await page.getByTestId('devtools-tab-console').click();
    const consoleInput = page.locator('#console-input');
    await consoleInput.fill("window.featureFlags.forceLegacyFlow(true)");
    await consoleInput.press('Enter');

    await expect(page.getByText('MISSION ACCOMPLISHED')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Next Level' }).click();
  });
});
