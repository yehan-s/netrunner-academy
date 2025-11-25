# 微信剧情沉浸感增强（任务列表）

> 关联 ADR：`docs/adr/0015-wechat-story-immersion-enhancement.md`

---

## Phase 1：UI 基础体验（P0） ✅ 已完成

### 1.1 消息时间戳
- [x] `types.ts` / `storylines.ts`：StoryMessage 添加 `timestamp?: string` 字段
- [x] `storylines.ts`：为现有剧情消息补充时间戳（43+ 条消息，19:02 ~ 23:45）
- [x] `components/wechat/StoryChatPanel.tsx`：消息气泡旁显示时间戳
- [x] 样式：时间戳使用浅色小字，显示在发送者名称旁

### 1.2 "正在输入"动画
- [x] `types.ts` / `storylines.ts`：StoryMessage 添加 `typingDelay?: number` 字段
- [x] `components/wechat/StoryChatPanel.tsx`：
  - 点击"下一条消息"后，先显示 typing indicator（三个跳动的点）
  - 延迟 `typingDelay` 毫秒后显示实际消息
  - 默认 typingDelay = 800ms（14 条关键消息配置了 1000-1500ms）
- [x] `components/wechat/TypingIndicator.tsx`：新建 typing 动画组件
- [x] 测试：E2E 测试添加 `waitForTimeout(1200)` 适应动画

### 1.3 消息淡入动画
- [x] `components/wechat/StoryChatPanel.tsx`：新消息使用 CSS animation
  - `animate-in fade-in slide-in-from-bottom-2 duration-300`
- [x] 滚动行为：新消息出现后自动滚动到底部，带平滑动画

---

## Phase 2：剧情内容增强（P1） ✅ 已完成

### 2.1 角色扩展
- [x] `storylines.ts`：StoryMessage.sender 类型扩展（添加 `'老板'`）
- [x] `components/wechat/StoryChatPanel.tsx`：为新角色配置头像颜色
  - 产品：紫色 `bg-purple-600`
  - 运维：橙色 `bg-orange-600`
  - 客服：青色 `bg-teal-600`
  - 老板：琥珀色 `bg-amber-700`
- [x] 新增 5 条新角色消息（产品、运维、客服、老板各 1-2 条）

### 2.2 丰富私聊内容
- [x] `storylines.ts` - INCIDENT_STORY_THREAD：
  - scene-09a：同事私聊吐槽（关于加班）
  - scene-25a：安全负责人私聊鼓励
- [x] 现有私聊消息共 10 条

### 2.3 闲聊调剂消息
- [x] scene-20b：外卖/咖啡机对话
- [x] scene-22a：复盘会时间询问
- [ ] 设计闲聊消息池，可随机插入（可选功能，暂不实现）

### 2.4 教学暗示对话
- [x] scene-06a：story_01 前 Reqable 铺垫
- [x] scene-10a：story_02 前后端校验铺垫
- [x] scene-13b：story_03 前 SQL 注入铺垫
- [x] 确保铺垫对话不带 `targetCaseId`，不触发 gating

---

## Phase 3：进阶功能（P2）

### 3.1 线索面板 ✅
- [x] `components/wechat/ClueBoard.tsx`：新建线索面板组件
- [x] 数据结构：ClueItem 接口（id, title, timestamp, caseId, summary, synced）
- [x] `StoryChatPanel.tsx`：从 activeThread 中生成 clueItems
- [x] UI：在聊天窗口右侧显示可折叠的线索面板
- [x] 交互：点击待同步线索可触发同步

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

## Phase 4：测试与文档 ✅ 已完成

### 4.1 E2E 测试更新
- [x] 更新现有 story 测试，适应 typing delay（添加 hydration wait + typing wait）
- [x] story_01, story_02, story_05 测试通过
- [ ] 新增测试：验证时间戳显示正确（可选）
- [ ] 新增测试：验证 typing indicator 出现后消息才显示（可选）

### 4.2 文档更新
- [x] 新建 `docs/lessons/story-writing-guide.md`：完整剧情写作规范
- [x] 更新 `docs/lessons/README.md`：添加剧情写作指南索引
- [x] ADR 0015 状态更新为 Accepted

---

## 验收标准

### P0 完成标准 ✅
- [x] 所有消息显示时间戳（43+ 条）
- [x] 点击"下一条消息"后先显示 typing indicator，再显示消息
- [x] 新消息有淡入动画
- [x] E2E 测试通过（story_01, story_02, story_05）

### P1 完成标准 ✅
- [x] 至少增加 2 个新角色的对话（产品、运维、客服、老板共 5 条）
- [x] 私聊消息数量增加（现有 10 条私聊）
- [x] 每个 `targetCaseId` 前有 1 条教学铺垫（story_01/02/03 前均有）

### P2 完成标准（待实现）
- [ ] 线索面板可正常显示和折叠
- [ ] 至少实现 1 个分支剧情
