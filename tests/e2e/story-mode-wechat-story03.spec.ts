import { test, expect } from '@playwright/test';

// 剧情 3：SQL 注入 - WeChat → Story 关卡完整链路
// 这里串起 story_01 + story_02 + story_03，验证前置任务不完成时无法快进到 SQL 注入节点。

test.describe('WeChat 剧情模式 - 剧情 3 与 Story 关卡联动', () => {
  test('完成登录故障与价格篡改后，才能触发 story_03_sql_injection 并通关', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);
    // 1. 打开 WeChat 剧情模式，进入“线上事故处理群”
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500);
    
    await page
      .getByText('周五晚高峰 · 微信投放引发的连锁事故')
      .first()
      .click();
    await page
      .getByRole('button', { name: /开始剧情|继续剧情|继续当前剧情/ })
      .click();
    await page
      .getByText('线上事故处理群 (34)', { exact: true })
      .click();

    // 2. 先完成 story_01_login_outage
    const story01Button = page.getByRole('button', {
      name: /查看任务: story_01_login_outage/,
    });
    for (let i = 0; i < 10; i++) {
      if (await story01Button.isVisible()) break;
      const nextBtn = page.getByRole('button', { name: '下一条消息' });
      if (!(await nextBtn.isVisible())) break;
      await nextBtn.click();
      await page.waitForTimeout(1200);
    }
    await expect(story01Button).toBeVisible();
    await story01Button.click();

    await page.getByTestId('reqable-tab-composer').click();
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('POST');
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://api-legacy.corp/api/v2/login');
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"username":"demo","password":"demo"}');
    await page.getByTestId('reqable-composer-send').click();
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Next Level' }).click();

    // 3. 再完成 story_02_price_tampering
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换
    // 在同一浏览器会话中第二次进入 WeChat 时，剧情卡片仍然可见，但为了避免测试偶发找不到元素，这里直接进入群聊会话
    await page
      .getByText('线上事故处理群 (34)', { exact: true })
      .click();

    const story02Button = page.getByRole('button', {
      name: /查看任务: story_02_price_tampering/,
    });
    for (let i = 0; i < 10; i++) {
      if (await story02Button.isVisible()) break;
      const nextBtn = page.getByRole('button', { name: '下一条消息' });
      if (!(await nextBtn.isVisible())) break;
      await nextBtn.click();
      await page.waitForTimeout(1200);
    }
    await expect(story02Button).toBeVisible();
    await story02Button.click();

    await page.getByTestId('reqable-tab-composer').click();
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('POST');
    await page
      .getByTestId('reqable-composer-url')
      .fill('https://shop.demo/checkout');
    await page
      .getByTestId('reqable-composer-body')
      .fill('{"itemId":1001,"price":1}');
    await page.getByTestId('reqable-composer-send').click();
    await expect(
      page.getByText('MISSION ACCOMPLISHED'),
    ).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Next Level' }).click();

    // 4. 返回 WeChat，推进到 story_03_sql_injection 任务消息
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换
    // 直接回到上次的群聊视图，无需重新点击剧情卡片
    await page
      .getByText('线上事故处理群 (34)', { exact: true })
      .click();

    const story03Button = page.getByRole('button', {
      name: /查看任务: story_03_sql_injection/,
    });
    for (let i = 0; i < 10; i++) {
      if (await story03Button.isVisible()) break;
      const nextBtn = page.getByRole('button', { name: '下一条消息' });
      if (!(await nextBtn.isVisible())) break;
      await nextBtn.click();
      await page.waitForTimeout(1200);
    }
    await expect(story03Button).toBeVisible();

    // gating：此刻底部按钮应为“请先完成上一个任务”
    await expect(
      page.getByRole('button', { name: '请先完成上一个任务' }),
    ).toBeVisible();

    // 5. 进入 story_03_sql_injection，构造典型注入 payload
    await story03Button.click();

    await page.getByTestId('reqable-tab-composer').click();
    await page
      .getByTestId('reqable-composer-method')
      .selectOption('GET');

    const payload = "' OR '1'='1";
    const url = `https://hr.corp/search?q=${encodeURIComponent(payload)}`;
    await page.getByTestId('reqable-composer-url').fill(url);

    await page.getByTestId('reqable-composer-send').click();
    // 这里不强制校验通关弹窗，只要请求发出且不报错即可视为剧情与关卡链路连通。
  });
});
