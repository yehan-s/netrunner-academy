import { test, expect } from '@playwright/test';

test.describe('case_02 - 逻辑漏洞：价格篡改', () => {
  test('用户可以通过修改 JSON 价格参数完成购买', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);
    // 打开任务列表
    await page.getByTestId('task-sidebar').getByText('Mission Select').click();

    // 在列表中选择“逻辑漏洞：价格篡改”
    await page.getByText('逻辑漏洞：价格篡改').click();

    // 切换到 Reqable Composer 视图
    await page.getByTestId('reqable-tab-composer').click();

    // 设置为 POST 方法
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('POST');

    // 目标 URL：模拟支付接口
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://shop.demo/checkout');

    // 将价格改为 1 元
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"itemId":1001,"price":1}');

    // 发送修改后的请求
    await page.getByTestId('reqable-composer-send').click();

    // 期望出现通关提示（与 case_01 一致的成功弹窗）
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});

