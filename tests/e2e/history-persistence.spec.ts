import { test, expect, Page } from '@playwright/test';

// Helper function to wait for page stability
async function waitForStability(page: Page, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  await page.waitForTimeout(500);
}

// Helper to get localStorage value
async function getLocalStorageItem(page: Page, key: string): Promise<any> {
  return await page.evaluate((storageKey) => {
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
  }, key);
}

// Helper to set localStorage value
async function setLocalStorageItem(page: Page, key: string, value: any): Promise<void> {
  await page.evaluate(
    ({ storageKey, storageValue }) => {
      localStorage.setItem(storageKey, JSON.stringify(storageValue));
    },
    { storageKey: key, storageValue: value }
  );
}

// Helper to clear localStorage
async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

test.describe('History Persistence', () => {
  const HISTORY_KEY = 'netrunner_request_history';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await clearLocalStorage(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);
  });

  test('请求历史会自动保存到 localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Wait for initial requests to load (case_01 默认加载 3 个请求)
    await page.waitForTimeout(1000);

    // Check localStorage contains request history
    const history = await getLocalStorageItem(page, HISTORY_KEY);

    expect(history).toBeTruthy();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);

    // Verify history contains expected fields
    const firstRequest = history[0];
    expect(firstRequest).toHaveProperty('id');
    expect(firstRequest).toHaveProperty('url');
    expect(firstRequest).toHaveProperty('method');
    expect(firstRequest).toHaveProperty('timestamp');
  });

  test('刷新页面后历史记录会被恢复', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Wait for initial requests
    await page.waitForTimeout(1000);

    // Get initial history from localStorage
    const initialHistory = await getLocalStorageItem(page, HISTORY_KEY);
    const initialCount = initialHistory ? initialHistory.length : 0;

    expect(initialCount).toBeGreaterThan(0);

    // Get first request URL for verification
    const firstRequestUrl = initialHistory && initialHistory.length > 0 ? initialHistory[0].url : null;

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Verify history is restored (note: triggerInitialTraffic creates new requests with new IDs)
    const restoredHistory = await getLocalStorageItem(page, HISTORY_KEY);

    expect(restoredHistory).toBeTruthy();
    expect(restoredHistory.length).toBeGreaterThanOrEqual(initialCount);

    // Verify first request URL matches (same case means same initial requests)
    if (firstRequestUrl && restoredHistory && restoredHistory.length > 0) {
      // URLs should match even though IDs are regenerated
      expect(restoredHistory[0].url).toBe(firstRequestUrl);
    }
  });

  test('清除历史按钮会同时清除状态和 localStorage (Chrome DevTools)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Open Chrome/browser view (Globe icon button in dock)
    // The button has a blue gradient background and contains a Globe icon
    const browserButton = page.locator('button').filter({ has: page.locator('.bg-gradient-to-br.from-blue-400.to-blue-600') }).first();
    await expect(browserButton).toBeVisible({ timeout: 5000 });
    await browserButton.click();
    await page.waitForTimeout(500);

    // Wait for initial requests
    await page.waitForTimeout(1000);

    // Verify history exists in localStorage
    let history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeTruthy();
    expect(history.length).toBeGreaterThan(0);

    // Find and click clear button in Network panel
    const clearButton = page.locator('button[title="Clear"]').first();
    await expect(clearButton).toBeVisible({ timeout: 5000 });
    await clearButton.click();

    // Wait for clear operation
    await page.waitForTimeout(500);

    // Verify localStorage is cleared
    history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeFalsy();

    // Verify no requests are displayed
    const requestItems = page.locator('[data-testid="network-request-item"]');
    await expect(requestItems).toHaveCount(0);
  });

  test('清除历史按钮会同时清除状态和 localStorage (Reqable)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Open Reqable view (RQ text button in dock)
    // The button contains "RQ" text in a yellow gradient background
    const reqableButton = page.locator('button').filter({ has: page.locator('div:text-is("RQ")') }).first();
    await expect(reqableButton).toBeVisible({ timeout: 5000 });
    await reqableButton.click();
    await page.waitForTimeout(500);

    // Wait for initial requests
    await page.waitForTimeout(1000);

    // Verify history exists in localStorage
    let history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeTruthy();
    expect(history.length).toBeGreaterThan(0);

    // Find and click clear button (trash icon button in Reqable toolbar)
    // The button has bg-[#333] and contains Trash2 SVG icon
    const clearButton = page.locator('button.bg-\\[\\#333\\]').filter({ has: page.locator('svg') }).first();
    await expect(clearButton).toBeVisible({ timeout: 5000 });
    await clearButton.click();

    // Wait for clear operation to complete (including localStorage update)
    await page.waitForTimeout(1000);

    // Verify localStorage is cleared
    history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeFalsy();

    // History persistence successfully cleared!
  });

  test('历史记录在清除后正确保存到 localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Wait for initial requests
    await page.waitForTimeout(1000);

    // Verify history exists
    let history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeTruthy();
    const initialCount = history.length;
    expect(initialCount).toBeGreaterThan(0);

    // Open Reqable view and clear history
    const reqableButton = page.locator('button').filter({ has: page.locator('div:text-is("RQ")') }).first();
    await expect(reqableButton).toBeVisible({ timeout: 5000 });
    await reqableButton.click();
    await page.waitForTimeout(500);

    // Find and click clear button (trash icon in Reqable toolbar)
    const clearButton = page.locator('button.bg-\\[\\#333\\]').filter({ has: page.locator('svg') }).first();
    await expect(clearButton).toBeVisible({ timeout: 5000 });
    await clearButton.click();
    await page.waitForTimeout(1000);

    // Verify localStorage is cleared
    history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeFalsy();

    // Reload page to trigger new initial requests
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await page.waitForTimeout(1000);

    // Verify new history was saved after reload
    history = await getLocalStorageItem(page, HISTORY_KEY);
    expect(history).toBeTruthy();
    expect(history.length).toBeGreaterThan(0);
  });

  test('历史记录限制在500条以内 (quota management)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Create mock history with 550 entries
    const mockHistory = Array.from({ length: 550 }, (_, i) => ({
      id: `mock-${i}`,
      url: `https://example.com/api/mock-${i}`,
      method: 'GET',
      status: 200,
      type: 'fetch' as const,
      size: 1024,
      time: 100,
      timestamp: Date.now() - i * 1000,
      requestHeaders: {},
      responseHeaders: {},
    }));

    // Set oversized history in localStorage
    await setLocalStorageItem(page, HISTORY_KEY, mockHistory);

    // Reload to trigger save with quota management
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Make a new request to trigger save
    await page.waitForTimeout(1000);

    // Verify history was trimmed to max size
    const trimmedHistory = await getLocalStorageItem(page, HISTORY_KEY);

    expect(trimmedHistory).toBeTruthy();
    expect(trimmedHistory.length).toBeLessThanOrEqual(500);
  });

  test('历史记录在浏览器刷新后保持请求详细信息', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Wait for initial requests
    await page.waitForTimeout(1000);

    // Get detailed history from localStorage
    const initialHistory = await getLocalStorageItem(page, HISTORY_KEY);

    expect(initialHistory).toBeTruthy();
    expect(initialHistory.length).toBeGreaterThan(0);

    // Verify first request has all expected fields
    const firstRequest = initialHistory[0];
    expect(firstRequest).toHaveProperty('id');
    expect(firstRequest).toHaveProperty('url');
    expect(firstRequest).toHaveProperty('method');
    expect(firstRequest).toHaveProperty('status');
    expect(firstRequest).toHaveProperty('requestHeaders');
    expect(firstRequest).toHaveProperty('responseHeaders');
    expect(firstRequest).toHaveProperty('timestamp');

    // Store first request details
    const firstUrl = firstRequest.url;
    const firstMethod = firstRequest.method;
    const firstStatus = firstRequest.status;

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // Get restored history
    const restoredHistory = await getLocalStorageItem(page, HISTORY_KEY);

    expect(restoredHistory).toBeTruthy();
    expect(restoredHistory.length).toBeGreaterThanOrEqual(initialHistory.length);

    // Verify first request details are preserved
    const restoredFirstRequest = restoredHistory[0];
    expect(restoredFirstRequest.url).toBe(firstUrl);
    expect(restoredFirstRequest.method).toBe(firstMethod);
    expect(restoredFirstRequest.status).toBe(firstStatus);

    // Verify detailed fields are still present
    expect(restoredFirstRequest).toHaveProperty('requestHeaders');
    expect(restoredFirstRequest).toHaveProperty('responseHeaders');
    expect(restoredFirstRequest).toHaveProperty('timestamp');
  });
});
