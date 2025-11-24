import { test, expect } from '@playwright/test';

// story_07_waf_callback：支付回调被 WAF 拦截

test.describe('Story 07 - 支付回调被 WAF 拦截', () => {
  test('通过临时放行 Header 触发回调成功', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await page.getByText('剧情 · 支付回调被 WAF 拦截').click();

    await expect(
      page.getByText('支付回调监控 · WAF 拦截'),
    ).toBeVisible();

    // 先点击复现回调按钮，提示会被 WAF 拦
    await page.evaluate(() => {
      document.getElementById('waf-preview-btn')?.click();
    });

    // 再点击带 X-WAF-Allow 的按钮，触发成功
    await page.evaluate(() => {
      document.getElementById('waf-allow-btn')?.click();
    });

    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});
