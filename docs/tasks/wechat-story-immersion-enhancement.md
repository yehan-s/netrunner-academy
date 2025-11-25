# 微信剧情沉浸感增强（任务列表）

> 关联 ADR：`docs/adr/0015-wechat-story-immersion-enhancement.md`

---

## Phase 1：UI 基础体验（P0）

### 1.1 消息时间戳
- [ ] `types.ts` / `storylines.ts`：StoryMessage 添加 `timestamp?: string` 字段
- [ ] `storylines.ts`：为现有剧情消息补充时间戳（按事故时间线设计，如 19:02 ~ 23:30）
- [ ] `components/wechat/StoryChatPanel.tsx`：消息气泡旁显示时间戳
- [ ] 样式：时间戳使用浅色小字，群聊显示在消息下方，私聊显示在气泡角落

### 1.2 "正在输入"动画
- [ ] `types.ts` / `storylines.ts`：StoryMessage 添加 `typingDelay?: number` 字段
- [ ] `components/wechat/StoryChatPanel.tsx`：
  - 点击"下一条消息"后，先显示 typing indicator（三个跳动的点）
  - 延迟 `typingDelay` 毫秒后显示实际消息
  - 默认 typingDelay = 800ms（可按消息长度动态调整）
- [ ] `components/wechat/TypingIndicator.tsx`：新建 typing 动画组件
- [ ] 测试：E2E 测试需要 `waitForTimeout` 或检测动画完成

### 1.3 消息淡入动画
- [ ] `components/wechat/StoryChatPanel.tsx`：新消息使用 CSS animation
  - `animate-in fade-in slide-in-from-bottom-2 duration-300`
- [ ] 滚动行为：新消息出现后自动滚动到底部，带平滑动画

---

## Phase 2：剧情内容增强（P1）

### 2.1 角色扩展
- [ ] `storylines.ts`：StoryMessage.sender 类型扩展
  ```typescript
  sender: '你' | '同事' | '安全负责人' | '产品' | '运维' | '客服' | '老板';
  ```
- [ ] `components/wechat/StoryChatPanel.tsx`：为新角色配置头像颜色/图标
- [ ] 设计各角色的说话风格指南（产品关心数据、运维关心服务器、客服转发用户截图）

### 2.2 丰富私聊内容
- [ ] `storylines.ts` - INCIDENT_STORY_THREAD：
  - scene-08/09 后增加同事的私聊吐槽（关于加班、关于失误）
  - scene-16 后增加安全负责人的私聊鼓励
  - scene-25 后增加"领导私信询问进展"
- [ ] `storylines.ts` - POLYFILL_SUPPLY_CHAIN_THREAD：
  - 增加与同事的私聊协调（谁负责哪个环节）
  - 增加周五晚上被迫加班的情绪宣泄

### 2.3 闲聊调剂消息
- [ ] 在大任务完成后插入闲聊：
  - "外卖到了，先吃两口再继续"
  - "咖啡机没水了，谁去加一下"
  - "明天复盘会几点？"
- [ ] 设计闲聊消息池，可随机插入（可选功能）

### 2.4 教学暗示对话
- [ ] 在 `targetCaseId` 消息前 1-2 条，加入铺垫：
  - story_01 前："你会用 Reqable 抓 HTTPS 请求吗？"
  - story_03 前："SQL 注入你了解吗？搜索接口看着有点可疑"
  - story_05 前："埋点数据你怎么看？能帮忙用抓包验证一下吗？"
- [ ] 确保铺垫对话不带 `targetCaseId`，不触发 gating

---

## Phase 3：进阶功能（P2）

### 3.1 线索面板
- [ ] `components/wechat/ClueBoard.tsx`：新建线索面板组件
- [ ] 数据结构：
  ```typescript
  interface ClueItem {
    id: string;
    title: string;
    timestamp: string;
    caseId: string;
    summary: string;
    screenshot?: string; // 占位符或真实截图
  }
  ```
- [ ] `useWeChatStoryState.ts`：新增 `clueItems` 状态
- [ ] UI：在聊天窗口右侧显示可折叠的线索面板
- [ ] 交互：完成任务并同步线索后，自动添加到面板

### 3.2 条件消息（分支剧情基础）
- [ ] `types.ts`：StoryMessage 添加 `condition?: string` 字段
- [ ] `useWeChatStoryState.ts`：实现条件表达式解析
  - 支持 `completedCases.includes('xxx')`
  - 支持 `progress > 10`
  - 支持 `timeSpent < 300` (秒)
- [ ] 消息渲染时根据条件决定是否显示

### 3.3 分支剧情内容
- [ ] 设计"快速通关"支线：连续 3 个任务无失败 → 老板表扬消息
- [ ] 设计"多次失败"支线：同一任务失败 3 次 → 同事私聊安慰 + 提示
- [ ] 设计"超时"支线：某任务超过 10 分钟 → 领导询问进展

---

## Phase 4：测试与文档

### 4.1 E2E 测试更新
- [ ] 更新现有 story 测试，适应 typing delay
- [ ] 新增测试：验证时间戳显示正确
- [ ] 新增测试：验证 typing indicator 出现后消息才显示
- [ ] 新增测试：验证消息动画不影响功能

### 4.2 文档更新
- [ ] 更新 `docs/lessons/README.md`：说明剧情写作规范（时间戳、typing delay）
- [ ] 更新 `AGENTS.md`：补充剧情系统的新字段说明
- [ ] ADR 0015 状态更新为 Accepted

---

## 验收标准

### P0 完成标准
- [ ] 所有消息显示时间戳
- [ ] 点击"下一条消息"后先显示 typing indicator，再显示消息
- [ ] 新消息有淡入动画
- [ ] E2E 测试全部通过

### P1 完成标准
- [ ] 至少增加 2 个新角色的对话
- [ ] 私聊消息数量增加 50%
- [ ] 每个 `targetCaseId` 前有 1 条教学铺垫

### P2 完成标准
- [ ] 线索面板可正常显示和折叠
- [ ] 至少实现 1 个分支剧情
