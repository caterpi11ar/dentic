# AI 健康能力接入方案

> 状态：RFC（征求意见）  
> 创建日期：2026-04-09  
> 作者：@qin.dai

## 背景

Dentic 小程序已积累完整的刷牙行为数据（时间、时长、步骤完成度、连续天数等），但目前仅有基础统计展示。接入腾讯混元大模型，将原始数据转化为个性化健康洞察，提升用户感知价值和留存。

**核心定位**：数据洞察型（非对话式），AI 主动为用户解读刷牙数据。

**接入方式**：腾讯云混元 API（OpenAI 兼容接口），通过云函数代理调用。

---

## 功能规划

### P0: AI 刷牙周报

每周自动生成个性化口腔健康分析卡片，嵌入历史页。

- 内容：习惯评价、数据亮点、改善建议、鼓励语（3-4 句，约 100 字）
- 触发：用户打开历史页时，缓存 7 天
- Token 消耗：约 800 token/次，极低

### P1: AI 完成提示

刷牙完成后，在完成页追加 AI 个性化反馈和口腔健康小知识。

- 内容：1 句个性化鼓励（含具体数据）+ 1 句趣味科普（约 50 字）
- 频控：每用户每天最多 1 次 AI 调用，超出使用本地预设文案
- Token 消耗：约 500 token/次

### P2: 家庭 AI 点评（后续探索）

家庭看板中 AI 对全家本周数据点评，制造社交氛围。

---

## 技术架构

### 新增云函数 `ai`

```
cloud/functions/ai/
  index.js              ← action 路由入口（复制 brush/index.js 模式）
  weeklyReport.js       ← P0: 周报 handler
  completionTip.js      ← P1: 完成提示 handler
  lib/
    hunyuan.js          ← 混元 API 封装（Node.js https 模块，OpenAI 兼容格式）
    prompts.js          ← 系统提示词模板
    cache.js            ← ai_cache 集合读写
    dataBuilder.js      ← 刷牙数据聚合与脱敏
```

### 混元 API 调用

| 配置项 | 值 |
|--------|------|
| 端点 | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| 认证 | 云函数环境变量 `HUNYUAN_API_KEY`（控制台配置，不入代码） |
| 模型 | `hunyuan-standard` |
| 响应模式 | 非流式（云函数无法 SSE 推送，输出短小） |
| max_tokens | 300 |
| temperature | 0.7 |
| 超时策略 | 错误处理 + 1 次重试，总超时 15 秒 |

### 前端 API 层

新增 `src/services/api/aiApi.ts`，遵循现有 `brushApi.ts` 封装模式：

```ts
getWeeklyReport() → Promise<WeeklyReportData>
getCompletionTip(params) → Promise<CompletionTipData>
```

### 缓存策略（两级）

**云端缓存**：新增 `ai_cache` 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| openId | string | 用户标识 |
| cacheKey | string | 缓存键，如 `weekly_2026-04-07` |
| content | object | AI 返回的结构化内容 |
| createdAt | number | 生成时间戳 |
| expiresAt | number | 过期时间戳 |

- 周报：key = `weekly_{weekMonday}`，TTL 7 天
- 完成提示：key = `tip_{bizDate}`，TTL 24 小时
- handler 先查缓存，命中则跳过 AI 调用
- 过期清理：微信云数据库无自动 TTL 删除，需在云函数中查询时顺带清理过期记录（`expiresAt < now`），或定期通过定时触发器批量清理

**前端缓存**：Taro Storage 二级缓存，避免重复云函数调用。

---

## 数据管道

### 周报数据（云端聚合）

云函数直接查询 `brush_record` 集合，不依赖前端传入，避免数据篡改：

1. 查询当前用户本周（周一至周日）所有 `completed: true` 记录
2. 查询上周数据用于环比对比
3. 聚合计算：总次数、完成率（次数/14）、平均时长、早晚比例、连续天数
4. 组装精简 JSON 作为 prompt context

> **注意**：项目以凌晨 4:00 作为业务日切换边界（`BUSINESS_DAY_START_HOUR = 4`），早晚场次以 12:00 分界。云端数据聚合时需使用 `bizDate` 字段而非自然日期，确保与前端逻辑一致。

**空数据兜底**：若本周无任何刷牙记录，不调用 AI，直接返回预设的鼓励文案（如"新的一周，从一次刷牙开始吧"）。

### 完成提示数据（前端传入）

由前端调用时直接传入，无需云端查询：
- `durationSec`、`completedSteps`、`streak`、`session`

### 数据脱敏原则

- 传递给混元 API 的 prompt 中**不包含任何用户标识**（openId、昵称、头像）
- 仅传递聚合统计数据（次数、时长、连续天数等纯数字）
- 家庭场景中使用「成员A/成员B」匿名化

---

## Prompt 设计

### 周报系统提示词

```
你是"今天刷牙了吗"小程序的 AI 助手，专注口腔健康。请用温暖鼓励的语气，
基于刷牙数据生成简短周报（3-4句话）。
包含：1）习惯评价 2）数据亮点 3）改善建议 4）鼓励语。不超过100字。
如果本周没有刷牙记录，请温和地鼓励用户开始培养刷牙习惯。
```

### 完成提示系统提示词

