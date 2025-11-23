import { test, expect } from '@playwright/test';

test.describe('case_01 - API 协议分析与构造', () => {
  test('用户可以通过 Reqable Composer 修复登录接口并通关', async ({ page }) => {
    await page.goto('/');

    // 确认已处于 case_01
    await expect(page.getByText('API 协议分析与构造')).toBeVisible();

    // 打开 Reqable 的 Composer 视图
    await page.getByTestId('reqable-tab-composer').click();

    // 设置 Method 为 POST
    await page.getByTestId('reqable-composer-method').selectOption('POST');

    // 设置修复后的 v2 登录接口 URL
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://api-legacy.corp/api/v2/login');

    // 填写一个合法的 JSON 请求体
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"username":"demo","password":"demo"}');

    // 发送请求
    await page.getByTestId('reqable-composer-send').click();

    // 关卡成功：出现通关弹窗
    await expect(page.getByText('MISSION ACCOMPLISHED')).toBeVisible({
      timeout: 5000,
    });
  });
});

