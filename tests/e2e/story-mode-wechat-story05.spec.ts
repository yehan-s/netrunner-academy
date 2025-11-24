import { test, expect } from '@playwright/test';

// story_05_metrics_misleading：通过 Reqable 查看埋点原始数据并识别监控偏差

test.describe('Story 05 - 埋点误报与监控偏差', () => {
  test('在监控大盘界面触发埋点原始数据请求并通关', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 打开任务列表并进入剧情关卡
    await page.getByTestId('task-sidebar').getByText('Mission Select').click();
    await page.getByText('剧情 · 埋点误报与监控偏差').click();

    // 确认监控大盘 UI 已加载
    await expect(
      page.getByText('订单转化监控 · 关键指标'),
    ).toBeVisible();

    // 在页面点击“埋点原始数据”按钮，触发 /metrics/raw 请求
    await page.evaluate(() => {
      document.getElementById('metrics-raw-btn')?.click();
    });

    // Story 05 通关：出现成功弹窗
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
  });
});
