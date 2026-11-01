# Dentic starter

以 README.md 的业务规则为准。当前为无页面的重设计起点；安装或更新技能时保持 `src/app.config.ts` 的 `pages: []`，不生成业务 UI。

产品保持纯离线、本地存储、零后端。面向微信小程序，使用 Taro 组件及端能力，遵循现有 Tailwind 3 配置。

使用项目技能前阅读 [使用说明](docs/skills.md) 的 Taro 适配边界。技能位于 `.agents/skills/`，来源和逐文件校验值见 `skills-provenance.json`。这些文件是项目安装，不依赖个人全局目录。

后续明确授权原型任务时才调用 prototype；浏览器原型只证明设计或纯逻辑，不代表微信端兼容性。端能力和布局须在微信开发者工具及真机验证。
