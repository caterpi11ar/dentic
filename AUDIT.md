# Web Interface Guidelines Audit Report

Audit date: 2026-03-17
Scope: All UI files in dentic WeChat Mini Program (Taro + React + TypeScript)

---

## Global Issues

### `src/styles/_variables.scss`

| Line | Rule | Finding |
|------|------|---------|
| 1–16 | Dark Mode | No `prefers-color-scheme` media query or dark theme variables defined. All colors are light-only. |
| 19–22 | Dark Mode | `:root` custom properties don't adapt to dark mode (`color-scheme` property missing). |

### `src/app.scss`

| Line | Rule | Finding |
|------|------|---------|
| 3 | Dark Mode | `page` selector missing `color-scheme: light dark` property. |
| 4–6 | Typography | Font stack is good, but consider adding `system-ui` at the start for modern OS font resolution. |

---

## Pages

### `src/pages/brush/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 159 | Accessibility | Countdown overlay has no `aria-live="assertive"` to announce countdown to screen readers. |
| 167–178 | Accessibility | Status bar text (streak, morning/evening status) has no `role="status"` or `aria-live` for dynamic updates. |
| 172 | Typography | Checkmark `✓` used inline — OK, but consider `aria-label` on the parent `<Text>` (e.g., "早上已完成") for screen readers. |
| 174 | Typography | Same for evening checkmark. |
| 184 | Accessibility | Completion check `✓` icon has no `aria-label`; screen reader will read the raw character. |
| 189–191 | Typography | Timer display `{Math.floor(…)}:{String(…).padStart(…)}` — numeric values should use `tabular-nums` in CSS for stable width. |
| 206 | Accessibility | Share button has no `aria-label`; "分享" text is present but `openType="share"` behavior is invisible to assistive tech. |
| 209 | Accessibility | Reset button has no `aria-label`. |
| 230 | Accessibility | Start button: `disabled` prop on Taro `<Button>` — verify it produces `aria-disabled` in output. |
| 244 | Accessibility | Pause/resume button changes label dynamically — good, but no `aria-live` region to announce state change. |

### `src/pages/brush/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 51–67 | Focus | `.startBtn` has no `:focus` or `:focus-visible` style. |
| 90 | Animation | `.brushingControls` animation `slideUp 0.3s` — no `prefers-reduced-motion` guard. |
| 99–114 | Focus | `.pauseBtn` has no focus style. |
| 116–131 | Focus | `.skipBtn` has no focus style. |
| 145–153 | Animation | `.completedIconCircle` uses `bounce 1s infinite` — **must** be disabled under `prefers-reduced-motion: reduce`. Infinite animations are a vestibular trigger. |
| 164 | Animation | `.completedOverlay` uses `fadeScaleIn 0.5s` — no `prefers-reduced-motion` guard. |
| 234–248 | Focus | `.shareBtn` has no focus style. |
| 251–266 | Focus | `.resetBtn` has no focus style. |
| 269–302 | Animation | `.countdownNumber` uses `countdownPulse 0.8s` — no `prefers-reduced-motion` guard. Scale animation is a vestibular concern. |

### `src/pages/history/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 30 | Accessibility | Share button has no `aria-label`. |
| 38–61 | Content | Record list has good empty state ("该日无刷牙记录") — OK. |
| 53 | Typography | Duration display "X分Y秒" — numeric values should use `tabular-nums`. |
| 58 | Typography | Step count "X/15" — should use `tabular-nums` for alignment. |

### `src/pages/history/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 29–43 | Focus | `.shareBtn` has no focus style. |
| 92 | Anti-pattern | Hardcoded color `#ccc` instead of using `$text-secondary` or a variable. |

### `src/pages/settings/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 57–63 | Accessibility | Duration option buttons have no `role="radio"` or `aria-checked`. They function as a radio group but lack semantics. |
| 55 | Accessibility | Duration options group has no `role="radiogroup"` or `aria-label="每步时长"`. |
| 74–82 | Accessibility | Custom switch toggle is a `<View>` with `onClick` — missing `role="switch"`, `aria-checked`, and `aria-label="刷牙提醒"`. This is a **critical** accessibility gap. |
| 91–98 | Accessibility | Same issue for sound toggle switch — missing `role="switch"`, `aria-checked`, `aria-label="步骤提示音"`. |
| 74 | Accessibility | Switch built from `<View>` — keyboard users cannot activate it (no `onKeyDown` handler). |
| 91 | Accessibility | Same keyboard issue for sound switch. |

### `src/pages/settings/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 58–69 | Focus | `.durationBtn` has no focus style. |
| 76–83 | Focus | `.switchTrack` has no focus style; not keyboard-focusable. |
| 82 | Animation | `transition: background 0.3s` — specific property is good (not `transition: all`). OK. |
| 97 | Animation | `transition: left 0.3s` on `.switchThumb` — no `prefers-reduced-motion` guard. |
| 131 | Anti-pattern | Hardcoded color `#fffde7` instead of a variable. |

---

## Components

### `src/components/ToothScene/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 78–83 | Accessibility | `<Canvas>` element has no `aria-label` or fallback text for screen readers. Add `aria-label="牙齿3D模型"` or similar. |
| 84 | Content | Loading state "加载中..." uses three periods — should use proper ellipsis `…` (U+2026). |
| 69–73 | Content | Fallback state is well-handled — good. |
| 82 | Performance | Inline `style={{ width: '100%', height: '100%' }}` on Canvas — this is already in CSS; duplicated. |

### `src/components/ToothScene/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 6 | Anti-pattern | Hardcoded color `#e3f2fd` — should be a theme variable. |
| 31 | Anti-pattern | Hardcoded color `#e3f2fd` repeated — same issue. |

