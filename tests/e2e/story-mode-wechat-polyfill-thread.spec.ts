import { test, expect } from '@playwright/test';
import {
  openPolyfillStory,
  advanceToTask,
  completePolyfillCase,
  POLYFILL_CASE_IDS,
  reopenWeChat,
  syncLatestClue,
} from './utils/wechatPolyfill';

// 验证新的「Polyfill 供应链夜班」剧情线程：
// 1. Dock -> WeChat -> 剧情列表 -> 选择并开始剧情；
// 2. 推进至 scene-33，确认 gating 需要 story_08 并禁用按钮；
// 3. 完成 story_08 关卡后返回微信，点击“同步线索”才可解锁下一条；
// 4. 刷新页面后，剧情进度与已同步线索状态仍然保留。

test.describe('WeChat 剧情线程 - Polyfill 供应链夜班', () => {
  test('任务完成 + 线索同步 + 刷新持久化', async ({ page }) => {
    await openPolyfillStory(page);
    await advanceToTask(page, POLYFILL_CASE_IDS.IOC);

    const blockedBtn = page.getByRole('button', { name: '请先完成上一个任务' });
    await expect(blockedBtn).toBeDisabled();

    await completePolyfillCase(page, POLYFILL_CASE_IDS.IOC);
    await reopenWeChat(page);
    await syncLatestClue(page);

    for (let i = 0; i < 3; i++) {
      if (await page.getByText('在 Reqable 里看到 polyfill 脚本会解码出一个', { exact: false }).nth(1).isVisible().catch(() => false)) {
        break;
      }
      await page.getByRole('button', { name: '下一条消息' }).click();
    }
    await expect(
      page.getByText('在 Reqable 里看到 polyfill 脚本会解码出一个', { exact: false }).nth(1),
    ).toBeVisible();

    await page.reload();
    await reopenWeChat(page);
    await expect(
      page.getByText('在 Reqable 里看到 polyfill 脚本会解码出一个', { exact: false }).nth(1),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '下一条消息' })).toBeEnabled();
  });
});
