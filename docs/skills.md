# 项目技能选型与使用

核查日期：2026-10-27。此次仅安装技能与说明，原始 starter 的业务源码、README、依赖与锁文件逐字节保留。

## 已安装

来源为 [mattpocock/skills](https://github.com/mattpocock/skills)，提交 `59db609eb1e18aaf59b63284d0e52255aff0c63c`，插件版本标识 1.3.1，MIT。提交号是本包的精确版本依据，不能仅凭插件版本判断内容相同。

| 技能 | 上游目录 | 用途 | Taro 限制 |
| --- | --- | --- | --- |
| prototype | skills/engineering/prototype | 比较设计方向、验证状态逻辑 | HTML、URL 参数、键盘和浏览器路由示例仅适用于独立原型；小程序实现须改用 Taro 组件、触摸事件与路由参数 |
| codebase-design | skills/engineering/codebase-design | 设计模块接口，分离纯逻辑与端副作用 | 数据库、支付、远程适配器只是通用例子；本项目仅实现实际需要的本地能力 |
| tdd | skills/engineering/tdd | 按可观察行为逐步验证实现 | 当前无测试运行器；未来按具体任务选择，不能把 typecheck 当行为测试；时间、存储和端能力应在恰当边界替换 |

三个目录共 12 个上游文件，均原样安装，另各附一份上游 LICENSE。已阅读全部技能、相对引用文档与 agents/openai.yaml；选定目录无可执行脚本。没有运行上游仓库安装脚本、插件 setup 或全量技能安装。

## 来源核查与已有内容

指定 GitHub 页面 HTTP 200，最终地址仍为 `https://github.com/mattpocock/skills`，未观察到仓库重定向。Git HTTPS 克隆因连接重置/超时失败（沙箱外重试亦失败），但 GitHub 页面与 codeload 归档可访问；归档注释给出上述提交。安装器通过该提交的 codeload 归档成功安装，并与已审阅归档逐文件比较。

上游目录为 `skills/engineering/`、`skills/productivity/`；README 提供插件安装和 `npx skills@latest add mattpocock/skills` 两种途径。本包选择固定提交、指定三个路径、指定项目目标目录，避免插件全量安装和自动更新。

原 Dentic 在提交 `370f64990c0575b6080706eb7c5293cdab8e8144` 已有以下六个项目技能；通过 GitHub 只读接口核对目录、SKILL.md 和 skills-lock.json。锁文件记录 source 与 computedHash，未记录上游提交；因此不能将旧副本说成当前上游版本。原仓库未修改。新 starter 附件未包含 `.agents/skills` 或技能锁文件。

| 候选 | 旧锁文件来源 | 许可核查 | 本次结论 |
| --- | --- | --- | --- |
| frontend-design | anthropics/skills | 旧副本附 Apache-2.0 LICENSE.txt，已读取 | 通用视觉设计可选；字体、Motion、hover 等网页建议需适配，暂不与 prototype 重叠安装 |
| brand-guidelines | anthropics/skills | 旧副本附许可文件，本次未核对全文 | 绑定 Anthropic 品牌，不适合 Dentic 品牌，排除 |
| design-md | google-labs-code/stitch-skills | 旧技能目录无许可，本次未核实上游许可 | 需要 Stitch MCP 与既有屏幕，不适合空项目，排除 |
| design-system | anthropics/knowledge-work-plugins | 旧技能目录无许可，本次未核实上游许可 | `../../CONNECTORS.md` 在旧目录树中缺失，不能直接搬运；待有组件系统再评估 |
| tailwindcss-mobile-first | josiahsiegel/claude-plugin-marketplace | 旧技能目录无许可，本次未核实上游许可 | 面向 Tailwind 4，含 @theme/@utility 和浏览器标签，当前 Tailwind 3 不直接适用 |
| web-design-guidelines | vercel-labs/agent-skills | 旧技能目录无许可，本次未核实上游许可 | 每次远程抓取网页规范，内容未固定且非小程序验收工具，暂不安装 |
| diagnosing-bugs | mattpocock/skills（同一固定提交） | MIT | 已读 SKILL.md；适合复杂故障排查，但当前空项目无故障需求，后续按需安装并先审阅其 shell 模板 |

未核实许可的候选均不复制进交付包。运行环境中已有全局技能和 mattpocock 插件缓存，不计入本次安装，也不修改它们。

## 调用与边界

从解压后的项目根目录启动 Codex，下一轮使用 `/skills` 或 `$` 选择器查看技能。若同时显示全局同名技能，选择路径为本项目 `.agents/skills/<name>/SKILL.md` 的条目；官方说明同名技能不会合并。不要再安装一套同名插件。

- `$prototype 比较刷牙引导的三个布局方向；这次已授权独立原型，只使用本地虚拟数据。`
- `$codebase-design 设计计时状态与 Taro 音频、震动和本地存储之间的接口。`
- `$tdd 按 README 规则测试完成记录的公开接口，先列出可观察行为和测试边界。`

安装技能本身不授权执行这些示例。空项目阶段不生成原型、不注册页面。未来原型以临时分支或独立交付物保存；保持主 starter 无页面，直到用户明确开始页面开发。不要照抄浏览器 DOM、React Router 或 Next.js 示例到小程序。

本项目的实际数据只存在本地。技能中的数据库、网络服务示例不构成引入后端的理由。布局验收覆盖小屏、触控、安全区和文字溢出；音频、震动、前后台切换与存储行为需要微信端验证。浏览器视觉结果不能替代这些验证。

tdd 引用的 codebase-design 已一并安装；code-review 是后续评审建议，不是执行红绿循环的必要文件，本次未安装。需要评审流程时再选型。codebase-design 的 DESIGN-IT-TWICE 分支要求并行子代理，仅在调用该分支且运行环境允许时使用；本次安装没有启动子代理。

## 更新、卸载与验证

精确文件清单、SHA-256、来源路径与版本保存在 `skills-provenance.json`，这是自定义来源清单，不冒充 skills CLI 的 skills-lock.json。

更新时先选择新提交，下载到临时目录，阅读变更及引用文件，核实许可，比较本清单；有本地修改先保存补丁。验证新内容后仅替换这三个技能目录，更新来源清单、文件哈希和本说明。不要用浮动 main 覆盖现有文件。

卸载路径：`.agents/skills/prototype/`、`.agents/skills/codebase-design/`、`.agents/skills/tdd/`。只删除所选目录并更新清单；全部卸载时还可删除本说明、来源清单、`scripts/verify-skills.py`，并移除 AGENTS.md 中的技能指针。不会影响业务源码或全局技能。

本包自带 `python scripts/verify-skills.py`，检查文件集合与哈希、frontmatter、Markdown 相对文件链接和空 pages。安装依赖后运行 `pnpm typecheck`。空 pages 导致微信构建不完整属于已知预期，不能为通过构建添加示例页。

发现规则依据 [官方 OpenAI 文档](https://learn.chatgpt.com/docs/build-skills)：Codex 从当前工作目录向仓库根目录扫描 `.agents/skills`，SKILL.md 必须包含 name 和 description。不要从解压目录的父目录启动并期待向下自动扫描。该说明使用 openai-docs 技能核查。

## SLM-5 后续授权（2026-10-27）

用户已明确允许添加最小空白入口以启用浏览器访问，当前注册 `pages/index/index`。上文空 pages 验收是技能安装时的历史状态；`verify-skills.py` 现仅验证技能清单、哈希、元数据和链接，不再检查业务路由。业务 UI 仍未实现。
