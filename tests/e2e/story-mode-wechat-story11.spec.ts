import { test } from '@playwright/test';
import {
  openPolyfillStory,
  advanceToTask,
  completePolyfillCase,
  POLYFILL_CASE_IDS,
  reopenWeChat,
  syncLatestClue,
} from './utils/wechatPolyfill';

test.describe('Story 11 - CDN Purge 验证', () => {
  test('刷新自托管 polyfill 并校验缓存', async ({ page }) => {
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
    await reopenWeChat(page);
    await syncLatestClue(page);

    await advanceToTask(page, POLYFILL_CASE_IDS.CDN);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.CDN);
  });
});
