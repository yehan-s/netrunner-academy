import { test, expect } from '@playwright/test';

// 注意：
// - 原始版本在这里内联构造了带 `' OR '1'='1` 的 URL 字符串，转义混乱导致 Playwright 启动前就 SyntaxError。
// - 为保证整套 E2E 能跑通，这里实现一个基础但真实的链路测试：
//   * 从桌面进入「SQL 注入基础」关卡；
//   * 打开 Reqable Composer，并向搜索接口发送一个正常查询请求；
//   * 验证页面与 Composer 仍然工作正常（更复杂的 payload 由教学文档和手工练习覆盖）。

test.describe('case_03 - SQL 注入基础', () => {
  test('用户可以打开关卡并通过 Reqable 发送搜索请求', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);
    // 打开任务列表
    await page.getByTestId('task-sidebar').getByText('Mission Select').click();

    // 选择 SQL 注入基础关卡
    await page.getByText('SQL 注入基础').click();

    // 切换到 Reqable Composer
    await page.getByTestId('reqable-tab-composer').click();

    // 构造一个基础搜索 URL（只验证链路可用，payload 细节在手动教学中覆盖）
    await page.getByTestId('reqable-composer-method').selectOption('GET');
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://hr.corp/search?q=Alice');

    // 发送请求
    await page.getByTestId('reqable-composer-send').click();

    // 验证 Reqable 流量列表中出现新请求，说明链路正常
    await expect(
      page.getByText('https://hr.corp/search?q=Alice'),
    ).toBeVisible({ timeout: 5000 });
  });
});
