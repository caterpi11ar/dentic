import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../shared/models/checkin_record.dart';
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
