import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../shared/models/checkin_record.dart';
import 'services/audio_service.dart';
import 'services/checkin_service.dart';
import 'services/settings_service.dart';

// ---------------------------------------------------------------------------
// Service providers — override with real instances in ProviderScope
// ---------------------------------------------------------------------------

final settingsServiceProvider = Provider<SettingsService>(
  (_) => throw UnimplementedError('Override settingsServiceProvider'),
);

final checkinServiceProvider = Provider<CheckinService>(
  (_) => throw UnimplementedError('Override checkinServiceProvider'),
);

final audioServiceProvider = Provider<AudioService>(
  (_) => throw UnimplementedError('Override audioServiceProvider'),
);

// ---------------------------------------------------------------------------
// Theme mode
// ---------------------------------------------------------------------------

final themeModeProvider =
    NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);

class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final service = ref.watch(settingsServiceProvider);
    return service.themeMode;
  }

  Future<void> set(ThemeMode mode) async {
    await ref.read(settingsServiceProvider).setThemeMode(mode);
    state = mode;
  }
}

// ---------------------------------------------------------------------------
// Locale (null = follow system)
// ---------------------------------------------------------------------------

final localeProvider =
    NotifierProvider<LocaleNotifier, Locale?>(LocaleNotifier.new);

class LocaleNotifier extends Notifier<Locale?> {
  @override
  Locale? build() {
    final service = ref.watch(settingsServiceProvider);
    return service.locale;
  }

  Future<void> set(Locale? locale) async {
    await ref.read(settingsServiceProvider).setLocale(locale);
    state = locale;
  }
}

// ---------------------------------------------------------------------------
// Today's check-in record
// ---------------------------------------------------------------------------

final todayCheckinProvider =
    NotifierProvider<TodayCheckinNotifier, CheckinRecord>(
        TodayCheckinNotifier.new);

class TodayCheckinNotifier extends Notifier<CheckinRecord> {
  @override
  CheckinRecord build() {
    final service = ref.watch(checkinServiceProvider);
    return service.getRecord(DateTime.now());
  }

  void toggleMorning() {
    final updated = state.copyWith(morningDone: !state.morningDone);
    ref.read(checkinServiceProvider).saveRecord(updated);
    state = updated;
  }

  void toggleEvening() {
    final updated = state.copyWith(eveningDone: !state.eveningDone);
    ref.read(checkinServiceProvider).saveRecord(updated);
    state = updated;
  }

  /// Mark the current period (AM/PM) as done.
  void markCurrentPeriod() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      if (!state.morningDone) {
        final updated = state.copyWith(morningDone: true);
        ref.read(checkinServiceProvider).saveRecord(updated);
        state = updated;
      }
    } else {
      if (!state.eveningDone) {
        final updated = state.copyWith(eveningDone: true);
        ref.read(checkinServiceProvider).saveRecord(updated);
        state = updated;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Sound enabled toggle
// ---------------------------------------------------------------------------

final soundEnabledProvider =
    NotifierProvider<SoundEnabledNotifier, bool>(SoundEnabledNotifier.new);

class SoundEnabledNotifier extends Notifier<bool> {
  @override
  bool build() {
    final service = ref.watch(settingsServiceProvider);
    return service.soundEnabled;
  }

  Future<void> toggle() async {
    final next = !state;
    await ref.read(settingsServiceProvider).setSoundEnabled(next);
    state = next;
  }
}

// ---------------------------------------------------------------------------
// Month records (for history calendar)
// ---------------------------------------------------------------------------

final monthRecordsProvider =
    Provider.family<List<CheckinRecord>, ({int year, int month})>((ref, key) {
  final service = ref.watch(checkinServiceProvider);
  // Also depend on today's check-in so that new records trigger rebuilds.
  ref.watch(todayCheckinProvider);
  return service.getRecordsForMonth(key.year, key.month);
});

// ---------------------------------------------------------------------------
// Streak counter
// ---------------------------------------------------------------------------

final streakProvider = Provider<int>((ref) {
  final service = ref.watch(checkinServiceProvider);
  // Re-evaluate when today's check-in changes.
  ref.watch(todayCheckinProvider);
  return service.getStreak();
});