```
你是"今天刷牙了吗"小程序的 AI 助手，为刚完成刷牙的用户生成鼓励。
用1句个性化鼓励（含具体数据）和1句口腔健康小知识回复。
50字以内，语气活泼有趣。
```

### 用户数据上下文示例

```json
{
  "本周刷牙次数": 10,
  "完成率": "71%",
  "平均用时": "2分35秒",
  "连续天数": 12,
  "早刷完成": 5,
  "晚刷完成": 5,
  "上周刷牙次数": 8
}
```

---

## 前端 UI

### AI 周报卡片（嵌入历史页）

- **位置**：历史页日历与「当天记录」卡片之间
- **组件**：`src/components/AiWeeklyReport/index.tsx`
- **Hook**：`src/hooks/useAiWeeklyReport.ts`（参考 `useWeather.ts` 缓存优先模式）
- **加载态**：`animate-pulse` 骨架屏
- **错误处理**：失败时静默不显示，不干扰主体验

### AI 完成提示（嵌入完成页）

- **位置**：`BrushCompletedState.tsx` 的今日状态提示下方
- **交互**：不替换现有文案，AI 结果以动画追加
- **超时**：3 秒超时，失败静默不显示
- **触发**：`useBrushSessionEffects` 中 session 进入 `completed` 时调用

---

## 文件变更清单

| 操作 | 文件路径 |
|------|----------|
| 新建 | `cloud/functions/ai/index.js` |
| 新建 | `cloud/functions/ai/package.json` |
| 新建 | `cloud/functions/ai/weeklyReport.js` |
| 新建 | `cloud/functions/ai/completionTip.js` |
| 新建 | `cloud/functions/ai/lib/hunyuan.js` |
| 新建 | `cloud/functions/ai/lib/prompts.js` |
| 新建 | `cloud/functions/ai/lib/cache.js` |
| 新建 | `cloud/functions/ai/lib/dataBuilder.js` |
| 新建 | `src/services/api/aiApi.ts` |
| 新建 | `src/hooks/useAiWeeklyReport.ts` |
| 新建 | `src/hooks/useAiCompletionTip.ts` |
| 新建 | `src/components/AiWeeklyReport/index.tsx` |
| 修改 | `src/pages/history/index.tsx` |
| 修改 | `src/domains/brush/components/BrushCompletedState.tsx` |
| 修改 | `src/domains/brush/hooks/useBrushSessionEffects.ts` |

---

## 实施分期

### Phase 1: AI 周报（跑通全链路）

- [ ] 创建 `cloud/functions/ai/` 及 `lib/` 工具模块
- [ ] 实现 `lib/hunyuan.js` 混元 API 调用封装
- [ ] 实现 `lib/prompts.js` 系统提示词模板
- [ ] 实现 `lib/cache.js` 云端缓存读写
- [ ] 实现 `lib/dataBuilder.js` 刷牙数据聚合与脱敏
- [ ] 实现 `weeklyReport.js` 周报 handler
- [ ] 部署云函数，控制台配置环境变量 + 域名白名单
- [ ] 新增 `src/services/api/aiApi.ts` 前端 API 封装
- [ ] 新增 `src/hooks/useAiWeeklyReport.ts` 周报 Hook
- [ ] 新增 `src/components/AiWeeklyReport/index.tsx` 周报卡片组件
- [ ] 在 `src/pages/history/index.tsx` 中集成周报卡片
- [ ] 端到端验证：历史页加载周报 + 缓存命中

### Phase 2: AI 完成提示

- [ ] 实现 `completionTip.js` 完成提示 handler
- [ ] 新增 `src/hooks/useAiCompletionTip.ts` 完成提示 Hook
- [ ] 修改 `src/domains/brush/components/BrushCompletedState.tsx` 集成 AI 提示卡片
- [ ] 在 `src/domains/brush/hooks/useBrushSessionEffects.ts` 中触发 AI 调用
- [ ] 实现每日调用限额（每用户每天最多 1 次 AI 完成提示）
- [ ] 端到端验证：完成刷牙后显示 AI 提示 + 超时降级

### Phase 3: 家庭点评 + 月度报告（后续探索）

- [ ] 实现 `familyReview.js` 家庭 AI 点评 handler
- [ ] 在家庭看板页嵌入 AI 点评卡片
- [ ] 补充实现 `MonthlyStats` 统计接口
- [ ] 结合 AI 生成月度趋势分析报告

---

## 前置准备（运维侧）

- [ ] 腾讯云控制台申请混元 API Key
- [ ] 云函数超时调整为 30 秒
- [ ] 域名白名单添加 `api.hunyuan.cloud.tencent.com`
- [ ] 云开发控制台创建 `ai_cache` 集合
- [ ] 为 `ai` 云函数配置环境变量 `HUNYUAN_API_KEY`

---

## Token 预算估算

| 场景 | 单次消耗 | 月消耗（100 用户） |
|------|----------|-------------------|
| 周报 | ~800 token | ~320,000 token |
| 完成提示 | ~500 token | ~1,500,000 token |
| **合计** | - | **~1,820,000 token** |

1亿 Token 免费额度可支撑约 55 倍用户规模（~5500 用户），后续规模增长时可切换 `hunyuan-lite`（完全免费）进一步降低成本。
