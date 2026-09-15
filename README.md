# 今天刷牙了吗

[![Platform](https://img.shields.io/badge/Platform-WeChat%20Mini%20Program-07C160)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![Taro](https://img.shields.io/badge/Taro-4.1.11-1E80FF)](https://taro.zone/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-black)](#license)

[中文](./README.md) | [English](./README.en.md)

![今天刷牙了吗 Logo](./public/logo.png)

基于巴氏（Bass）刷牙法的微信小程序，引导儿童科学刷牙、持续打卡。

**完全离线运行，零后端依赖**——所有数据仅保存在本机，不采集、不上传任何个人信息。

## 小程序二维码

![今天刷牙了吗小程序二维码](./public/qrcode.jpg)

## 当前功能

- **巴氏刷牙全流程引导**：15 个区域逐步引导（含倒计时、步骤提示、完成反馈）
- **刷牙会话状态机**：空闲 / 倒计时 / 进行中 / 暂停 / 完成分态渲染
- **音频 + 震动 + 亮屏**：步骤播报、触觉反馈、刷牙中保持亮屏
- **早晚双时段打卡**：按业务日期自动归档，支持晨间/夜间完成状态展示
- **历史页日历统计**：月历查看、当天晨晚完成时间、连续天数/累计天数/本月完成率
- **个人中心**：本机头像昵称、提醒/提示音/语音播报开关
- **分享能力**：支持分享给好友与分享到朋友圈
- **隐私友好**：无网络请求、无定位权限、无账号体系

## 页面与路由

来自 `src/app.config.ts`：

- `pages/index/index`：刷牙首页
- `pages/history/index`：历史统计
- `pages/profile/index`：个人中心（含设置）

## 技术栈

| 领域 | 方案 |
|------|------|
| 框架 | Taro 4 + React 18 + TypeScript |
| 状态管理 | Zustand（vanilla store + 持久化） |
| 构建 | Taro CLI + Vite Runner |
| 样式 | Sass + Tailwind CSS |
| 数据端 | 无（纯本地 `Taro.setStorageSync`） |
| 工程质量 | ESLint + TypeScript typecheck |

## 项目结构（当前）

```text
src/
├── pages/
│   ├── index/           # 刷牙首页
│   ├── history/         # 历史统计
│   └── profile/         # 个人中心（设置）
├── domains/
│   └── brush/
│       ├── hooks/       # 刷牙会话状态与副作用编排
│       ├── components/  # 刷牙流程分态组件
│       ├── effects/     # 音频/震动/亮屏等端能力适配
│       └── repositories/# 刷牙数据仓储（记录保存）
├── components/          # 页面级与通用 UI 组件
├── stores/              # profile/settings/records 状态
├── services/            # 状态机、日期边界、存储、音频、分享等
├── constants/           # 刷牙步骤等常量
└── assets/              # 图标、音频等资源
```

## 数据存储

- 全部数据通过 `Taro.setStorageSync` 保存在**本机**（按「设备 + 小程序」隔离）。
- **注意**：卸载小程序、清理微信缓存或更换设备会**导致数据丢失**；重要记录请自行留存。
- 单 key 上限 1MB、总上限 10MB，刷牙记录体量远低于该限制。

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
2. 微信开发者工具导入项目根目录（`project.config.json` 中 `miniprogramRoot` 为 `dist/`）。
3. 无需配置服务器域名、无需部署云函数，项目开箱即可运行。

## 成功案例

### 线下幼儿刷牙健康课教具实践（首次合作）

在一次线下幼儿刷牙健康课中，小程序首次作为课堂“教具”使用，老师在课堂演示后，家长可按小程序步骤陪同孩子课后练习，形成“课堂学习 + 家庭巩固”的闭环。

![成功案例：线下幼儿刷牙健康课](./public/success-case-kindergarten-class.jpg)

## License

MIT
