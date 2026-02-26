import 'package:flutter/material.dart';
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
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),

          // Toothbrush mode
          _SettingsSection(
            title: 'Brushing',
            children: [
              ListTile(
                leading: const Icon(Icons.brush_outlined, color: Colors.white),
                title: const Text('Toothbrush Mode',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Manual',
                    style: TextStyle(color: Colors.white70)),
                trailing:
                    const Icon(Icons.chevron_right, color: Colors.white70),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.timer_outlined, color: Colors.white),
                title: const Text('Session Duration',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('3 minutes',
                    style: TextStyle(color: Colors.white70)),
                trailing:
                    const Icon(Icons.chevron_right, color: Colors.white70),
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Notifications
          _SettingsSection(
            title: 'Notifications',
            children: [
              SwitchListTile(
                secondary:
                    const Icon(Icons.notifications_outlined, color: Colors.white),
                title: const Text('Reminders',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Morning & evening',
                    style: TextStyle(color: Colors.white70)),
                value: false,
                onChanged: (value) {},
              ),
              ListTile(
                leading:
                    const Icon(Icons.volume_up_outlined, color: Colors.white),
                title: const Text('Sound',
                    style: TextStyle(color: Colors.white)),
                subtitle: const Text('Default',
                    style: TextStyle(color: Colors.white70)),
                trailing:
                    const Icon(Icons.chevron_right, color: Colors.white70),
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // About
          const _SettingsSection(
            title: 'About',
            children: [
              ListTile(
                leading: Icon(Icons.info_outline, color: Colors.white),
                title:
                    Text('Version', style: TextStyle(color: Colors.white)),
                subtitle:
                    Text('0.1.0', style: TextStyle(color: Colors.white70)),
              ),
            ],
          ),
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
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w600,
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
