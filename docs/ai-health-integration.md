# AI 健康能力接入方案

> 状态：RFC（征求意见）  
> 创建日期：2026-04-09  
> 作者：@qin.dai

## 背景

Dentic 小程序基于巴氏刷牙法定义了 15 个口腔区域的精细引导流程，但当前数据采集粒度不足以支撑深度健康分析——只记录"刷了几步、花了多久"，不记录"哪些区域覆盖了、哪些长期被忽略"。

本方案的目标不是「数据转文案」，而是构建**口腔健康画像**，让 AI 真正理解用户的刷牙行为模式，识别潜在风险并主动干预。

**核心定位**：健康画像 + 风险预警，AI 主动发现问题并推动改善。

**接入方式**：腾讯云混元 API（OpenAI 兼容接口），通过云函数代理调用。

---

## 现状数据差距分析

在规划 AI 功能前，必须认清当前数据采集的局限：

| 维度 | 现状 | 差距 |
|------|------|------|
| 区域覆盖 | `completedSteps` 硬编码为 15（只有完成才保存） | **无法知道哪些区域被跳过或忽略** |
| 中途退出 | 不保存任何记录 | **丢失大量行为信号**（放弃率、放弃时机） |
| 每步时长 | 运行时存在，保存时丢弃 | **无法识别敷衍区域** |
| 暂停行为 | 运行时有状态，不持久化 | **丢失投入度信号** |
| 埋点管道 | `brush_step_complete` 有 stepIndex，但 flush 后直接丢弃 | **数据采集了但实际丢失** |

> **结论**：要做健康画像，首先要补数据基建。Phase 0 是数据增强，不是 AI 功能。

---

## 功能规划

### Phase 0（前置）: 数据增强——为 AI 铺路

增强 `BrushingRecord` 和 `CloudBrushRecord`，采集区域级细粒度数据。

**新增数据字段**：

```ts
// 每步完成详情
interface StepDetail {
  zone: string        // 区域标识，如 'upper-outer-left'
  actualDuration: number  // 实际停留秒数（含暂停后恢复的时间）
  skipped: boolean    // 是否被跳过（中途退出时，未到达的步骤）
}

// 扩展 BrushingRecord
interface BrushingRecord {
  // ... 现有字段
  completed: boolean        // 保留，但不再是保存前提
  completedSteps: number    // 改为实际完成的步骤数（不再硬编码 15）
  stepDetails?: StepDetail[] // 新增：每步详情
  pauseCount?: number       // 新增：暂停次数
  totalPauseDuration?: number // 新增：总暂停时长（秒）
  abandoned?: boolean       // 新增：是否中途退出
  abandonedAtStep?: number  // 新增：在第几步退出
}
```

**关键改动**：
- 中途退出也保存记录（`completed: false, abandoned: true`）
- `completedSteps` 反映实际完成数，不再硬编码
- 每步的 zone 和 actualDuration 持久化到 `stepDetails`
- 暂停次数和时长持久化
- 云端 `brush_record` 集合同步扩展相应字段

### P0: 口腔健康画像

基于增强后的数据，构建用户的口腔健康画像。

**画像维度**：

| 画像维度 | 数据来源 | AI 分析能力 |
|---------|---------|------------|
| **区域覆盖热力图** | `stepDetails[].zone` + `actualDuration` 长期聚合 | 识别长期忽略的区域（如内侧面、咬合面） |
| **刷牙节律** | `timestamp`/`createdAt` 时间分布 | 识别不规律作息（如凌晨刷牙、长期跳过早刷） |
| **完成度趋势** | `completed` + `completedSteps` + `abandoned` | 发现完成率下降趋势、频繁放弃模式 |
| **投入度评估** | `duration` + `pauseCount` + `totalPauseDuration` | 区分认真刷与敷衍刷 |
| **习惯稳定性** | 连续天数变化 + 早晚平衡度 | 识别习惯退化信号 |

### P1: 风险预警

AI 基于健康画像主动识别风险并推送预警。

**预警规则示例**：

| 风险类型 | 触发条件 | 预警内容 |
|---------|---------|---------|
| 区域盲区 | 某区域近 2 周平均时长 < 5 秒或 skipped 率 > 50% | "你的上牙内侧左区域近两周覆盖不足，这个区域容易藏食物残渣，建议多留意" |
| 习惯退化 | 连续天数从 >7 骤降到 0，或本周完成率比上周下降 >30% | "最近刷牙频率有所下降，口腔健康需要持续呵护哦" |
| 敷衍预警 | 连续 3 次 `duration` < 120 秒（标准 150 秒） | "最近几次刷牙时间偏短，建议每次至少 2.5 分钟以确保清洁到位" |
| 早晚失衡 | 近 2 周早刷/晚刷完成率差异 > 40% | "晚间刷牙容易被忽略，但睡前清洁对防蛀非常关键" |
| 频繁放弃 | 近 1 周 `abandoned: true` 次数 >= 3 | "最近几次没有刷完整，是否遇到了什么困难？坚持完成 15 步效果更好" |

