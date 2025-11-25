import { test, expect, Page } from '@playwright/test';

// Helper to setup localStorage with rules before page load
async function setupLocalStorage(page: Page, key: string, value: any) {
  await page.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, { key, value });
}

// Helper to wait for page stability
const waitForStability = async (page: Page) => {
  await page.waitForTimeout(2000);
};

// Helper to open Script Editor dialog
async function openScriptEditor(page: Page) {
  // 首先切换到 Reqable 视图
  await page.getByRole('button', { name: 'Reqable' }).click();
  await page.waitForTimeout(500);

  // 点击侧边栏的 Script 图标 (Code icon)
  await page.locator('.w-\\[50px\\] button').nth(3).click();
  await page.waitForTimeout(300);

  // 点击 "Manage Scripts" 按钮
  await page.getByRole('button', { name: 'Manage Scripts' }).click();
}

test.describe('Reqable - Script Execution', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      window.localStorage.removeItem('netrunner_script_rules');
      window.localStorage.removeItem('netrunner_script_logs');
    });
  });

  test('用户可以打开脚本编辑器对话框', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);

    // 验证对话框出现
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Execute JavaScript code on requests/responses')).toBeVisible();
  });

  test('用户可以添加脚本规则', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 填写规则表单
    await page.getByPlaceholder('e.g., Add Auth Header').fill('Test Script Rule');
    await page.getByPlaceholder('e.g., https://api.example.com/*').fill('https://test.com/*');

    // 选择触发类型
    await page.locator('select').selectOption('request');

    // 输入脚本代码
    await page.locator('textarea').fill('console.log("Test script executed");');

    // 点击添加按钮
    await page.getByRole('button', { name: 'Add Rule' }).click();

    // 验证规则已添加到列表
    await expect(page.getByText('Test Script Rule')).toBeVisible();
    await expect(page.getByText('https://test.com/*')).toBeVisible();
  });

  test('用户可以编辑脚本规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_script_rules', [{
      id: 'script-test-1',
      name: 'Existing Script',
      urlPattern: 'https://api.old.com/*',
      trigger: 'request',
      code: 'console.log("old");',
      enabled: true,
      description: 'Old description'
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Existing Script')).toBeVisible();

    // 点击编辑按钮
    await page.locator('button[title="Edit"]').click();

    // 修改规则名称
    await page.getByPlaceholder('e.g., Add Auth Header').fill('Updated Script');

    // 保存修改
    await page.getByRole('button', { name: 'Update Rule' }).click();

    // 验证规则已更新
    await expect(page.getByText('Updated Script')).toBeVisible();
  });

  test('用户可以删除脚本规则', async ({ page }) => {
    // 预设一个规则
    await setupLocalStorage(page, 'netrunner_script_rules', [{
      id: 'script-delete',
      name: 'Rule To Delete',
      urlPattern: 'https://delete.com/*',
      trigger: 'request',
      code: 'console.log("delete");',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证规则存在
    await expect(page.getByText('Rule To Delete')).toBeVisible();

    // 接受确认对话框
    page.on('dialog', dialog => dialog.accept());

    // 点击删除按钮
    await page.locator('button[title="Delete"]').click();

    // 验证规则已删除
    await expect(page.getByText('Rule To Delete')).not.toBeVisible({ timeout: 5000 });
  });

  test('用户可以启用/禁用脚本规则', async ({ page }) => {
    // 预设一个启用的规则
    await setupLocalStorage(page, 'netrunner_script_rules', [{
      id: 'script-toggle',
      name: 'Toggle Test',
      urlPattern: 'https://toggle.com/*',
      trigger: 'request',
      code: 'console.log("toggle");',
      enabled: true
    }]);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证规则已启用
    await expect(page.getByText('ENABLED')).toBeVisible();

    // 点击启用/禁用按钮
    await page.locator('button[title="Disable"]').click();

    // 验证规则已禁用 (ENABLED 标签消失)
    await expect(page.getByText('ENABLED')).not.toBeVisible({ timeout: 5000 });
  });

  test('用户可以加载示例脚本', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 点击 "Add Auth" 示例按钮
    await page.getByRole('button', { name: 'Add Auth' }).click();

    // 验证代码已加载到编辑器
    const textarea = page.locator('textarea');
    await expect(textarea).toContainText('Authorization');
    await expect(textarea).toContainText('Bearer');
  });

  test('用户可以加载 "Modify Response" 示例', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 点击 "Modify Response" 示例按钮
    await page.getByRole('button', { name: 'Modify Response' }).click();

    // 验证代码已加载
    const textarea = page.locator('textarea');
    await expect(textarea).toContainText('setBody');
  });

  test('脚本规则持久化到 localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器并添加规则
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('e.g., Add Auth Header').fill('Persistent Rule');
    await page.getByPlaceholder('e.g., https://api.example.com/*').fill('https://persist.com/*');
    await page.locator('textarea').fill('console.log("persist");');
    await page.getByRole('button', { name: 'Add Rule' }).click();

    // 验证规则存在
    await expect(page.getByText('Persistent Rule')).toBeVisible();

    // 关闭对话框
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).click();

    // 刷新页面
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 重新打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证规则仍然存在
    await expect(page.getByText('Persistent Rule')).toBeVisible();
  });

  test('显示可用 API 文档', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证 API 文档显示
    await expect(page.getByText('Available APIs:')).toBeVisible();
    await expect(page.getByText('console.log')).toBeVisible();
    await expect(page.getByText('setHeader')).toBeVisible();
    await expect(page.getByText('getHeader')).toBeVisible();
    await expect(page.getByText('setBody')).toBeVisible();
    await expect(page.getByText('getBody')).toBeVisible();
    await expect(page.getByText('setStatus')).toBeVisible();
  });

  test('支持三种触发类型选择', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForStability(page);

    // 打开脚本编辑器
    await openScriptEditor(page);
    await expect(page.locator('h2:has-text("Script Rules")')).toBeVisible({ timeout: 10000 });

    // 验证下拉框包含三种选项
    const select = page.locator('select');
    await expect(select.locator('option[value="request"]')).toHaveText('Request');
    await expect(select.locator('option[value="response"]')).toHaveText('Response');
    await expect(select.locator('option[value="both"]')).toHaveText('Both (Request & Response)');
  });
});
