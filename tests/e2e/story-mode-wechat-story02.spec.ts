import { test, expect } from '@playwright/test';

// 剧情 2：价格篡改 / 0.01 元会员 - WeChat → Story 关卡完整链路
// 流程：
// 1. 从 Dock 打开 WeChat，推进剧情到登录故障任务（story_01），先按正常流程完成；
// 2. 返回 WeChat，继续推进到价格篡改任务（story_02_price_tampering）；
// 3. 通过“查看任务”跳转到 Story 关卡，用 Reqable 模拟 0.01 元会员下单；
// 4. 通关后返回 WeChat，确认剧情可以继续推进。

test.describe('WeChat 剧情模式 - 剧情 2 与 Story 关卡联动', () => {
  test('从微信群聊触发 story_02_price_tampering 并完成会员价格篡改任务', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 等待 React hydration 完成
    await page.waitForTimeout(3000);
    // 1. 打开 WeChat 剧情模式，选中“周五晚高峰”故事线并进入群聊
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

    // 2. 推进剧情到 story_01_login_outage 任务消息
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

    // 此时 gating 生效，按钮文案应提醒先完成任务
    await expect(
      page.getByRole('button', { name: '请先完成上一个任务' }),
    ).toBeVisible();

    // 3. 通过“查看任务”进入 story_01_login_outage，并按标准流程修复登录接口
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

    // 4. 返回 WeChat，推进到 story_02_price_tampering 任务消息
    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换
    // 剧情已经处于进行中，左侧列表中默认存在群聊会话，直接点击会话进入即可
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

    // 再次确认 gating：出现任务消息后，“下一条消息”按钮应被禁用
    await expect(
      page.getByRole('button', { name: '请先完成上一个任务' }),
    ).toBeVisible();

    // 5. 进入 story_02_price_tampering，构造 0.01 元会员请求
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

    // 6. 返回 WeChat，确认可以继续推进剧情
    await page.getByRole('button', { name: 'Next Level' }).click();

    await page.getByRole('button', { name: 'WeChat 剧情模式' }).click();
    await page.waitForTimeout(500); // 等待模式切换    // 回到微信后，如果剧情仍在同一群聊视图，则无需再点击剧情卡片
    await expect(
      page.getByRole('button', { name: '下一条消息' }),
    ).toBeVisible();
  });
});
