import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/providers.dart';
import '../../l10n/app_localizations.dart';

/// User preferences screen.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l = AppLocalizations.of(context)!;
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          const SizedBox(height: 24),
          Text(
            l.settingsTitle,
            style: theme.textTheme.headlineLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          )
              .animate()
              .fadeIn(duration: 500.ms)
              .slideY(begin: -0.2, end: 0),
          const SizedBox(height: 24),

          // Appearance
          _SettingsSection(
            title: l.appearance,
            children: [
              ListTile(
                leading:
                    const Icon(CupertinoIcons.moon_stars, color: Colors.white),
                title: Text(l.theme, style: const TextStyle(color: Colors.white)),
                subtitle: Text(
                  _themeModeLabel(l, themeMode),
                  style: const TextStyle(color: Colors.white54),
                ),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () => _showThemePicker(context, ref, l),
              ),
              ListTile(
                leading: const Icon(CupertinoIcons.globe, color: Colors.white),
                title:
                    Text(l.language, style: const TextStyle(color: Colors.white)),
                subtitle: Text(
                  _localeLabel(l, locale),
                  style: const TextStyle(color: Colors.white54),
                ),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () => _showLocalePicker(context, ref, l),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 100.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // Toothbrush mode
          _SettingsSection(
            title: l.brushing,
            children: [
              ListTile(
                leading: const Icon(CupertinoIcons.paintbrush,
                    color: Colors.white),
                title: Text(l.toothbrushMode,
                    style: const TextStyle(color: Colors.white)),
                subtitle: Text(l.manual,
                    style: const TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(CupertinoIcons.timer,
                    color: Colors.white),
                title: Text(l.sessionDuration,
                    style: const TextStyle(color: Colors.white)),
                subtitle: Text(l.threeMinutes,
                    style: const TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 200.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // Notifications
          _SettingsSection(
            title: l.notifications,
            children: [
              SwitchListTile(
                secondary: const Icon(CupertinoIcons.bell,
                    color: Colors.white),
                title: Text(l.reminders,
                    style: const TextStyle(color: Colors.white)),
                subtitle: Text(l.morningAndEvening,
                    style: const TextStyle(color: Colors.white54)),
                value: false,
                onChanged: (value) {},
              ),
              ListTile(
                leading: const Icon(CupertinoIcons.speaker_2,
                    color: Colors.white),
                title: Text(l.sound,
                    style: const TextStyle(color: Colors.white)),
                subtitle: Text(l.defaultLabel,
                    style: const TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 350.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // About
          _SettingsSection(
            title: l.about,
            children: [
              ListTile(
                leading:
                    const Icon(CupertinoIcons.info, color: Colors.white),
                title: Text(l.version,
                    style: const TextStyle(color: Colors.white)),
                subtitle: const Text('0.1.0',
                    style: TextStyle(color: Colors.white54)),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 500.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 100),
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
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickerTile(
              title: l.systemTheme,
              selected: current == ThemeMode.system,
              onTap: () {
                ref.read(themeModeProvider.notifier).set(ThemeMode.system);
                Navigator.pop(context);
              },
            ),
            _PickerTile(
              title: l.lightTheme,
              selected: current == ThemeMode.light,
              onTap: () {
                ref.read(themeModeProvider.notifier).set(ThemeMode.light);
                Navigator.pop(context);
              },
            ),
            _PickerTile(
              title: l.darkTheme,
              selected: current == ThemeMode.dark,
              onTap: () {
                ref.read(themeModeProvider.notifier).set(ThemeMode.dark);
                Navigator.pop(context);
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
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PickerTile(
              title: l.followSystem,
              selected: current == null,
              onTap: () {
                ref.read(localeProvider.notifier).set(null);
                Navigator.pop(context);
              },
            ),
            _PickerTile(
              title: l.english,
              selected: current?.languageCode == 'en',
              onTap: () {
                ref.read(localeProvider.notifier).set(const Locale('en'));
                Navigator.pop(context);
              },
            ),
            _PickerTile(
              title: l.chinese,
              selected: current?.languageCode == 'zh',
              onTap: () {
                ref.read(localeProvider.notifier).set(const Locale('zh'));
                Navigator.pop(context);
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
      trailing: selected ? const Icon(Icons.check, color: Colors.teal) : null,
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.2,
            ),
          ),
        ),
        GlassCard(
          child: Column(children: children),
        ),
      ],
    );
  }
}
