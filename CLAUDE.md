# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**请始终使用中文回复用户。**

## 项目概述

"刷了吗" (Dentic) — 基于巴氏（Bass）刷牙法的微信小程序，引导用户按 15 个区域科学刷牙（约 2.5 分钟）。技术栈：Taro 4 + React 18 + TypeScript，目标平台为微信小程序（主）和 H5（辅）。

## 常用命令

```bash
pnpm install              # 安装依赖
pnpm run dev:weapp        # 开发模式（微信小程序，带 watch）
pnpm run dev:h5           # 开发模式（H5，带 watch）
pnpm run build:weapp      # 生产构建（微信小程序）
pnpm run build:h5         # 生产构建（H5）
pnpm lint                 # ESLint 检查（src/**/*.{ts,tsx}）
pnpm lint:fix             # ESLint 自动修复
pnpm format               # Prettier 格式化（src/**/*.{ts,tsx,scss}）
```

构建产物输出到 `dist/`。项目暂未配置测试框架。

## 架构

### 分层领域结构

```
pages/          → 页面编排层（3 个页面：index 刷牙主页、history 历史记录、settings 设置）
domains/brush/  → 刷牙功能领域
  hooks/        → 状态与副作用分离：useBrushSessionState → useBrushSessionEffects → useBrushSession（门面）
  components/   → 按流程状态拆分的 UI：BrushIdleState、BrushActiveState、BrushCompletedState、BrushCountdownOverlay
  effects/      → 平台副作用适配器（音频、震动、屏幕常亮）
  repositories/ → 数据访问层，桥接领域逻辑与存储服务
components/     → 共享组件（Calendar、BrushTimer、ToothScene、StepIndicator）
components/ui/  → 设计系统基础组件（Button、Card、Switch、List、Progress 等）
services/       → 与框架无关的业务逻辑（状态机、存储、统计、音频）
```

### 核心模式

- **不可变状态机**（`services/brushing.ts`）：纯函数返回新的 session 对象。状态流转：`idle → countdown → brushing ⇄ paused → completed`。
- **Hook 组合模式**：`useBrushSessionState`（纯状态）+ `useBrushSessionEffects`（副作用）组合为 `useBrushSession` 门面 Hook。
- **无全局状态管理**：所有状态通过 React Hooks + 微信本地存储（经 service 模块）管理。
- **导航**：自定义 `InPageTabBar` 组件，使用 `Taro.redirectTo()` 导航（非 Taro 内置 TabBar）。自定义导航栏（`navigationStyle: 'custom'`）。
- **日期边界**：业务日从凌晨 6:00 开始；早晚刷牙以 18:00 分界（`services/dateBoundary.ts`）。

### 样式体系

- Tailwind CSS 3.4 + `weapp-tailwindcss`（rem→rpx 自动转换）。
- CSS 自定义属性定义在 `app.scss`（`.theme-day` 类）中，通过 `tailwind.config.js` 映射为语义化色彩 token。
- 语义化颜色：primary、success、warning、info、danger、content-*、surface-*、line。
- 自定义字体：Poppins（标题）、Lora（正文）。
- 使用 `cn()` 工具函数（`components/ui/cn.ts`，基于 `clsx` + `tailwind-merge`）组合条件样式类。

### 路径别名

`@/*` → `src/*`（在 `tsconfig.json` 和 `config/index.ts` 中同时配置）。

## 代码规范

- Prettier 配置：无分号、单引号、尾逗号、100 字符行宽、2 空格缩进。
- 组件使用默认导出（default export）；服务使用命名导出（named export）。
- UI 文案和代码注释使用中文。
- 使用 ARIA 属性保障无障碍访问（`role`、`aria-label`、`aria-checked`、`aria-live`）。
- 使用 `motion-reduce:animate-none` 支持减弱动画偏好。
- Taro API 错误静默处理（`.catch(() => {})` 模式）。
