# WeChat 剧情创作流程落地 - 任务列表

- [x] 新增 ADR `docs/adr/0011-wechat-story-authoring-process.md`，明确剧情创作的三步流程（Lesson → 剧情草案 → Story 关卡 + 测试），以及“先剧情评审、后实现”的硬性要求。
- [x] 在 `docs/lessons/wechat-story-authoring.md` 中补充：
  - 剧情创作必须先写完整微信群聊文案，经过产品/教学负责人评审通过后，才允许进入 Story 关卡设计；
  - 剧情模式是环环相扣的长流程，每个任务节点依赖前文线索，不允许当做独立刷题；
  - 剧情模式下的 `story_XX_*` 关卡难度和复杂度必须高于普通 `case_XX` 单关，至少覆盖 2 个以上工具/知识点。
- [ ] 在代码评审模板或团队约定中增加一条检查项：凡涉及 `storylines.ts` / `Story` 类别关卡的 PR，需附上对应 Lesson、ADR 和 Tasks 的链接，以便 reviewers 快速核对流程是否遵守。