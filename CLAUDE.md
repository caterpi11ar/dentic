# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + Vite build (tsc -b && vite build)
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm preview      # Preview production build
```

No test framework is configured yet.

## Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 8** (beta) with `@vitejs/plugin-react`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Three.js** planned for 3D tooth model visualization
- `vite-tsconfig-paths` enables path aliases from `tsconfig.app.json`

## Architecture

This is an early-stage mobile-first web app (to be packaged as a native app later). The codebase is currently a Vite scaffold; product features are yet to be built.

Planned core features (see README.md):
1. **3D oral navigation** — Three.js interactive tooth model with real-time region highlighting
2. **Segmented timer** — auto-advances through brushing zones with audio/haptic cues
3. **Check-in & stats** — daily AM/PM logging, monthly calendar view, quality scoring
4. **Preferences** — manual vs. electric toothbrush mode, custom session duration

The brushing methodology (Bass Method, 7 steps) is documented in `docs/brushing-method.md`.

## ESLint

Uses `@antfu/eslint-config`. Notable rule overrides: `no-console` is off, `antfu/no-top-level-await` is off. Markdown files are ignored by ESLint.

## TypeScript

Strict mode with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly` enabled. Use `import type` for type-only imports.
