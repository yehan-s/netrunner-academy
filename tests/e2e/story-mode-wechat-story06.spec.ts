import { test, expect } from '@playwright/test';

// story_06_stacktrace_leak：异常栈直出关卡完整流程

test.describe('Story 06 - 异常栈直出与信息泄露', () => {
  test('复现 /api/orders/error 并触发通关', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await page.getByText('剧情 · 异常栈直出与信息泄露').click();

    await expect(
      page.getByText('订单详情 · 错误页面'),
    ).toBeVisible();

    await page.evaluate(() => {
      document.getElementById('stacktrace-fetch-btn')?.click();
    });

    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});
