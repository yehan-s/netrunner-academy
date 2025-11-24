import { test, expect } from '@playwright/test';

test.describe('case_04 - 越权访问 (IDOR)', () => {
  test('用户通过修改订单 ID 触发 IDOR 关卡成功', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 打开任务列表并选择 IDOR 关卡
    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await page.getByText('越权访问 (IDOR)').click();

    // 切换到 Reqable Composer
    await page.getByTestId('reqable-tab-composer').click();

    // 使用 GET 方法访问篡改后的订单 ID
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('GET');

    await page
      .getByTestId('reqable-composer-url')
      .fill('https://shop.demo/api/orders/1002');

    // 发送请求
    await page.getByTestId('reqable-composer-send').click();

    // IDOR 关卡成功会显示通关弹窗
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});

