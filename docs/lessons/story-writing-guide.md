# 微信剧情模式 - 写作规范与标准流程

> 本文档记录 WeChat 剧情模式的内容写作规范，确保剧情沉浸感和教学效果。

---

## 一、剧情数据结构

### StoryMessage 接口

```typescript
interface StoryMessage {
  id: string;                    // 场景 ID，如 'scene-01', 'scene-13a'
  sender: SenderType;            // 发送者角色
  channel: 'WeChat';             // 固定为 WeChat
  text: string;                  // 消息内容，需包含 【群聊】或【私聊】前缀
  timestamp?: string;            // 消息时间戳，如 '19:02'
  typingDelay?: number;          // "正在输入"动画时长(ms)，默认 800
  targetCaseId?: string;         // 绑定的关卡 ID（触发 gating）
  requiresClueSync?: boolean;    // 是否需要同步线索
  clueKey?: string;              // 线索标识
}
```

### 角色类型与头像颜色

| 角色 | sender 值 | 头像颜色 | 说话风格 |
|------|-----------|----------|----------|
| 玩家 | `'你'` | 灰色（带头像） | 技术分析、解决方案 |
| 同事 | `'同事'` | 蓝色 `bg-blue-600` | 协作、求助、吐槽 |
| 安全负责人 | `'安全负责人'` | 红色 `bg-red-600` | 指挥、决策、鼓励 |
| 产品 | `'产品'` | 紫色 `bg-purple-600` | 关心数据、用户影响 |
| 运维 | `'运维'` | 橙色 `bg-orange-600` | 服务器状态、临时方案 |
| 客服 | `'客服'` | 青色 `bg-teal-600` | 转发用户反馈、截图 |
| 老板 | `'老板'` | 琥珀色 `bg-amber-700` | 关心进展、协调资源 |

---

## 二、时间戳规范

### 时间线设计原则

1. **事故发生时间**：通常设定在晚高峰（19:00-21:00）
2. **时间间隔**：
   - 紧急消息：2-3 分钟间隔
   - 普通对话：5-8 分钟间隔
   - 任务完成后：10-15 分钟跳跃
3. **跨线程时间**：不同剧情线时间应有明显分隔

### 示例时间线

```
事故处理群剧情 (INCIDENT_STORY_THREAD):
19:02 - 事故开始
19:06 - 初步分析
19:14 - 任务 1 (CDN 验证)
19:26 - 任务 2 (价格篡改)
19:42 - 任务 3 (SQL 注入)
20:12 - 任务 4 (IDOR)
20:18 - 任务 5 (埋点)
...
21:35 - 事故收尾

Polyfill 供应链剧情 (POLYFILL_SUPPLY_CHAIN_THREAD):
22:00 - 新问题出现
22:25 - 任务开始
...
23:45 - 剧情结束
```

---

## 三、typingDelay 配置

### 使用场景

| 场景 | typingDelay 值 | 说明 |
|------|----------------|------|
| 短消息 | 不设置（默认 800ms） | 普通简短回复 |
| 中等消息 | `1000-1200` | 带分析的消息 |
| 长消息/任务指派 | `1200-1500` | 重要指令、任务说明 |
| 玩家消息 | 不设置 | 玩家消息不显示 typing |

### 配置示例

```typescript
{
  id: 'scene-07',
  sender: '安全负责人',
  text: '【群聊】先走临时止血：CDN 对这套静态资源做一次全量刷新...',
  timestamp: '19:14',
  typingDelay: 1500,  // 任务指派，延迟较长
  targetCaseId: 'story_01_login_outage',
}
```

---

## 四、消息类型与写作技巧

### 4.1 群聊消息

- 前缀 `【群聊】`
- 内容要像真实工作群：简洁、带技术术语、偶尔有错别字
- 避免过于正式的书面语

```typescript
// ✅ 好的写法
text: '【群聊】DB 节点 CPU 打满，慢查询日志刷屏，看着像在扫全表。'

// ❌ 避免
text: '【群聊】尊敬的各位同事，数据库服务器的 CPU 使用率已达到最大值...'
```

### 4.2 私聊消息

- 前缀 `【私聊】`
- 内容更私人化：吐槽、鼓励、情绪宣泄
- 可以用 emoji 增加真实感

```typescript
// 吐槽型
text: '【私聊】说实话这周真的太累了，连着三个晚上加班。等这波过去请你喝奶茶 🧋'

// 鼓励型
text: '【私聊】今晚辛苦你了，处理得很专业。等这波过去我请大家撸串 🍢'
```

