import { test } from '@playwright/test';
import {
  openPolyfillStory,
  advanceToTask,
  completePolyfillCase,
  POLYFILL_CASE_IDS,
  reopenWeChat,
  syncLatestClue,
} from './utils/wechatPolyfill';

test.describe('Story 09 - TLS 兼容与 HTTP/1.1 回落', () => {
  test('执行 HTTP/1.1 回退验证并通关', async ({ page }) => {
    await openPolyfillStory(page);
    await advanceToTask(page, POLYFILL_CASE_IDS.IOC);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.IOC);
    await reopenWeChat(page);
    await syncLatestClue(page);

    await advanceToTask(page, POLYFILL_CASE_IDS.TLS);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.TLS);
  });
});
