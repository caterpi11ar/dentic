# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Next.js production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

No test framework is configured yet.

## Stack

- **Next.js 16** + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **ESLint** with `eslint-config-next`
- **Three.js** planned for 3D tooth model visualization
- Path alias: `@/*` maps to the project root

## Architecture

This is an early-stage mobile-first web app (to be packaged as a native app later), using the Next.js App Router.

Route structure:
- `app/page.tsx` — root redirect
- `app/(main)/layout.tsx` — shared layout with bottom navigation
- `app/(main)/home/page.tsx` — home / dashboard
- `app/(main)/history/page.tsx` — brushing history
- `app/(main)/settings/page.tsx` — user preferences

Planned core features (see README.md):
1. **3D oral navigation** — Three.js interactive tooth model with real-time region highlighting
2. **Segmented timer** — auto-advances through brushing zones with audio/haptic cues
3. **Check-in & stats** — daily AM/PM logging, monthly calendar view, quality scoring
4. **Preferences** — manual vs. electric toothbrush mode, custom session duration

The brushing methodology (Bass Method, 7 steps) is documented in `docs/brushing-method.md`.

## TypeScript

Strict mode enabled. Path alias `@/*` resolves to the project root (configured in `tsconfig.json`). Use `import type` for type-only imports.
