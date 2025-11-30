# ADR-0017: Reqable 官方文档对齐计划

## 状态
Accepted (All Phases Complete)

## 日期
2024-11-29

## 背景

当前 ReqableSimulator 已实现了基础的抓包工具模拟功能，但与真实 Reqable 官方文档描述的功能存在较大差距。根据官方文档 (https://reqable.com/docs/) 的分析，我们需要系统性地补齐缺失功能，确保用户在游戏中学到的操作可以直接迁移到真实工具。

### 当前实现状态

**已实现（70-90% 完成度）**：
- Traffic List 基础列表
- Quick Bar 工具栏
- SSL Certificate 证书安装
- Breakpoint 断点功能
- Rewrite 重写规则
- Script 脚本编辑器
- Gateway/Mirror/Highlight 规则
- Diff Viewer / Network Throttle

**严重缺失**：
- Explorer 侧边栏（Favorite/Bookmark/Domain/Structure）
- Traffic List 高级功能（列配置/排序/拖拽）
- Composer 完整功能（Authorization/Cookie/Metrics）
- Collection 真实管理功能
- Toolbox 工具箱（10个实用工具）

## 决策

按照官方文档章节顺序，分 5 个阶段逐步对齐：

### Phase 1: Traffic List 基础增强 (优先级: P0)
- 列配置功能（右键表头弹出菜单）
- 列宽拖拽调整
- 按列排序（点击表头切换升序/降序）
- 状态指示灯（绿色完成/黄色失败/灰色进行中）
- 更多列选项（ID, Protocol, Duration, Size 等）

### Phase 2: Explorer 侧边栏 (优先级: P1)
- Domain 域名分组树视图
- Structure 目录结构树
- Bookmark 书签过滤功能
- Favorite 收藏夹功能
- Application 应用过滤（模拟）

### Phase 3: Composer 完善 (优先级: P1)
- Authorization 认证方式（Basic Auth, Bearer Token, API Key, Digest Auth）
- Cookie Manager 管理器
- Request Metrics 性能指标面板
- Protocol 选择（HTTP/1.1, HTTP/2）

### Phase 4: Collection 真实功能 (优先级: P2)
- 保存 API 到集合
- 集合文件夹管理（支持 4 级子目录）
- 导入/导出（支持 Postman 格式）

### Phase 5: Toolbox 工具箱 (优先级: P2)
- Base64 编解码
- URL 编解码
- MD5 计算器
- 时间戳工具
- JSON/XML/HEX Viewer

## 技术方案

### 1. Traffic List 增强
```typescript
// 新增状态
const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

// 列配置持久化
useEffect(() => {
  localStorage.setItem('reqable_columns', JSON.stringify(columns));
}, [columns]);
```

### 2. Explorer 侧边栏
```typescript
// 新增 Explorer 组件
interface ExplorerProps {
  requests: NetworkRequest[];
  onFilter: (filter: ExplorerFilter) => void;
}

type ExplorerView = 'favorite' | 'bookmark' | 'domain' | 'structure';
```

### 3. Authorization 支持
```typescript
type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'digest';

interface AuthConfig {
  type: AuthType;
  basic?: { username: string; password: string };
  bearer?: { token: string };
  apikey?: { key: string; value: string; addTo: 'header' | 'query' };
  digest?: { username: string; password: string; realm?: string };
}
```

## 验收标准

### Phase 1 验收
- [ ] 右键表头可配置显示/隐藏列
- [ ] 列宽可拖拽调整，配置持久化
- [ ] 点击表头可排序，支持升序/降序切换
- [ ] 每行左侧显示状态指示灯

### Phase 2 验收
- [ ] 侧边栏可切换 Domain/Structure/Bookmark/Favorite 视图
- [ ] Domain 视图按域名分组显示请求数量
- [ ] Structure 视图按 URL 路径显示目录树
- [ ] 点击书签/收藏可快速过滤列表

### Phase 3 验收
- [ ] Composer 支持 4 种认证方式
- [ ] Cookie 可查看/编辑/删除
- [ ] Metrics 面板显示 DNS/TCP/TLS/TTFB 等指标

### Phase 4 验收
- [ ] 可保存当前请求到集合
- [ ] 支持创建/重命名/删除集合文件夹
- [ ] 可导入 Postman Collection JSON

### Phase 5 验收
- [ ] 工具箱包含至少 6 个实用工具
- [ ] 工具可从侧边栏快速访问

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 功能过多导致 UI 臃肿 | 用户体验下降 | 参考官方 UI 布局，保持简洁 |
| 列配置状态管理复杂 | 维护困难 | 使用 localStorage 持久化 |
| Authorization 实现复杂 | 开发周期长 | 先实现 Basic/Bearer，后续迭代 |

## 参考文档

- Reqable 官方文档: https://reqable.com/en-US/docs/
- Traffic List: https://reqable.com/en-US/docs/capture/list
- List Column: https://reqable.com/en-US/docs/capture/column
- Explorer: https://reqable.com/en-US/docs/capture/explorer
- Collection: https://reqable.com/en-US/docs/rest/collection
- Authorization: https://reqable.com/en-US/docs/rest/authorization
