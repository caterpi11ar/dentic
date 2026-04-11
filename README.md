# 今天刷牙了吗

![今天刷牙了吗 Logo](./public/logo.png)

基于巴氏（Bass）刷牙法的微信小程序，引导用户科学刷牙、持续打卡，并支持家庭协作与排行榜激励。

## 小程序二维码

![今天刷牙了吗小程序二维码](./public/qrcode.jpg)

## 当前功能

- **巴氏刷牙全流程引导**：15 个区域逐步引导（含倒计时、步骤提示、完成反馈）
- **刷牙会话状态机**：空闲 / 倒计时 / 进行中 / 暂停 / 完成分态渲染
- **音频 + 震动 + 亮屏**：步骤播报、触觉反馈、刷牙中保持亮屏
- **早晚双时段打卡**：按业务日期自动归档，支持晨间/夜间完成状态展示
- **历史页日历统计**：月历查看、当天晨晚完成时间、连续天数/累计天数/本月完成率
- **家庭协作**：创建家庭、邀请加入、家庭看板、成员状态、互动（鼓励/提醒）
- **排行榜**：按累计天数和连续天数双维度切换，展示个人排名
- **个人中心**：头像昵称授权与同步、提醒/提示音/语音播报开关
- **天气信息**：首页展示本地天气（定位授权 + 缓存）
- **数据可靠性**：本地记录启动迁移到云端、失败上报进入重试队列
- **分享能力**：支持分享给好友与分享到朋友圈

## 页面与路由

来自 `src/app.config.ts`：

- `pages/index/index`：刷牙首页
- `pages/history/index`：历史统计
- `pages/family/index`：家庭主页（看板/成员/互动）
- `pages/family/create`：创建家庭
- `pages/family/join`：加入家庭
- `pages/rank/index`：排行榜
- `pages/profile/index`：个人中心（原设置能力已并入）

## 技术栈

| 领域 | 方案 |
|------|------|
| 框架 | Taro 4 + React 18 + TypeScript |
| 状态管理 | Zustand（vanilla store + 持久化） |
| 构建 | Taro CLI + Vite Runner |
| 样式 | Sass + Tailwind CSS |
| 3D 渲染 | three-platformize（Three.js 小程序适配） |
| 数据端 | 微信云开发（Cloud Functions + Cloud DB） |
| 工程质量 | ESLint + TypeScript typecheck |

## 项目结构（当前）

```text
src/
├── pages/
│   ├── index/           # 刷牙首页
│   ├── history/         # 历史统计
│   ├── family/          # 家庭（主页/创建/加入）
│   ├── rank/            # 排行榜
│   └── profile/         # 个人中心（设置）
├── domains/
│   └── brush/
│       ├── hooks/       # 刷牙会话状态与副作用编排
│       ├── components/  # 刷牙流程分态组件
│       ├── effects/     # 音频/震动/亮屏等端能力适配
│       └── repositories/# 刷牙数据仓储（记录保存、同步）
├── components/          # 页面级与通用 UI 组件
├── stores/              # auth/profile/settings/family/records 状态
├── services/
│   ├── api/             # 云函数调用封装及各域 API
│   ├── migration.ts     # 本地历史迁移到云端
│   ├── syncQueue.ts     # 失败重试队列
│   ├── weatherService.ts# 天气服务
│   └── ...
├── constants/           # 刷牙步骤、天气映射等常量
└── assets/              # 图标、音频、字体等资源

cloud/functions/
├── brush/               # upsertRecord / getDailyStatus
├── family/              # 家庭与互动相关动作
├── rank/                # 排行榜
└── user/                # 用户资料
```

## 云函数动作一览

- `brush`：`upsertRecord`、`getDailyStatus`
- `family`：`createFamily`、`joinFamily`、`leaveFamily`、`getFamily`、`getFamilyPreview`、`getDashboard`、`sendInteraction`、`getInteractions`
- `rank`：`getLeaderboard`
- `user`：`getProfile`、`updateProfile`

## 快速开始

```bash
# 安装依赖
pnpm install

# 微信小程序开发
pnpm run dev:weapp

# 微信小程序构建
pnpm run build:weapp

# 代码检查
pnpm run lint

# 自动修复 lint
pnpm run lint:fix

# 类型检查
pnpm run typecheck
```

### 本地调试说明

1. 使用 `pnpm run dev:weapp` 生成 `dist/`。
2. 微信开发者工具导入项目根目录。
3. 本项目 `project.config.json` 中：
   - `miniprogramRoot`: `dist/`
   - `cloudfunctionRoot`: `cloud/functions/`
4. 需要在微信开发者工具中同步上传/部署对应云函数后再联调云端能力。

## License

MIT
