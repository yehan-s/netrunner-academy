# Lesson：Feature Flag 热补丁与灰度 API 回退

## 教学目标
- 学会使用 **Chrome DevTools Console**（参考：[Chrome DevTools Console 官方指南](https://developer.chrome.com/docs/devtools/console/)）在前端注入一次性补丁，强制回退实验特性。
- 熟悉 **Reqable Composer** 的操作（参考：[Reqable Composer 官方指南](https://docs.reqable.com/guide/composer/)），构造携带鉴权头与 JSON Body 的内部 API 调用，完成灰度策略回滚。
- 结合剧情，将调查结果同步到微信群，让团队成员理解补丁效果与后续动作。

## 场景一：特性开关热补丁（story_incident_feature_flag_patch）
1. 在浏览器中打开事故落地页，按 `Cmd+Option+I`（macOS）或 `Ctrl+Shift+I`（Windows）进入 DevTools，切换到 **Console** 面板。
2. 通过 `window.featureFlags` 检查当前实验状态，确认 `forceLegacyFlow`、`disablePromo` 等字段是否已暴露在全局配置（DevTools Console 支持直接读取对象）。
3. 依据官方指南复制脚本：
   ```js
   window.featureFlags.forceLegacyFlow(true);
   window.featureFlags.disablePromo('wx-landing-ab');
   console.info('Emergency rollback applied @', new Date().toISOString());
   ```
   执行后应看到页面即时切回旧版组件。
4. 刷新一次页面验证脚本是否生效（若后端仍下发实验配置，则需要同时通知灰度平台），并把截图与控制台输出同步到微信群。

## 场景二：灰度 API 回退（story_incident_gray_release）
1. 打开 Reqable，保持代理接入微信内置浏览器，确认流量列表能捕获 `ops.corp` 域名请求。
2. 在 **Composer** 新建标签，填入：
   - Method：`POST`
   - URL：`https://ops.corp/api/gray-release/override`
   - Headers：`X-OPS-Token: <incident-token>`、`Content-Type: application/json`
   - Body：
     ```json
     {
       "experimentId": "wechat-ab-992",
       "action": "disable",
       "reason": "incident-hotfix",
       "owner": "wechat-security"
     }
     ```
3. 发送请求后，观察响应 `{"status":"ok","rollout":"disabled"}`，并在 Reqable 的历史列表保存该请求以便复盘。
4. 返回浏览器刷新落地页，确认实验已经回退，再到微信群点击“同步线索”，确保剧情 gating 符合规则。

> 注意：两个操作都属于紧急止血手段，仅供教学。真实场景下仍需在事件结束后补齐治理（完善灰度审批、补充自动化发布检查等）。