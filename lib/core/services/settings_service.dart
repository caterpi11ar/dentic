import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

/// Persists user settings (theme mode, locale) via Hive.
class SettingsService {
  SettingsService(this._box);

  final Box<dynamic> _box;

  static const _keyThemeMode = 'themeMode';
  static const _keyLocale = 'locale';
  static const _keySoundEnabled = 'soundEnabled';

  // -- Theme --

  ThemeMode get themeMode {
    final value = _box.get(_keyThemeMode, defaultValue: 'system') as String;
    return switch (value) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> setThemeMode(ThemeMode mode) {
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    return _box.put(_keyThemeMode, value);
  }

  // -- Locale --

  /// Returns `null` when following system locale.
  Locale? get locale {
    final code = _box.get(_keyLocale) as String?;
    if (code == null) return null;
    return Locale(code);
  }

  Future<void> setLocale(Locale? locale) {
    if (locale == null) {
      return _box.delete(_keyLocale);
    }
    return _box.put(_keyLocale, locale.languageCode);
  }

  // -- Sound --

  bool get soundEnabled {
    return _box.get(_keySoundEnabled, defaultValue: true) as bool;
  }

  Future<void> setSoundEnabled(bool enabled) {
    return _box.put(_keySoundEnabled, enabled);
  }
}
