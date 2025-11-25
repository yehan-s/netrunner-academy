import { test, expect, Page } from '@playwright/test';

// Helper to setup localStorage before page load
async function setupLocalStorage(page: Page, key: string, value: any) {
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, { key, value });
}

// Helper to wait for page stability
const waitForStability = async (page: Page) => {
  await page.waitForTimeout(2000);
};

// Helper to switch to Reqable view
async function switchToReqable(page: Page) {
  await page.getByRole('button', { name: 'Reqable' }).click();
  await page.waitForTimeout(500);
}

test.describe('Phase 3 - Network Throttling', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_throttle_config');
    });
  });

  test('用户可以打开网络节流对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    // 点击 Network Throttling 按钮
    await page.locator('button[title="Network Throttling"]').click();

    // 验证对话框出现
    await expect(page.locator('h2:has-text("网络节流")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('模拟不同网络环境')).toBeVisible();
  });

  test('显示预设网络配置列表', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Network Throttling"]').click();
    await expect(page.locator('h2:has-text("网络节流")')).toBeVisible({ timeout: 10000 });

    // 验证预设配置显示
    await expect(page.getByText('No Throttling')).toBeVisible();
    await expect(page.getByText('Offline')).toBeVisible();
    await expect(page.getByText('Slow 3G')).toBeVisible();
    await expect(page.getByText('Fast 3G')).toBeVisible();
  });

  test('用户可以选择预设配置', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Network Throttling"]').click();
    await expect(page.locator('h2:has-text("网络节流")')).toBeVisible({ timeout: 10000 });

    // 选择 Slow 3G
    await page.getByText('Slow 3G').click();

    // 验证状态更新
    await expect(page.getByText('当前状态: Slow 3G')).toBeVisible();
  });

  test('用户可以输入自定义配置', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Network Throttling"]').click();
    await expect(page.locator('h2:has-text("网络节流")')).toBeVisible({ timeout: 10000 });

    // 填写自定义配置
    const downloadInput = page.locator('input[placeholder="0 = 无限制"]').first();
    await downloadInput.fill('256');

    // 点击应用
    await page.getByRole('button', { name: '应用自定义配置' }).click();

    // 验证状态更新
    await expect(page.getByText('当前状态: Custom')).toBeVisible();
  });
});

test.describe('Phase 3 - Diff Viewer', () => {
  test('用户可以打开请求对比对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    // 点击 Compare Requests 按钮
    await page.locator('button[title="Compare Requests"]').click();

    // 验证对话框出现
    await expect(page.locator('h2:has-text("请求对比")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('对比两个请求的差异')).toBeVisible();
  });

  test('显示请求选择下拉框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Compare Requests"]').click();
    await expect(page.locator('h2:has-text("请求对比")')).toBeVisible({ timeout: 10000 });

    // 验证选择框存在
    await expect(page.getByText('左侧请求')).toBeVisible();
    await expect(page.getByText('右侧请求')).toBeVisible();
    await expect(page.locator('select')).toHaveCount(2);
  });

  test('未选择请求时显示提示信息', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Compare Requests"]').click();
    await expect(page.locator('h2:has-text("请求对比")')).toBeVisible({ timeout: 10000 });

    // 验证提示信息
    await expect(page.getByText('请选择两个请求进行对比')).toBeVisible();
  });
});

