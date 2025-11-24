import { test, expect, Page } from '@playwright/test';

// Helper to setup localStorage with rules before page load
async function setupLocalStorage(page: Page, key: string, value: any) {
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, { key, value });
}

test.describe('Reqable - Map Local Rules', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_maplocal_rules');
    });
  });

  // Helper to wait for page stability (2000ms needed for first load)
  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以打开 Map Local 规则对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 点击 Map Local 按钮 (FolderTree 图标)
    await page.locator('button[title="Map Local Rules"]').click();

    // 等待对话框出现并验证 (使用 h2 标题更可靠)
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '+ 添加新规则' })).toBeVisible();
  });

  test('用户可以添加 Map Local 规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Map Local 对话框
    await page.locator('button[title="Map Local Rules"]').click();
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: 本地 API Mock').fill('Test Mock Rule');
    await page.getByPlaceholder(/https:\/\/api\.example\.com/).fill('https://api.test.com/*');
    await page.locator('textarea').fill('{"mocked": true}');

    // 保存规则
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Test Mock Rule')).toBeVisible();
  });

  test('用户可以编辑 Map Local 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_maplocal_rules', [{
      id: 'test-1',
      name: 'Existing Rule',
      urlPattern: 'https://old.api.com/*',
      enabled: true,
      localContent: '{"old": true}',
      contentType: 'application/json'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并打开 Map Local 对话框
    const mapLocalButton = page.locator('button[title="Map Local Rules"]');
    await expect(mapLocalButton).toBeVisible({ timeout: 5000 });
    await mapLocalButton.click({ force: true });
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Existing Rule')).toBeVisible();

    // 点击编辑
    await page.getByRole('button', { name: '编辑' }).click();

    // 修改规则名称
    await page.getByPlaceholder('例: 本地 API Mock').fill('Updated Rule');

    // 保存修改
    await page.getByRole('button', { name: '保存修改' }).click();

    // 验证规则已更新
    await expect(page.getByText('Updated Rule')).toBeVisible();
  });

  test('用户可以删除 Map Local 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_maplocal_rules', [{
      id: 'test-delete',
      name: 'Rule To Delete',
      urlPattern: 'https://delete.api.com/*',
      enabled: true,
      localContent: '{}',
      contentType: 'application/json'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Map Local 对话框
    await page.locator('button[title="Map Local Rules"]').click();
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Rule To Delete')).toBeVisible();

    // 设置确认弹窗自动接受
    page.on('dialog', dialog => dialog.accept());

    // 点击删除
    await page.getByRole('button', { name: '删除' }).click();

    // 验证规则已删除
    await expect(page.getByText('Rule To Delete')).not.toBeVisible();
    await expect(page.getByText('暂无 Map Local 规则')).toBeVisible();
  });

  test('用户可以启用/禁用 Map Local 规则', async ({ page }) => {
    // 预设一个启用的规则
    await setupLocalStorage(page, 'netrunner_maplocal_rules', [{
      id: 'test-toggle',
      name: 'Toggle Rule',
      urlPattern: 'https://toggle.api.com/*',
      enabled: true,
      localContent: '{}',
      contentType: 'application/json'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Map Local 对话框
    await page.locator('button[title="Map Local Rules"]').click();
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });

    // 找到规则的 checkbox 并点击禁用 (等待规则渲染并找到对话框内的 checkbox)
    const dialog = page.locator('.fixed.inset-0');
    const checkbox = dialog.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked({ timeout: 5000 });
    await checkbox.uncheck();

    // 验证 checkbox 已取消选中
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('Reqable - Rewrite Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_rewrite_rules');
    });
  });

  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以打开 Rewrite 规则对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并点击 Rewrite 按钮 (RefreshCw 图标)
    const rewriteButton = page.locator('button[title="Rewrite Rules"]');
    await expect(rewriteButton).toBeVisible({ timeout: 5000 });
    await rewriteButton.click({ force: true });

    // 验证对话框打开 (实际标题是 "重写规则管理")
    await expect(page.locator('h2:has-text("重写规则管理")')).toBeVisible({ timeout: 10000 });
  });

  test('用户可以添加 Redirect 规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Rewrite 对话框
    await page.locator('button[title="Rewrite Rules"]').click();
    await expect(page.locator('h2:has-text("重写规则管理")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则 (Rewrite 对话框用 "添加新规则" 不带 +)
    await page.getByRole('button', { name: '添加新规则' }).click();

    // 等待表单出现
    await page.waitForTimeout(500);

    // 填写规则名称 (placeholder: "例如: 重定向API到测试环境")
    await page.getByPlaceholder(/重定向API/).fill('Test Redirect');
    // 填写 URL 模式 (placeholder: "例如: https://api.example.com/*")
    await page.getByPlaceholder(/https:\/\/api\.example\.com/).fill('https://old.api.com/*');

    // 填写目标 URL (placeholder: "https://test-api.example.com/data")
    await page.getByPlaceholder(/test-api\.example\.com/).fill('https://new.api.com/v2');

    // 保存规则 (按钮文字是 "添加")
    await page.getByRole('button', { name: '添加', exact: true }).click();

    // 验证规则已添加
    await expect(page.getByText('Test Redirect')).toBeVisible();
  });
});

