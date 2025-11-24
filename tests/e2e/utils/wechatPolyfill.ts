import { expect, Page } from '@playwright/test';

export const POLYFILL_CASE_IDS = {
  IOC: 'story_polyfill_ioc_capture',
  TLS: 'story_polyfill_tls_fallback',
  RULE: 'story_polyfill_reqable_rule',
  CDN: 'story_polyfill_cdn_validation',
} as const;

type PolyfillCaseId = (typeof POLYFILL_CASE_IDS)[keyof typeof POLYFILL_CASE_IDS];

export async function openPolyfillStory(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('netrunner_wechat_state_v3');
    localStorage.removeItem('netrunner_completed_cases_v1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.netrunnerOpenApp === 'function');
  await page.evaluate(() => {
    window.netrunnerOpenApp?.('wechat');
  });
  const storyTab = page.getByTestId('wechat-side-剧情剧本');
  await storyTab.waitFor({ timeout: 5000 });
  await storyTab.click();
  const storyCard = page.getByText('Polyfill 供应链夜班').first();
  await storyCard.waitFor({ timeout: 5000 });
  await storyCard.click();
  await page.getByRole('button', { name: /开始剧情|继续剧情|继续当前剧情/ }).click();
}

export async function reopenWeChat(page: Page) {
  await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
}

export async function advanceToTask(page: Page, caseId: PolyfillCaseId) {
  const taskButton = page.getByRole('button', { name: new RegExp(`查看任务: ${caseId}`) });
  for (let i = 0; i < 200; i++) {
    if (await taskButton.isVisible().catch(() => false)) return;
    await page.getByRole('button', {
      name: /下一条消息|请先完成上一个任务|请先同步线索|剧情已全部解锁/,
    }).click();
  }
  throw new Error(`Task button not found for ${caseId}`);
}

export async function completePolyfillCase(page: Page, caseId: PolyfillCaseId) {
  await page.getByRole('button', { name: new RegExp(`查看任务: ${caseId}`) }).click();
  switch (caseId) {
    case POLYFILL_CASE_IDS.IOC:
      await page.evaluate(() => {
        document.getElementById('polyfill-fetch-btn')?.click();
      });
      break;
    case POLYFILL_CASE_IDS.TLS:
      await page.evaluate(() => {
        document.getElementById('tls-h2-btn')?.click();
      });
      await page.evaluate(() => {
        document.getElementById('tls-fallback-btn')?.click();
      });
      break;
    case POLYFILL_CASE_IDS.RULE:
      await page.evaluate(() => {
        document.getElementById('reqable-rule-btn')?.click();
      });
      break;
    case POLYFILL_CASE_IDS.CDN:
      await page.evaluate(() => {
        document.getElementById('cdn-validate-btn')?.click();
      });
      break;
    default:
      throw new Error(`Unhandled case id ${caseId}`);
  }
  await expect(page.getByText('MISSION ACCOMPLISHED')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Next Level' }).click();
}

export async function syncLatestClue(page: Page) {
  const syncButton = page.getByRole('button', { name: '同步线索' }).first();
  await expect(syncButton).toBeVisible();
  await syncButton.click();
}
