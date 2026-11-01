# 安装验证结果

日期：2026-10-27。

- 已审阅上游三个技能目录的全部 12 个文件，安装后逐字节一致；额外保留三份 MIT LICENSE，总计 15 个技能文件。
- 原始附件所有文件逐字节保持一致，包括 README、src、package.json 与 pnpm-lock.yaml。
- `pnpm install --frozen-lockfile --ignore-scripts` 成功；`pnpm typecheck` 成功（TypeScript 5.9.3）。依赖安装仅用于验证，node_modules 不进入源码包。
- `python scripts/verify-skills.py` 成功：文件集合、SHA-256、frontmatter、全部 Markdown 相对链接、空 pages 均通过。
- Codex CLI 0.164.0：使用临时隔离 CODEX_HOME 启动 app-server，initialize 后调用 skills/list（项目 cwd，forceReload=true），返回如下三个 repo 级 enabled 技能。该探针已结束；不依赖全局安装，不发起模型请求。
- 未执行微信构建或添加示例页；空 pages 的构建限制仍保留。本次无业务功能变更，无真机验收声明。
- 包通过白名单生成：原附件文件 + 三个技能目录 + 本次说明/校验文件。排除依赖、Git、临时下载、探针配置及凭据；所有文档与清单使用相对项目路径。

```json
[
  {
    "name": "codebase-design",
    "path": ".agents/skills/codebase-design/SKILL.md",
    "scope": "repo",
    "enabled": true
  },
  {
    "name": "prototype",
    "path": ".agents/skills/prototype/SKILL.md",
    "scope": "repo",
    "enabled": true
  },
  {
    "name": "tdd",
    "path": ".agents/skills/tdd/SKILL.md",
    "scope": "repo",
    "enabled": true
  }
]
```

## 实际安装文件

- `.agents/skills/codebase-design/agents/openai.yaml`
- `.agents/skills/codebase-design/DEEPENING.md`
- `.agents/skills/codebase-design/DESIGN-IT-TWICE.md`
- `.agents/skills/codebase-design/LICENSE`
- `.agents/skills/codebase-design/SKILL.md`
- `.agents/skills/prototype/agents/openai.yaml`
- `.agents/skills/prototype/LICENSE`
- `.agents/skills/prototype/LOGIC.md`
- `.agents/skills/prototype/SKILL.md`
- `.agents/skills/prototype/UI.md`
- `.agents/skills/tdd/agents/openai.yaml`
- `.agents/skills/tdd/LICENSE`
- `.agents/skills/tdd/mocking.md`
- `.agents/skills/tdd/SKILL.md`
- `.agents/skills/tdd/tests.md`