### `src/components/BrushTimer/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 25 | Typography | `formatRemaining` outputs timer digits — needs `tabular-nums` in CSS for stable width during countdown. |
| 37 | Accessibility | Seconds display has no `aria-live` or `aria-label="剩余秒数"`. Screen readers won't announce timer changes. |
| 39 | Accessibility | "剩余 X:XX" has no `aria-live="polite"` to announce remaining time changes. |
| 29 | Accessibility | Timer region should have `role="timer"` for assistive tech. |

### `src/components/BrushTimer/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 18 | Animation | `.ring` uses `transition: background 0.3s linear` — specific property, OK. |
| 32–36 | Typography | `.seconds` — missing `font-variant-numeric: tabular-nums` for stable number width. |
| 38–42 | Typography | `.remaining` — missing `font-variant-numeric: tabular-nums`. |

### `src/components/StepIndicator/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 14 | Accessibility | Dots container has no `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Step progress is visual-only. |
| 24 | Accessibility | Step count "X / Y" has no `aria-label` (e.g., `aria-label="步骤 3 共 15 步"`). |

### `src/components/StepIndicator/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 23 | Anti-pattern | **`transition: all 0.3s ease`** — should specify exact properties: `transition: background-color 0.3s ease, transform 0.3s ease`. `transition: all` is flagged because it animates every property including layout-triggering ones. |

### `src/components/Calendar/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 19 | Performance | `const today = new Date()` is called on every render. Should be memoized or moved to state. |
| 79 | Accessibility | Nav button `‹` has no `aria-label="上个月"`. Screen reader will read the bare character. |
| 85 | Accessibility | Nav button `›` has no `aria-label="下个月"`. |
| 100–130 | Accessibility | Day cells are `<View onClick>` — not keyboard-focusable, no `role="button"` or `role="gridcell"`. |
| 91–97 | Accessibility | Calendar grid has no `role="grid"` and weekday headers have no `role="columnheader"`. |
| 119 | Accessibility | Clickable day has no `aria-label` (e.g., `aria-label="3月17日, 已刷牙"`). |
| 121–125 | Accessibility | Morning/evening dots are visual-only indicators with no text alternative. |
| 135 | Typography | Stat values (monthBrushed, streak, totalDays) — need `tabular-nums` for stable width. |

### `src/components/Calendar/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 70 | Anti-pattern | Hardcoded color `#e8f5e9` — should be a variable like `$success-light`. |
| 71 | Anti-pattern | Hardcoded color `#2e7d32` — should be a variable. |
| 80 | Anti-pattern | Hardcoded color `#e3f2fd` — should be a variable like `$primary-light`. |
| 16–26 | Focus | `.navBtn` has no focus style. |
| 54–63 | Focus | `.day` (clickable) has no focus style. |
| 54 | Touch | `.day` cells could benefit from `touch-action: manipulation` to prevent double-tap zoom. |

### `src/components/WeeklyStats/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 16 | Content | Returns `null` when `!stats` — this is a flash of empty content. Consider a skeleton/placeholder instead. |
| 25–35 | Accessibility | Bar chart is entirely visual — no `aria-label` or text alternative for the chart data. |
| 33 | Accessibility | Bar labels (weekday) have no association with the bar value — screen readers get no chart context. |
| 40 | Typography | `stats.totalSessions` numeric display — needs `tabular-nums`. |
| 46 | Typography | Average duration display — needs `tabular-nums`. |

### `src/components/WeeklyStats/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 46 | Animation | `.bar` uses `transition: height 0.3s ease` — specific property is good, but no `prefers-reduced-motion` guard. |

### `src/components/ErrorBoundary/index.tsx`

| Line | Rule | Finding |
|------|------|---------|
| 31 | Accessibility | Fallback error message has no `role="alert"` to announce the error to assistive tech. |
| 31 | Content | Error fallback "加载失败，请重试" — good empty state message. Consider adding a retry button. |

### `src/components/ErrorBoundary/index.module.scss`

| Line | Rule | Finding |
|------|------|---------|
| 8 | Anti-pattern | Hardcoded color `#e3f2fd` — should use a variable. |

---

## Summary by Category

| Category | Issues | Severity |
|----------|--------|----------|
| **Accessibility** | 25 | High — custom switches lack role/aria, no aria-live on timer, calendar grid not semantic |
| **Focus States** | 10 | High — no focus styles on any interactive element |
| **Animation** | 7 | Medium — no `prefers-reduced-motion` anywhere, infinite `bounce` animation |
| **Typography** | 7 | Low — missing `tabular-nums` on all numeric displays |
| **Dark Mode** | 3 | Medium — no dark mode support at all |
| **Anti-patterns** | 8 | Low — hardcoded colors, `transition: all` |
| **Content** | 2 | Low — `...` vs `…`, null return instead of skeleton |
| **Performance** | 1 | Low — `new Date()` on every render |
| **Touch** | 1 | Low — no `touch-action: manipulation` on tap targets |

### Top 5 Priorities

1. **Settings custom switches** (`settings/index.tsx:74,91`): Add `role="switch"`, `aria-checked`, `aria-label`, keyboard handler
2. **Reduced motion** (all animation files): Add `@media (prefers-reduced-motion: reduce)` to disable/simplify all animations, especially the infinite `bounce`
3. **Focus styles** (all SCSS files): Add visible `:focus` outlines to all buttons and interactive elements
4. **Timer accessibility** (`BrushTimer/index.tsx:29`): Add `role="timer"` and `aria-live="polite"` for countdown announcements
5. **Calendar semantics** (`Calendar/index.tsx:100`): Add `role="grid"`, `role="gridcell"`, `aria-label` on day cells, and `aria-label` on nav buttons
