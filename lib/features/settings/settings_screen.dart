import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

/// User preferences screen.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        children: [
          const SizedBox(height: 24),
          Text(
            'Settings',
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

          // Toothbrush mode
          _SettingsSection(
            title: 'Brushing',
            children: [
              ListTile(
                leading: const Icon(CupertinoIcons.paintbrush,
                    color: Colors.white),
                title: const Text('Toothbrush Mode',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Manual',
                    style: TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(CupertinoIcons.timer,
                    color: Colors.white),
                title: const Text('Session Duration',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('3 minutes',
                    style: TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 100.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // Notifications
          _SettingsSection(
            title: 'Notifications',
            children: [
              SwitchListTile(
                secondary: const Icon(CupertinoIcons.bell,
                    color: Colors.white),
                title: const Text('Reminders',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Morning & evening',
                    style: TextStyle(color: Colors.white54)),
                value: false,
                onChanged: (value) {},
              ),
              ListTile(
                leading: const Icon(CupertinoIcons.speaker_2,
                    color: Colors.white),
                title: const Text('Sound',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Default',
                    style: TextStyle(color: Colors.white54)),
                trailing: const Icon(CupertinoIcons.chevron_right,
                    color: Colors.white38, size: 18),
                onTap: () {},
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 250.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 16),

          // About
          _SettingsSection(
            title: 'About',
            children: const [
              ListTile(
                leading: Icon(CupertinoIcons.info, color: Colors.white),
                title:
                    Text('Version', style: TextStyle(color: Colors.white)),
                subtitle:
                    Text('0.1.0', style: TextStyle(color: Colors.white54)),
              ),
            ],
          )
              .animate()
              .fadeIn(duration: 600.ms, delay: 400.ms)
              .slideY(begin: 0.1, end: 0),
          const SizedBox(height: 100),
        ],
      ),
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
