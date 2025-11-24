import { test } from '@playwright/test';
import {
  openPolyfillStory,
  advanceToTask,
  completePolyfillCase,
  POLYFILL_CASE_IDS,
  reopenWeChat,
  syncLatestClue,
} from './utils/wechatPolyfill';

test.describe('Story 10 - Reqable 规则临时止血', () => {
  test('提交包含 analytics.polyfill.io 的规则并通关', async ({ page }) => {
    await openPolyfillStory(page);
    await advanceToTask(page, POLYFILL_CASE_IDS.IOC);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.IOC);
    await reopenWeChat(page);
    await syncLatestClue(page);

    await advanceToTask(page, POLYFILL_CASE_IDS.TLS);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.TLS);
    await reopenWeChat(page);
    await syncLatestClue(page);

    await advanceToTask(page, POLYFILL_CASE_IDS.RULE);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.RULE);
  });
});