test.describe('Reqable - Breakpoint Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_breakpoint_rules');
    });
  });

  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以打开 Breakpoint 规则对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 点击 Breakpoint Rules 按钮 (List 图标)
    await page.locator('button[title="Breakpoint Rules"]').click();

    // 验证对话框打开
    await expect(page.locator('h2:has-text("断点规则")')).toBeVisible({ timeout: 10000 });
  });

  test('用户可以切换全局断点状态', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 找到断点切换按钮 (Pause 图标)
    const breakpointToggle = page.locator('button[title="Toggle Breakpoints"]');

    // 初始状态应该是禁用的 - 验证按钮存在
    await expect(breakpointToggle).toBeVisible();

    // 点击启用断点
    await breakpointToggle.click();

    // 等待状态更新
    await page.waitForTimeout(300);

    // 再次点击禁用断点
    await breakpointToggle.click();

    // 验证按钮仍然可见且可交互
    await expect(breakpointToggle).toBeVisible();
  });
});

test.describe('Reqable - HAR Import/Export', () => {
  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以点击导出 HAR 按钮', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 找到导出 HAR 按钮 (Download 图标)
    const exportButton = page.locator('button[title="Export as HAR"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();

    // 点击按钮（不等待下载，因为可能没有请求数据）
    await exportButton.click();

    // 验证按钮可以正常点击
    await expect(exportButton).toBeVisible();
  });

  test('导入 HAR 按钮存在且可点击', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 找到导入 HAR 按钮 (FileJson 图标)
    const importButton = page.locator('button[title="Import HAR"]');
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeEnabled();
  });
});

test.describe('Reqable - UI Integration', () => {
  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('所有规则按钮都存在于工具栏', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 验证所有按钮存在
    await expect(page.locator('button[title="Toggle Breakpoints"]')).toBeVisible();
    await expect(page.locator('button[title="Breakpoint Rules"]')).toBeVisible();
    await expect(page.locator('button[title="Rewrite Rules"]')).toBeVisible();
    await expect(page.locator('button[title="Map Local Rules"]')).toBeVisible();
    await expect(page.locator('button[title="Export as HAR"]')).toBeVisible();
    await expect(page.locator('button[title="Import HAR"]')).toBeVisible();
  });

  test('对话框可以正常关闭', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并打开 Map Local 对话框
    const mapLocalButton = page.locator('button[title="Map Local Rules"]');
    await expect(mapLocalButton).toBeVisible({ timeout: 5000 });
    await mapLocalButton.click({ force: true });
    await expect(page.locator('h2:has-text("Map Local 规则")')).toBeVisible({ timeout: 10000 });

    // 点击关闭按钮 (使用 exact match 避免匹配到 "关闭 DevTools")
    await page.getByRole('button', { name: '关闭', exact: true }).click();

    // 验证对话框已关闭
    await expect(page.locator('h2:has-text("Map Local 规则")')).not.toBeVisible();
  });
});

