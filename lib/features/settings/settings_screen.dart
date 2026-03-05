import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';

/// User preferences screen.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final l = AppLocalizations.of(context)!;
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final soundEnabled = ref.watch(soundEnabledProvider);
    final toothbrushMode = ref.watch(toothbrushModeProvider);
    final sessionDuration = ref.watch(sessionDurationProvider);

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          const SizedBox(height: 24),
          Text(
            l.settingsTitle,
            style: theme.textTheme.headlineLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: colors.onSurface,
              letterSpacing: -0.5,
            ),
          )
              .animate()
              .fadeIn(duration: 500.ms)
              .slideY(begin: -0.2, end: 0),
          const SizedBox(height: 24),

          // Brushing
          _SettingsSection(
            title: l.brushing,
            children: [
              ListTile(
                leading: Icon(Icons.brush_outlined,
                    color: colors.onSurfaceVariant),
                title: Text(l.toothbrushMode,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text(
                  toothbrushMode == 'manual' ? l.manual : l.electric,
                  style: TextStyle(color: colors.onSurfaceVariant),
                ),
                trailing: Icon(Icons.chevron_right,
                    color: colors.onSurfaceVariant.withValues(alpha: 0.5),
                    size: 18),
                onTap: () => _showToothbrushModePicker(context, ref, l),
              ),
              ListTile(
                leading: Icon(Icons.timer_outlined,
                    color: colors.onSurfaceVariant),
                title: Text(l.sessionDuration,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text(
                  l.durationMinutes(sessionDuration ~/ 60),
                  style: TextStyle(color: colors.onSurfaceVariant),
                ),
                trailing: Icon(Icons.chevron_right,
                    color: colors.onSurfaceVariant.withValues(alpha: 0.5),
                    size: 18),
                onTap: () => _showDurationPicker(context, ref, l),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 100.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // Appearance
          _SettingsSection(
            title: l.appearance,
            children: [
              ListTile(
                leading: Icon(Icons.dark_mode_outlined,
                    color: colors.onSurfaceVariant),
                title: Text(l.theme,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text(
                  _themeModeLabel(l, themeMode),
                  style: TextStyle(color: colors.onSurfaceVariant),
                ),
                trailing: Icon(Icons.chevron_right,
                    color: colors.onSurfaceVariant.withValues(alpha: 0.5),
                    size: 18),
                onTap: () => _showThemePicker(context, ref, l),
              ),
              ListTile(
                leading: Icon(Icons.language,
                    color: colors.onSurfaceVariant),
                title: Text(l.language,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text(
                  _localeLabel(l, locale),
                  style: TextStyle(color: colors.onSurfaceVariant),
                ),
                trailing: Icon(Icons.chevron_right,
                    color: colors.onSurfaceVariant.withValues(alpha: 0.5),
                    size: 18),
                onTap: () => _showLocalePicker(context, ref, l),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 200.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // Sound
          _SettingsSection(
            title: l.sound,
            children: [
              SwitchListTile(
                secondary: Icon(Icons.volume_up_outlined,
                    color: colors.onSurfaceVariant),
                title: Text(l.sound,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text(
                    soundEnabled ? l.defaultLabel : 'Off',
                    style: TextStyle(color: colors.onSurfaceVariant)),
                value: soundEnabled,
                onChanged: (_) =>
                    ref.read(soundEnabledProvider.notifier).toggle(),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 300.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // About
          _SettingsSection(
            title: l.about,
            children: [
              ListTile(
                leading:
                    Icon(Icons.info_outline, color: colors.onSurfaceVariant),
                title: Text(l.version,
                    style: TextStyle(color: colors.onSurface)),
                subtitle: Text('0.1.0',
                    style: TextStyle(color: colors.onSurfaceVariant)),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 400.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // -- Helpers ---------------------------------------------------------------

  String _themeModeLabel(AppLocalizations l, ThemeMode mode) {
    return switch (mode) {
      ThemeMode.system => l.systemTheme,
      ThemeMode.light => l.lightTheme,
      ThemeMode.dark => l.darkTheme,
    };
  }

  String _localeLabel(AppLocalizations l, Locale? locale) {
    if (locale == null) return l.followSystem;
    return switch (locale.languageCode) {
      'zh' => l.chinese,
      _ => l.english,
    };
  }

  void _showThemePicker(
      BuildContext context, WidgetRef ref, AppLocalizations l) {
    final current = ref.read(themeModeProvider);
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickerTile(
              title: l.systemTheme,
              selected: current == ThemeMode.system,
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(themeModeProvider.notifier).set(ThemeMode.system);
              },
            ),
            _PickerTile(
              title: l.lightTheme,
              selected: current == ThemeMode.light,
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(themeModeProvider.notifier).set(ThemeMode.light);
              },
            ),
            _PickerTile(
              title: l.darkTheme,
              selected: current == ThemeMode.dark,
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(themeModeProvider.notifier).set(ThemeMode.dark);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showLocalePicker(
      BuildContext context, WidgetRef ref, AppLocalizations l) {
    final current = ref.read(localeProvider);
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickerTile(
              title: l.followSystem,
              selected: current == null,
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(localeProvider.notifier).set(null);
              },
            ),
            _PickerTile(
              title: l.english,
              selected: current?.languageCode == 'en',
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(localeProvider.notifier).set(const Locale('en'));
              },
            ),
            _PickerTile(
              title: l.chinese,
              selected: current?.languageCode == 'zh',
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(localeProvider.notifier).set(const Locale('zh'));
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showToothbrushModePicker(
      BuildContext context, WidgetRef ref, AppLocalizations l) {
    final current = ref.read(toothbrushModeProvider);
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickerTile(
              title: l.manual,
              selected: current == 'manual',
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(toothbrushModeProvider.notifier).set('manual');
              },
            ),
            _PickerTile(
              title: l.electric,
              selected: current == 'electric',
              onTap: () {
                Navigator.pop(sheetContext);
                ref.read(toothbrushModeProvider.notifier).set('electric');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showDurationPicker(
      BuildContext context, WidgetRef ref, AppLocalizations l) {
    final current = ref.read(sessionDurationProvider);
    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final secs in [120, 180, 240, 300])
              _PickerTile(
                title: l.durationMinutes(secs ~/ 60),
                selected: current == secs,
                onTap: () {
                  Navigator.pop(sheetContext);
                  ref.read(sessionDurationProvider.notifier).set(secs);
                },
              ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Private widgets
// ---------------------------------------------------------------------------

class _PickerTile extends StatelessWidget {
  const _PickerTile({
    required this.title,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title),
      trailing:
          selected ? const Icon(Icons.check, color: AppColors.primary) : null,
      onTap: onTap,
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({
    required this.title,
    required this.children,
  });

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              color: colors.onSurfaceVariant,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.2,
            ),
          ),
        ),
        Card(
          child: Column(children: children),
        ),
      ],
    );
  }
}