test.describe('Phase 3 - Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_access_control_rules');
    });
  });

  test('用户可以打开访问控制对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    // 点击 Access Control 按钮
    await page.locator('button[title="Access Control"]').click();

    // 验证对话框出现
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('黑名单/白名单规则管理')).toBeVisible();
  });

  test('显示规则统计信息', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Access Control"]').click();
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });

    // 验证统计显示
    await expect(page.getByText('总规则数')).toBeVisible();
    await expect(page.getByText('黑名单')).toBeVisible();
    await expect(page.getByText('白名单')).toBeVisible();
  });

  test('用户可以添加黑名单规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Access Control"]').click();
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });

    // 点击添加按钮
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: 屏蔽广告域名').fill('Block Ads');
    await page.getByPlaceholder(/例:.*ads/).fill('*.ads.com');

    // 保存
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Block Ads')).toBeVisible();
  });

  test('用户可以添加白名单规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Access Control"]').click();
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });

    // 点击添加按钮
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 选择白名单类型
    await page.locator('select').first().selectOption('whitelist');

    // 填写规则
    await page.getByPlaceholder('例: 屏蔽广告域名').fill('Allow API');
    await page.getByPlaceholder(/例:.*ads/).fill('api.example.com');

    // 保存
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加和白名单提示
    await expect(page.getByText('Allow API')).toBeVisible();
    await expect(page.getByText('白名单模式已启用')).toBeVisible();
  });

  test('规则持久化到 localStorage', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_access_control_rules', [{
      id: 'test-1',
      name: 'Persistent Rule',
      pattern: '*.test.com',
      type: 'blacklist',
      matchType: 'domain',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Access Control"]').click();
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Persistent Rule')).toBeVisible();
  });

  test('用户可以删除规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_access_control_rules', [{
      id: 'test-delete',
      name: 'Rule To Delete',
      pattern: '*.delete.com',
      type: 'blacklist',
      matchType: 'domain',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Access Control"]').click();
    await expect(page.locator('h2:has-text("访问控制")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Rule To Delete')).toBeVisible();

    // 接受确认对话框
    page.on('dialog', dialog => dialog.accept());

    // 点击删除
    await page.getByRole('button', { name: '删除' }).click();

    // 验证规则已删除
    await expect(page.getByText('Rule To Delete')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Phase 3 - Proxy Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_proxy_config');
    });
  });

  test('用户可以打开代理终端对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Proxy Terminal"]').click();
    await expect(page.locator('h2:has-text("代理终端")')).toBeVisible({ timeout: 10000 });
  });

  test('显示代理状态和配置选项', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Proxy Terminal"]').click();
    await expect(page.locator('h2:has-text("代理终端")')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('代理状态:')).toBeVisible();
    await expect(page.getByText('基本设置')).toBeVisible();
    await expect(page.getByText('认证设置')).toBeVisible();
    await expect(page.getByText('绕过列表')).toBeVisible();
  });

  test('用户可以启用/禁用代理', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Proxy Terminal"]').click();
    await expect(page.locator('h2:has-text("代理终端")')).toBeVisible({ timeout: 10000 });

    // 点击启用代理
    await page.getByRole('button', { name: '启用代理' }).click();
    await expect(page.getByText('已启用')).toBeVisible();
  });
});

test.describe('Phase 3 - Turbo Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_turbo_mode');
    });
  });

  test('用户可以打开极速模式对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Turbo Mode"]').click();
    await expect(page.locator('h2:has-text("极速模式")')).toBeVisible({ timeout: 10000 });
  });

  test('显示流量节省指示器', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Turbo Mode"]').click();
    await expect(page.locator('h2:has-text("极速模式")')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('预估流量节省')).toBeVisible();
    await expect(page.getByText('资源过滤')).toBeVisible();
  });

  test('用户可以选择预设', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Turbo Mode"]').click();
    await expect(page.locator('h2:has-text("极速模式")')).toBeVisible({ timeout: 10000 });

    // 点击极限模式预设
    await page.getByText('极限模式').click();
    await expect(page.getByText('已开启')).toBeVisible();
  });
});

test.describe('Phase 3 - Reverse Proxy', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_reverse_proxy_rules');
    });
  });

  test('用户可以打开反向代理对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Reverse Proxy"]').click();
    await expect(page.locator('h2:has-text("反向代理")')).toBeVisible({ timeout: 10000 });
  });

  test('用户可以添加反向代理规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);
    await switchToReqable(page);

    await page.locator('button[title="Reverse Proxy"]').click();
    await expect(page.locator('h2:has-text("反向代理")')).toBeVisible({ timeout: 10000 });

    // 点击添加按钮
    await page.getByRole('button', { name: '+ 添加反向代理规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: API 代理').fill('Test Proxy');
    await page.getByPlaceholder('例: /api/*').fill('/api/*');
    await page.getByPlaceholder('例: https://backend.example.com').fill('https://backend.test.com');

    // 保存
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Test Proxy')).toBeVisible();
  });
});