test.describe('Reqable - Gateway Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_gateway_rules');
    });
  });

  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以打开 Gateway 规则对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并点击 Gateway Rules 按钮 (Shield 图标)
    const gatewayButton = page.locator('button[title="Gateway Rules"]');
    await expect(gatewayButton).toBeVisible({ timeout: 5000 });
    await gatewayButton.click({ force: true });

    // 验证对话框打开
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '+ 添加新规则' })).toBeVisible();
  });

  test('用户可以添加 Block 规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并打开 Gateway Rules 对话框
    const gatewayButton = page.locator('button[title="Gateway Rules"]');
    await expect(gatewayButton).toBeVisible({ timeout: 5000 });
    await gatewayButton.click({ force: true });
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: 屏蔽广告').fill('Block Ads');
    await page.getByPlaceholder('例: https://ads.example.com/*').fill('https://ads.test.com/*');

    // 确认默认是 block 操作
    const select = page.locator('select');
    await expect(select).toHaveValue('block');

    // 保存规则
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Block Ads')).toBeVisible();
    await expect(page.getByText('阻止')).toBeVisible();
  });

  test('用户可以添加 Allow 规则（白名单）', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Gateway Rules 对话框
    await page.locator('button[title="Gateway Rules"]').click();
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: 屏蔽广告').fill('Allow Important');
    await page.getByPlaceholder('例: https://ads.example.com/*').fill('https://important.example.com/*');

    // 选择 allow 操作
    await page.locator('select').selectOption('allow');

    // 保存规则
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Allow Important')).toBeVisible();
    await expect(page.getByText('允许')).toBeVisible();
  });

  test('用户可以编辑 Gateway 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_gateway_rules', [{
      id: 'test-1',
      name: 'Block Test',
      urlPattern: 'https://test.com/*',
      enabled: true,
      action: 'block',
      description: 'Test rule'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Gateway Rules 对话框
    await page.locator('button[title="Gateway Rules"]').click();
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Block Test')).toBeVisible();

    // 点击编辑
    await page.getByRole('button', { name: '编辑' }).click();

    // 修改规则名称
    await page.getByPlaceholder('例: 屏蔽广告').fill('Updated Block Rule');

    // 保存修改
    await page.getByRole('button', { name: '保存修改' }).click();

    // 验证规则已更新
    await expect(page.getByText('Updated Block Rule')).toBeVisible();
  });

  test('用户可以删除 Gateway 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_gateway_rules', [{
      id: 'test-delete',
      name: 'Rule To Delete',
      urlPattern: 'https://delete.com/*',
      enabled: true,
      action: 'block'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Gateway Rules 对话框
    await page.locator('button[title="Gateway Rules"]').click();
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Rule To Delete')).toBeVisible();

    // 设置确认弹窗自动接受
    page.on('dialog', dialog => dialog.accept());

    // 点击删除
    await page.getByRole('button', { name: '删除' }).click();

    // 验证规则已删除
    await expect(page.getByText('Rule To Delete')).not.toBeVisible();
    await expect(page.getByText('暂无网关规则')).toBeVisible();
  });

  test('用户可以启用/禁用 Gateway 规则', async ({ page }) => {
    // 预设一个启用的规则
    await setupLocalStorage(page, 'netrunner_gateway_rules', [{
      id: 'test-toggle',
      name: 'Toggle Rule',
      urlPattern: 'https://toggle.com/*',
      enabled: true,
      action: 'block'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并打开 Gateway Rules 对话框
    const gatewayButton = page.locator('button[title="Gateway Rules"]');
    await expect(gatewayButton).toBeVisible({ timeout: 5000 });
    await gatewayButton.click({ force: true });

    // 等待对话框出现
    await expect(page.locator('h2:has-text("网关规则")')).toBeVisible({ timeout: 10000 });

    // 找到规则的 checkbox 并点击禁用
    const dialog = page.locator('.fixed.inset-0');
    const checkbox = dialog.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked({ timeout: 5000 });
    await checkbox.uncheck();

    // 验证 checkbox 已取消选中
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('Reqable - Mirror Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_mirror_rules');
    });
  });

  const waitForStability = async (page: Page) => {
    await page.waitForTimeout(2000);
  };

  test('用户可以打开 Mirror 规则对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 点击 Mirror Rules 按钮 (ArrowRight 图标)
    await page.locator('button[title="Mirror Rules"]').click();

    // 验证对话框打开
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '+ 添加新规则' })).toBeVisible();
  });

  test('用户可以添加镜像规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Mirror Rules 对话框
    await page.locator('button[title="Mirror Rules"]').click();
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则
    await page.getByPlaceholder('例: 生产环境映射到测试').fill('Prod to Test');
    await page.getByPlaceholder('例: https://api.production.com/*').fill('https://api.prod.com/*');
    await page.getByPlaceholder('例: https://api.test.com').fill('https://api.test.com');

    // 保存规则
    await page.getByRole('button', { name: '添加规则' }).click();

    // 验证规则已添加
    await expect(page.getByText('Prod to Test')).toBeVisible();
    await expect(page.getByText('https://api.prod.com/*')).toBeVisible();
    await expect(page.getByText('https://api.test.com')).toBeVisible();
  });

  test('用户添加镜像规则时会验证目标域名格式', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Mirror Rules 对话框
    await page.locator('button[title="Mirror Rules"]').click();
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });

    // 点击添加新规则
    await page.getByRole('button', { name: '+ 添加新规则' }).click();

    // 填写规则，但使用无效的目标域名
    await page.getByPlaceholder('例: 生产环境映射到测试').fill('Invalid Target');
    await page.getByPlaceholder('例: https://api.production.com/*').fill('https://api.prod.com/*');
    await page.getByPlaceholder('例: https://api.test.com').fill('invalid-url');

    // 监听 alert 对话框
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('目标域名格式无效');
      dialog.accept();
    });

    // 尝试保存规则
    await page.getByRole('button', { name: '添加规则' }).click();

    // 表单应该仍然可见（未关闭）
    await expect(page.getByPlaceholder('例: https://api.test.com')).toBeVisible();
  });

  test('用户可以编辑 Mirror 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_mirror_rules', [{
      id: 'test-1',
      name: 'Existing Mirror',
      sourcePattern: 'https://api.old.com/*',
      targetDomain: 'https://api.new.com',
      enabled: true,
      description: 'Test mirror rule'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开 Mirror Rules 对话框
    await page.locator('button[title="Mirror Rules"]').click();
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Existing Mirror')).toBeVisible();

    // 点击编辑
    await page.getByRole('button', { name: '编辑' }).click();

    // 修改规则名称
    await page.getByPlaceholder('例: 生产环境映射到测试').fill('Updated Mirror Rule');

    // 保存修改
    await page.getByRole('button', { name: '保存修改' }).click();

    // 验证规则已更新
    await expect(page.getByText('Updated Mirror Rule')).toBeVisible();
  });

  test('用户可以删除 Mirror 规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_mirror_rules', [{
      id: 'test-delete',
      name: 'Mirror To Delete',
      sourcePattern: 'https://api.delete.com/*',
      targetDomain: 'https://api.target.com',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并打开 Mirror Rules 对话框
    const mirrorButton = page.locator('button[title="Mirror Rules"]');
    await expect(mirrorButton).toBeVisible({ timeout: 5000 });
    await mirrorButton.click({ force: true });
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Mirror To Delete')).toBeVisible();

    // 设置确认弹窗自动接受
    page.on('dialog', dialog => dialog.accept());

    // 点击删除
    await page.getByRole('button', { name: '删除' }).click();

    // 验证规则已删除
    await expect(page.getByText('Mirror To Delete')).not.toBeVisible();
    await expect(page.getByText('暂无镜像规则')).toBeVisible();
  });

  test('用户可以启用/禁用 Mirror 规则', async ({ page }) => {
    // 预设一个启用的规则
    await setupLocalStorage(page, 'netrunner_mirror_rules', [{
      id: 'test-toggle',
      name: 'Toggle Mirror',
      sourcePattern: 'https://api.toggle.com/*',
      targetDomain: 'https://api.target.com',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 等待按钮可用并点击
    const mirrorButton = page.locator('button[title="Mirror Rules"]');
    await expect(mirrorButton).toBeVisible({ timeout: 5000 });
    await mirrorButton.click({ force: true });

    // 等待对话框出现
    await expect(page.locator('h2:has-text("镜像规则")')).toBeVisible({ timeout: 10000 });

    // 找到规则的 checkbox 并点击禁用
    const dialog = page.locator('.fixed.inset-0');
    const checkbox = dialog.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked({ timeout: 5000 });
    await checkbox.uncheck();

    // 验证 checkbox 已取消选中
    await expect(checkbox).not.toBeChecked();
  });
});
