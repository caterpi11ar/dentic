# 刷了吗 · Taro 本地刷牙旅程

基于 sanidhyy/duolingo-clone 的界面风格，按用户授权将语言学习改为刷牙业务。Taro 4.1.11 + React 18，面向微信小程序；纯离线、本地存储、零后端。保留原有 skills、依赖锁文件与上游 MIT 许可。

## 当前实现

- “刷牙 / 任务 / 成就 / 我的”四个入口；路径节点为“第 N 天”，每组显示 7 天并随累计天数继续展开。
- 按累计完成的业务日期推进；同一天早晚刷牙仍算一天，漏一天不清零。路径不是日历预约，也不能靠重复刷牙跳过天数。
- 3 秒准备 + 15 区域 × 10 秒，完整 150 秒结束才能保存；可暂停/继续，切到后台自动暂停，返回后手动继续。退出未完成会话不保存，不支持断点恢复。
- 每步区域、剩余时间、下一步与文字提示；区域切换提示音、轻震动、前台亮屏均为尽力调用，失败不阻断流程。已迁入旧项目原版开始、15 区域和完成语音，以及 step-ding 提示音。
- `brushing_records` 按业务日 + 晨晚去重覆盖，以完成时刻决定日期/时段；每日 04:00 开始，04:00–11:59 为早间，其余为晚间。
- 今日早晚状态、累计日期数、连续日期数、早晚双完成日期数、任务、累计里程碑及最近 10 条完成记录。
- 原 `lingo_taro_progress_v1` 语言学习记录保留但不再读取，不转成刷牙天数。支持旧刷牙记录缺少 session 时默认晨间；非法条目过滤，全坏或根结构错误时提示并保留原始存储，只有用户明确清除才重置。
- 声音与语音偏好独立保存于 `dentic_brush_settings_v1`，未设置时分别读取旧 `user_settings.soundEnabled` / `voiceEnabled`；关闭音效不会关闭系统震动。

尚未实现首次引导、月完成率/周报、昵称头像编辑、分享与提醒。历史业务约束保存在 `docs/dentic-business-rules.md`，其中旧实现能力不代表全部恢复。

## 开发和验证

```sh
pnpm run typecheck
pnpm run test:unit
pnpm run build:weapp
pnpm run dev:weapp
```

微信开发者工具导入项目根目录，`miniprogramRoot` 为 `dist/`，当前使用 `touristappid`。`dev:weapp` 是持续编译，不等于启动微信模拟器。微信开发者工具及真机上的布局、震动、亮屏、音频需单独验证。

H5 辅助预览：`pnpm run dev:h5`，地址 `http://127.0.0.1:10086/`；生产构建 `pnpm run build:h5`。不要同时执行多端构建；完成生产构建后如需预览，重新启动开发服务。

行为测试覆盖准备倒计时、150 秒完成、暂停冻结、未完成拒绝保存、日期边界、同日去重、累计/连续天数与旧数据读取。测试时钟推进只能证明状态逻辑，不能代替真机计时与后台测试。

## 文件和来源

- `src/domain/progress.ts`：刷牙状态机、业务日期、记录与统计。
- `src/domain/storage.ts`：Taro 本机存储与设置。
- `src/pages/lesson/index.tsx`：刷牙引导；沿用已有内部路由名，界面不再显示课程。
- `src/components/ui.tsx`、`src/app.css`：共享界面及已修复的底部导航。
- `licenses/Lingo-MIT.txt`、`docs/lingo-migration.md`：原界面来源与迁移记录。
- `docs/skills.md`、`.agents/skills/`：原样保留的技能文件，其空页面记录为历史安装状态。

刷牙迁移前备份位于 `.local/backups/brushing-business-20261031/before.zip`。

## 原版牙齿模块与音频

仅复用旧 Dentic 的牙齿几何布局、区域高亮和 18 个原音频。刷牙页其余部分（背景、计时、提示卡、进度、按钮）统一采用当前多邻国系 UI；准备页、完成页和主页面延续现有设计。来源记录见 `docs/original-guide-migration.md`。

进入刷牙页后自动开始 3 秒倒计时，不再显示二次确认准备页；牙齿高亮使用当前主题绿色。读取记录失败时停止启动并提示返回，原数据保留。

## 陪伴宠物

“我的”接入 SLM-8 的 20 只 Fluent 动物，素材与 MIT 许可全部打包在本地。可更换、点击互动、进入刷牙；今日反馈与累计天数读取真实本机刷牙记录。宠物选择使用独立 `dentic_pet_v1` 存储，清除刷牙记录保留宠物选择。原图是静态 PNG，浮动和弹跳为 CSS 动效，不包含原生逐帧动作。

### 多动作宠物更新
“我的”不再提供刷牙入口。当前切换为 Frakassets Free Pets Pack 的 10 只多动作宠物，每只包含 4 个动作 × 4 个方向，按原 JSON 帧时长播放，支持点击开心、睡觉唤醒、转向和暂停。页面隐藏停止计时器。来源 https://frakassets.itch.io/free-pets-pack ，CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ ，PNG 未修改；选用 64px scroller outline lit，JSON 转为播放器配置。完整原包保存在 .local/pet-sources；原 Fluent 静态素材保留，但不再作为动态宠物使用。选择独立存于 dentic_sprite_pet_v1，旧选择与刷牙记录不改写。

宠物现自动随机散步或睡觉（每 8–14 秒重新选择），点击宠物或自动陪伴提示会开心 2.4 秒后恢复自动状态。个人页不再有手动动作按钮；刷牙提示卡显示同一只所选宠物，刷牙暂停/页面隐藏时停播，互动不改变刷牙记录或计时。
