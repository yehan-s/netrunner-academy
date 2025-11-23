import { test, expect } from '@playwright/test';

test.describe('case_03 - SQL 注入基础', () => {
  test('用户可以通过注入 payload 触发关卡成功', async ({ page }) => {
    await page.goto('/');

    // 打开任务列表
    await page.getByText('Mission Select').click();

    // 选择 SQL 注入基础关卡
    await page.getByText('SQL 注入基础').click();

    // 使用 Reqable Composer 直接构造带注入 payload 的请求
    await page.getByTestId('reqable-tab-composer').click();

    // GET 请求到带有 SQL 注入参数的搜索接口
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('GET');

    await page
      .getByTestId('reqable-composer-url')
      .fill(\"https://hr.corp/search?q=' OR '1'='1\");

    // 发送请求
    await page.getByTestId('reqable-composer-send').click();

    // 期望提示任务完成（SQL 注入利用成功）
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});