**预警呈现**：
- 首页（刷牙主页）顶部卡片，黄色/橙色警示样式
- 可关闭，关闭后同类预警 3 天内不再出现
- 每次最多显示 1 条优先级最高的预警

### P2: AI 健康报告

在健康画像和风险预警的基础上，生成有深度的 AI 报告。

- **周报**：不再是简单的鼓励文案，而是基于画像数据的真正健康分析（区域覆盖评分、风险点、改善优先级）
- **月度报告**：趋势分析 + 里程碑回顾 + 下月改善计划
- **家庭报告**：对比家庭成员的画像差异，为家长提供孩子口腔健康建议

### P3: 智能教练（后续探索）

- 基于画像中的薄弱区域，动态调整刷牙引导（如薄弱区域延长到 15 秒）
- 个性化步骤顺序（先弱后强，确保薄弱区域不被跳过）

---

## 技术架构

### 新增云函数 `ai`

```
cloud/functions/ai/
  index.js                ← action 路由入口（复制 brush/index.js 模式）
  healthProfile.js        ← P0: 健康画像生成
  riskCheck.js            ← P1: 风险预警检测
  weeklyReport.js         ← P2: AI 周报
  lib/
    hunyuan.js            ← 混元 API 封装（Node.js https 模块，OpenAI 兼容格式）
    prompts.js            ← 系统提示词模板
    cache.js              ← ai_cache 集合读写
    profileBuilder.js     ← 健康画像数据聚合
    riskRules.js          ← 风险规则引擎（规则判断不依赖 AI，降低 Token 消耗）
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

### AI 与规则引擎的分工

**关键设计**：风险检测分两层，控制 Token 消耗。

| 层级 | 实现方式 | 说明 |
|------|---------|------|
| 规则层 | `riskRules.js`，纯 JS 逻辑 | 数值阈值判断（如完成率 < 50%、某区域时长 < 5 秒），不消耗 Token |
| AI 层 | 混元 API | 仅在规则层触发风险后，由 AI 生成自然语言描述和个性化建议 |

这样大部分日常检测不调用 AI，只有真正触发风险时才消耗 Token。

### 前端 API 层

新增 `src/services/api/aiApi.ts`，遵循现有 `brushApi.ts` 封装模式：

```ts
getHealthProfile() → Promise<HealthProfileData>
checkRisks() → Promise<RiskWarning[]>
getWeeklyReport() → Promise<WeeklyReportData>
```

### 缓存策略（两级）

**云端缓存**：新增 `ai_cache` 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| openId | string | 用户标识 |
| cacheKey | string | 缓存键，如 `profile_2026-W15`、`risk_2026-04-09` |
| content | object | AI 返回的结构化内容 |
| createdAt | number | 生成时间戳 |
| expiresAt | number | 过期时间戳 |

- 健康画像：key = `profile_{yearWeek}`，TTL 7 天
- 风险预警：key = `risk_{bizDate}`，TTL 24 小时
- 周报：key = `weekly_{weekMonday}`，TTL 7 天
- handler 先查缓存，命中则跳过 AI 调用
- 过期清理：微信云数据库无自动 TTL 删除，需在云函数中查询时顺带清理过期记录（`expiresAt < now`），或定期通过定时触发器批量清理

**前端缓存**：Taro Storage 二级缓存，避免重复云函数调用。

---

## 数据管道

### 健康画像聚合（云端 `profileBuilder.js`）

云函数直接查询 `brush_record` 集合，聚合近 2-4 周数据：

1. 按 zone 聚合 `stepDetails`，计算每个区域的平均时长、覆盖率
2. 统计早/晚场次完成率、总完成率
3. 分析放弃模式：`abandoned` 记录的频率、放弃时机分布
4. 计算投入度指标：平均 pauseCount、平均 duration vs 标准时长
5. 连续天数趋势：近 4 周每周的 streak 变化

> **注意**：项目以凌晨 4:00 作为业务日切换边界（`BUSINESS_DAY_START_HOUR = 4`），早晚场次以 12:00 分界。云端数据聚合时需使用 `bizDate` 字段而非自然日期。

**空数据兜底**：数据不足 1 周时不生成画像，显示"继续刷牙积累数据，解锁你的口腔健康画像"。

### 风险检测数据（云端 `riskRules.js`）

基于画像数据执行规则判断，不依赖 AI：
- 输入：画像聚合结果（区域覆盖率、完成率趋势、放弃率等）
- 输出：触发的风险列表 `[{ type, severity, data }]`
- 仅当有风险触发时，调用混元 API 生成自然语言描述

### 数据脱敏原则

- 传递给混元 API 的 prompt 中**不包含任何用户标识**（openId、昵称、头像）
- 仅传递聚合统计数据和区域标识
- 家庭场景中使用「成员A/成员B」匿名化

---

## Prompt 设计

### 风险预警提示词

```
你是"今天刷牙了吗"小程序的口腔健康顾问。
基于以下检测到的刷牙风险数据，生成一条简短的健康提醒（50字以内）。
要求：1）指出具体问题 2）解释为什么重要 3）给出可执行的建议。
语气温和关切，不制造焦虑。
```

### 周报提示词（画像驱动版）

```
你是"今天刷牙了吗"小程序的口腔健康顾问。
基于以下口腔健康画像数据，生成本周健康分析（100字以内）。
要求：1）区域覆盖评分和薄弱点 2）与上周对比的变化 3）下周改善重点。
用具体区域名称（如"上牙内侧"），避免笼统建议。
```

### 画像数据上下文示例

```json
{
  "区域覆盖": {
    "上牙外侧": { "平均时长": 9.8, "覆盖率": "100%" },
    "上牙内侧": { "平均时长": 6.2, "覆盖率": "85%" },
    "下牙内侧": { "平均时长": 4.5, "覆盖率": "71%" },
    "咬合面": { "平均时长": 10.0, "覆盖率": "100%" },
    "舌面": { "平均时长": 8.0, "覆盖率": "92%" }
  },
  "本周完成率": "71%",
  "早晚比": "5:3",
  "平均用时": "2分15秒",
  "放弃次数": 2,
  "连续天数": 8,
  "上周连续天数": 12,
  "触发风险": ["下牙内侧覆盖不足", "习惯退化趋势"]
}
```

---

## 前端 UI

### 口腔健康画像页（新增）

- **入口**：个人中心页新增"我的口腔画像"入口，或历史页顶部 Tab
- **核心可视化**：区域覆盖热力图（15 个区域的覆盖评分，绿/黄/红色标）
- **数据卡片**：完成率趋势、投入度评分、连续天数曲线
- **组件**：`src/components/HealthProfile/index.tsx`
- **Hook**：`src/hooks/useHealthProfile.ts`

### 风险预警卡片（嵌入首页）

- **位置**：首页（刷牙主页）`BrushIdleState` 顶部
- **样式**：黄色/橙色警示卡片，带关闭按钮
- **规则**：每次最多 1 条，关闭后同类 3 天不再显示
- **组件**：`src/components/RiskWarning/index.tsx`
- **Hook**：`src/hooks/useRiskWarning.ts`

### AI 周报卡片（嵌入历史页）

- **位置**：历史页日历与「当天记录」卡片之间
- **内容**：基于画像的深度分析，非简单鼓励
- **组件**：`src/components/AiWeeklyReport/index.tsx`
- **Hook**：`src/hooks/useAiWeeklyReport.ts`

**加载与错误处理**（适用于所有 AI 组件）：
- 加载态：`animate-pulse` 骨架屏
- 失败时静默不显示，不干扰主体验

---

## 文件变更清单

### Phase 0: 数据增强

| 操作 | 文件路径 |
|------|----------|
| 修改 | `src/types/index.ts` — 新增 StepDetail、扩展 BrushingRecord |
| 修改 | `src/services/brushing.ts` — 状态机记录每步时长、暂停次数 |
| 修改 | `src/domains/brush/hooks/useBrushSessionState.ts` — 追踪 stepDetails |
| 修改 | `src/domains/brush/hooks/useBrushSessionEffects.ts` — 中途退出时触发保存 |
| 修改 | `src/domains/brush/repositories/brushRepository.ts` — 支持保存不完整记录 |
| 修改 | `cloud/functions/brush/upsertRecord.js` — 云端支持新字段 |

### Phase 1: 健康画像 + 风险预警

| 操作 | 文件路径 |
|------|----------|
| 新建 | `cloud/functions/ai/index.js` — 云函数入口 |
| 新建 | `cloud/functions/ai/package.json` |
| 新建 | `cloud/functions/ai/healthProfile.js` — 画像生成 handler |
| 新建 | `cloud/functions/ai/riskCheck.js` — 风险检测 handler |
| 新建 | `cloud/functions/ai/lib/hunyuan.js` — 混元 API 封装 |
| 新建 | `cloud/functions/ai/lib/prompts.js` — 提示词模板 |
| 新建 | `cloud/functions/ai/lib/cache.js` — 缓存读写 |
| 新建 | `cloud/functions/ai/lib/profileBuilder.js` — 画像数据聚合 |
| 新建 | `cloud/functions/ai/lib/riskRules.js` — 风险规则引擎 |
| 新建 | `src/services/api/aiApi.ts` — 前端 API 封装 |
| 新建 | `src/hooks/useHealthProfile.ts` |
| 新建 | `src/hooks/useRiskWarning.ts` |
| 新建 | `src/components/HealthProfile/index.tsx` — 画像可视化 |
| 新建 | `src/components/RiskWarning/index.tsx` — 预警卡片 |
| 修改 | `src/pages/index/index.tsx` — 集成风险预警 |

### Phase 2: AI 健康报告

| 操作 | 文件路径 |
|------|----------|
| 新建 | `cloud/functions/ai/weeklyReport.js` — 周报 handler |
| 新建 | `src/hooks/useAiWeeklyReport.ts` |
| 新建 | `src/components/AiWeeklyReport/index.tsx` |
| 修改 | `src/pages/history/index.tsx` — 集成周报 |

---

## 实施分期

### Phase 0: 数据增强（前置，为 AI 铺路）

- [ ] 在 `src/types/index.ts` 新增 `StepDetail` 接口，扩展 `BrushingRecord` 字段
- [ ] 修改 `src/services/brushing.ts` 状态机，记录每步实际时长和暂停次数
- [ ] 修改 `useBrushSessionState.ts`，追踪 `stepDetails` 数组
- [ ] 修改 `brushRepository.ts`，支持保存不完整记录（`completed: false`）
- [ ] 修改 `useBrushSessionEffects.ts`，页面卸载/退出时触发不完整记录保存
- [ ] 修改 `cloud/functions/brush/upsertRecord.js`，云端支持新字段
- [ ] 验证：中途退出刷牙后，本地和云端都能查到 `abandoned: true` 的记录

### Phase 1: 健康画像 + 风险预警

- [ ] 创建 `cloud/functions/ai/` 目录结构
- [ ] 实现 `lib/hunyuan.js` 混元 API 调用封装
- [ ] 实现 `lib/profileBuilder.js` 画像数据聚合（区域覆盖、完成趋势、投入度）
- [ ] 实现 `lib/riskRules.js` 风险规则引擎（纯 JS，不消耗 Token）
- [ ] 实现 `lib/prompts.js` + `lib/cache.js`
- [ ] 实现 `healthProfile.js` 和 `riskCheck.js` handler
- [ ] 部署云函数，控制台配置 `HUNYUAN_API_KEY` + 域名白名单
- [ ] 新增 `src/services/api/aiApi.ts`
- [ ] 新增 `src/components/RiskWarning/index.tsx` + `src/hooks/useRiskWarning.ts`
- [ ] 在首页 `BrushIdleState` 集成风险预警卡片
- [ ] 新增 `src/components/HealthProfile/index.tsx` + `src/hooks/useHealthProfile.ts`
- [ ] 新增画像入口页面或嵌入现有页面
- [ ] 端到端验证：积累 1 周数据后，首页展示风险预警 + 画像页可视化

### Phase 2: AI 健康报告

- [ ] 实现 `weeklyReport.js`（基于画像数据生成深度分析）
- [ ] 新增 `src/hooks/useAiWeeklyReport.ts` + `src/components/AiWeeklyReport/index.tsx`
- [ ] 在历史页集成周报卡片
- [ ] 补充实现 `MonthlyStats` 统计接口 + 月度报告
- [ ] 端到端验证：历史页周报包含区域评分和风险点

### Phase 3: 智能教练 + 家庭健康（后续探索）

- [ ] 基于画像薄弱区域，动态调整步骤时长（弱区延长到 15 秒）
- [ ] 个性化步骤顺序推荐
- [ ] 家庭成员画像对比 + 家长端孩子健康报告
- [ ] AI 语音播报个性化建议

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
| 风险预警（仅触发时调 AI） | ~400 token | ~200,000 token（假设 50% 用户触发） |
| 周报（画像驱动） | ~1000 token | ~400,000 token |
| 月度报告 | ~1200 token | ~120,000 token |
| **合计** | - | **~720,000 token** |

规则引擎承担大部分检测逻辑，AI 仅在需要生成自然语言时介入。1 亿 Token 免费额度可支撑约 138 倍规模（~13800 用户）。
