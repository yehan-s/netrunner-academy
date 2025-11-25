import { test, expect } from '@playwright/test';

// 微信剧情模式 + Story 关卡联动测试（剧情 1）
// 目标：
// 1. 从 Dock 打开 WeChat 剧情模式，选择“周五晚高峰”故事线；
// 2. 推进剧情直到出现绑定 story_01_login_outage 的任务消息，此时“下一条消息”按钮应被禁用并提示先完成任务；
// 3. 通过消息中的“查看任务”按钮跳转到对应 Story 关卡，使用 Reqable Composer 完成修复登录接口的操作；
// 4. 通关后返回 WeChat，再次进入剧情，确认按钮解锁并可以继续推进下一条消息。

test.describe('WeChat 剧情模式 - 剧情 1 与 Story 关卡联动', () => {
  test('剧情 gating 与 story_01_login_outage 通关状态一致', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);

    // 1. 打开 WeChat 剧情模式
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换
    // 选择“周五晚高峰 · 微信投放引发的连锁事故”剧情
    await page
      .getByText('周五晚高峰 · 微信投放引发的连锁事故')
      .first()
      .click();
    await page
      .getByRole('button', { name: /开始剧情|继续剧情|继续当前剧情/ })
      .click();

    // 确认进入群聊视图：默认选中左侧会话后才会出现
    await page.getByText('线上事故处理群 (34)', { exact: true }).click();

    // 2. 推进剧情直到出现绑定 story_01_login_outage 的任务消息
    const taskButton = page.getByRole('button', {
      name: /查看任务: story_01_login_outage/,
    });

    for (let i = 0; i < 10; i++) {
      if (await taskButton.isVisible()) break;
      const nextBtn = page.getByRole('button', { name: '下一条消息' });
      if (!(await nextBtn.isVisible())) break; // 如果按钮变成禁用状态，停止循环
      await nextBtn.click();
      await page.waitForTimeout(1200); // 等待 typing 动画
    }

    await expect(taskButton).toBeVisible();

    // 此时不允许继续往下推进剧情，需要先完成任务
    const blockedNextBtn = page.getByRole('button', {
      name: '请先完成上一个任务',
    });
    await expect(blockedNextBtn).toBeVisible();
    await expect(blockedNextBtn).toBeDisabled();

    // 3. 通过“查看任务”跳转到 Story 关卡，并用 Reqable 完成登录修复
    await taskButton.click();

    // 打开 Reqable Composer
    await page.getByTestId('reqable-tab-composer').click();

    // 设置 Method 为 POST
    await page.getByTestId('reqable-composer-method').selectOption('POST');

    // 设置修复后的 v2 登录接口 URL
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://api-legacy.corp/api/v2/login');

    // 填写合法 JSON 请求体
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"username":"demo","password":"demo"}');

    // 发送请求触发通关
    await page.getByTestId('reqable-composer-send').click();

    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });

    // 关闭成功弹窗（进入下一关对 gating 没影响，关键是 completedCases 中已有 story_01_login_outage）
    await page.getByRole('button', { name: 'Next Level' }).click();

    // 4. 返回 WeChat，确认剧情按钮解锁，可以继续推进
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换
    // 直接处于群聊视图，此时按钮文案应从“请先完成上一个任务”变为“下一条消息”
    const nextBtn = page.getByRole('button', { name: '下一条消息' });
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeEnabled();
  });
});
