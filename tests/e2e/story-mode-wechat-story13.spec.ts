import { test, expect } from '@playwright/test';

// Story 13：灰度策略回滚（Reqable Composer 调用 override API）

test.describe('Story 13 - 灰度策略回滚', () => {
  test('使用 Reqable Composer 调用 override API 并通关', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);
    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await expect(page.getByText(/灰度策略回滚/)).toBeVisible();
    await page.getByText(/灰度策略回滚/).click();

    await page.getByTestId('reqable-tab-composer').click();
    await page.getByTestId('reqable-composer-method').selectOption('POST');
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://ops.corp/api/gray-release/override');
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"experimentId":"wechat-ab-992","action":"disable","reason":"incident-hotfix","owner":"wechat-security"}');
    await page.getByTestId('reqable-composer-send').click();

    await expect(page.getByText('MISSION ACCOMPLISHED')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Next Level' }).click();
  });
});
