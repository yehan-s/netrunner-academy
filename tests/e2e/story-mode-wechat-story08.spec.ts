import { test } from '@playwright/test';
import {
  openPolyfillStory,
  advanceToTask,
  completePolyfillCase,
  POLYFILL_CASE_IDS,
} from './utils/wechatPolyfill';

test.describe('Story 08 - polyfill 供应链劫持', () => {
  test('抓取被劫持的 polyfill 并通关', async ({ page }) => {
    await openPolyfillStory(page);
    await advanceToTask(page, POLYFILL_CASE_IDS.IOC);
    await completePolyfillCase(page, POLYFILL_CASE_IDS.IOC);
  });
});