### 4.3 教学铺垫消息

- 在 `targetCaseId` 消息前 1-2 条
- 自然引出即将用到的技术/工具
- **不要**带 `targetCaseId`，避免触发 gating

```typescript
// story_01 (Reqable 抓包) 前的铺垫
{
  id: 'scene-06a',
  sender: '同事',
  text: '【群聊】你会用 Reqable 吗？听说抓 HTTPS 比 Charles 方便...',
  timestamp: '19:13',
}

// story_03 (SQL 注入) 前的铺垫
{
  id: 'scene-13b',
  sender: '安全负责人',
  text: '【群聊】SQL 注入你了解吗？搜索接口那边的写法我有点担心...',
  timestamp: '19:40',
}
```

### 4.4 闲聊调剂消息

- 插入在任务完成后或紧张剧情中间
- 模拟真实加班场景
- 缓解玩家压力

```typescript
// 外卖/咖啡
text: '【群聊】外卖到了，大家先吃两口再继续。咖啡机没水了，谁顺便加一下？'

// 复盘会
text: '【群聊】顺便说一句，明天复盘会几点？我得提前准备一下服务器端的时间线。'
```

---

## 五、场景 ID 命名规范

### 基础编号

- 主线场景：`scene-01`, `scene-02`, ...
- 插入场景：在原 ID 后加字母，如 `scene-06a`, `scene-13b`

### 命名原则

1. 保持顺序性（便于阅读）
2. 插入新场景时用字母后缀
3. 避免删除已有 ID（可能被测试引用）

---

## 六、标准写作流程

### Step 1: 规划时间线

1. 确定剧情起止时间（如 19:00-21:30）
2. 标记关键任务节点
3. 计算消息间隔

### Step 2: 角色分配

1. 确定每条消息的发送者
2. 保持角色风格一致
3. 合理分配私聊/群聊

### Step 3: 写作消息内容

1. 先写主线消息（带 targetCaseId 的）
2. 补充教学铺垫（任务前 1-2 条）
3. 添加闲聊调剂（任务后）
4. 丰富私聊内容

### Step 4: 配置元数据

1. 添加 timestamp
2. 配置 typingDelay（长消息/重要消息）
3. 检查 targetCaseId 和 requiresClueSync

### Step 5: 验证与测试

```bash
# 构建验证语法
pnpm build

# 运行 E2E 测试
pnpm exec playwright test --project=chromium tests/e2e/story-mode-wechat-*.spec.ts
```

---

## 七、批量添加内容的脚本模板

### 添加时间戳

```javascript
// 运行: node scripts/add-timestamps.js
const fs = require('fs');
let content = fs.readFileSync('storylines.ts', 'utf8');

const timestamps = {
  'scene-02': '19:03',
  'scene-03': '19:05',
  // ... 更多映射
};

for (const [sceneId, timestamp] of Object.entries(timestamps)) {
  const regex = new RegExp(
    `(id: '${sceneId}',[\\s\\S]*?text: '[^']+',)(?!\\s*\\n\\s*timestamp:)`,
    'g'
  );
  content = content.replace(regex, `$1\n      timestamp: '${timestamp}',`);
}

fs.writeFileSync('storylines.ts', content);
```

### 插入新场景

```javascript
const fs = require('fs');
let content = fs.readFileSync('storylines.ts', 'utf8');

const afterSceneId = 'scene-13';
const newScene = `
    {
      id: 'scene-13a',
      sender: '产品',
      channel: 'WeChat',
      text: '【群聊】刚刚收到 BI 那边的数据，今晚转化率掉了 40%...',
      timestamp: '19:38',
      typingDelay: 1200,
    },`;

const pattern = `id: '${afterSceneId}'`;
const idx = content.indexOf(pattern);
const blockEnd = content.indexOf('},', idx) + 2;
content = content.slice(0, blockEnd) + newScene + content.slice(blockEnd);

fs.writeFileSync('storylines.ts', content);
```

---

## 八、检查清单

### 发布前检查

- [ ] 所有消息都有 timestamp
- [ ] 长消息/任务消息配置了 typingDelay
- [ ] 每个 targetCaseId 前有教学铺垫
- [ ] 群聊/私聊前缀正确
- [ ] 角色说话风格一致
- [ ] 时间线合理（间隔适当）
- [ ] `pnpm build` 通过
- [ ] E2E 测试通过

---

## 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-01-25 | v1.0 | 初始版本，基于 P0/P1 实现经验整理 |
