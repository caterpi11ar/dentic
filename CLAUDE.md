# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
flutter pub get       # Install dependencies
flutter run           # Run on connected device/simulator
flutter build apk     # Build Android APK
flutter build ios     # Build iOS
flutter test          # Run tests
flutter analyze       # Static analysis
```

**First-time setup**: Run `flutter create .` in the repo root to generate platform-specific directories (ios/, android/, etc.).

## Stack

- **Flutter 3.41+** + **Dart 3.7+**
- **Material 3** (Material Design 3 with custom dental teal theme)
- **Riverpod** for state management
- **go_router** for declarative navigation
- **Hive** for local data persistence
- **just_audio** for audio playback

## Architecture

This is a mobile-first app targeting iOS and Android. It uses a feature-based architecture.

### Directory Structure

```
lib/
├── main.dart               # Entry point
├── app.dart                # MaterialApp.router setup
├── core/
│   ├── router.dart         # go_router configuration
│   ├── theme/              # AppTheme, AppColors (dental teal)
│   ├── constants/          # BrushingZones, AppConstants
│   └── services/           # Audio, haptic, storage services
├── features/
│   ├── brushing/           # 3D navigation + segmented timer
│   ├── checkin/            # Home screen, AM/PM check-in
│   ├── history/            # Calendar view + stats
│   └── settings/           # User preferences
└── shared/
    ├── widgets/            # AppShell (bottom nav), reusable widgets
    └── models/             # BrushingSession, CheckinRecord
```

### Route Structure

- `/home` — Home / check-in screen (inside shell with bottom nav)
- `/history` — Brushing history & calendar (inside shell)
- `/settings` — User preferences (inside shell)
- `/brushing` — Full-screen brushing session (outside shell, no bottom nav)

### Core Features (planned)

1. **3D oral navigation** — Interactive tooth model with real-time zone highlighting
2. **Segmented timer** — Auto-advances through 14 brushing zones with audio/haptic cues
3. **Check-in & stats** — Daily AM/PM logging, monthly calendar, quality scoring
4. **Preferences** — Manual vs. electric toothbrush mode, custom session duration

The brushing methodology (Bass Method, 7 steps) is documented in `docs/brushing-method.md`.

## Dart Style

- Use `const` constructors wherever possible
- Prefer single quotes for strings
- Use `import type` equivalent: avoid importing unused symbols
- Follow the analysis_options.yaml rules (strict casts, strict raw types)
