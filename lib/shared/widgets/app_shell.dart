import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/theme/app_colors.dart';
import 'glass_scaffold.dart';

/// Shell widget with iOS 26 Liquid Glass bottom navigation bar.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child});

  final Widget child;

  static const _tabs = [
    '/home',
    '/history',
    '/settings',
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final index = _tabs.indexWhere((tab) => location.startsWith(tab));
    return index < 0 ? 0 : index;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _currentIndex(context);

    return GlassScaffold(
      extendBody: true,
      body: child,
      bottomNavigationBar: GlassBottomBar(
        tabs: [
          GlassBottomBarTab(
            label: 'Home',
            icon: CupertinoIcons.home,
            selectedIcon: CupertinoIcons.house_fill,
            glowColor: AppColors.primary,
          ),
          GlassBottomBarTab(
            label: 'History',
            icon: CupertinoIcons.calendar,
            selectedIcon: CupertinoIcons.calendar_today,
            glowColor: AppColors.primary,
          ),
          GlassBottomBarTab(
            label: 'Settings',
            icon: CupertinoIcons.gear,
            selectedIcon: CupertinoIcons.gear_solid,
            glowColor: AppColors.primary,
          ),
        ],
        selectedIndex: currentIndex,
        onTabSelected: (index) => context.go(_tabs[index]),
        barHeight: 64,
        showIndicator: true,
      ),
    );
  }
}
