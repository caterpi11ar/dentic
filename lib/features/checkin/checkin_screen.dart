import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';

/// Home / check-in screen — daily AM/PM logging + start brushing.
class CheckinScreen extends ConsumerWidget {
  const CheckinScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l = AppLocalizations.of(context)!;
    final checkin = ref.watch(todayCheckinProvider);
    final isMorning = DateTime.now().hour < 12;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Text(
              l.appName,
              style: theme.textTheme.headlineLarge?.copyWith(
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            )
                .animate()
                .fadeIn(duration: 500.ms)
                .slideY(begin: -0.2, end: 0),
            const SizedBox(height: 4),
            Text(
              l.appTagline,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: Colors.white60,
              ),
            )
                .animate()
                .fadeIn(duration: 500.ms, delay: 100.ms)
                .slideY(begin: -0.2, end: 0),
            const SizedBox(height: 36),

            // Today's status card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l.today,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _CheckinChip(
                        label: l.morning,
                        icon: CupertinoIcons.sun_max,
                        checked: checkin.morningDone,
                        highlighted: isMorning,
                        onTap: () => ref
                            .read(todayCheckinProvider.notifier)
                            .toggleMorning(),
                      ),
                      const SizedBox(width: 12),
                      _CheckinChip(
                        label: l.evening,
                        icon: CupertinoIcons.moon,
                        checked: checkin.eveningDone,
                        highlighted: !isMorning,
                        onTap: () => ref
                            .read(todayCheckinProvider.notifier)
                            .toggleEvening(),
                      ),
                    ],
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 200.ms)
                .slideY(begin: 0.1, end: 0),
            const SizedBox(height: 16),

            // Streak card
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(CupertinoIcons.flame,
                        size: 28, color: AppColors.warning),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l.streakCount(0),
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          l.streakEmpty,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.white54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 350.ms)
                .slideY(begin: 0.1, end: 0),

            const Spacer(),

            // Start brushing button
            Padding(
              padding: const EdgeInsets.only(bottom: 100),
              child: Center(
                child: GlassButton.custom(
                  onTap: () => context.push('/brushing'),
                  width: double.infinity,
                  height: 56,
                  shape: LiquidRoundedSuperellipse(borderRadius: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(CupertinoIcons.play_arrow_solid,
                          color: Colors.white, size: 22),
                      const SizedBox(width: 8),
                      Text(
                        l.startBrushing,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 500.ms)
                .slideY(begin: 0.2, end: 0),
          ],
        ),
      ),
    );
  }
}

class _CheckinChip extends StatelessWidget {
  const _CheckinChip({
    required this.label,
    required this.icon,
    required this.checked,
    required this.highlighted,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool checked;
  final bool highlighted;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: GlassContainer(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              Icon(
                checked ? CupertinoIcons.check_mark_circled_solid : icon,
                color: checked
                    ? AppColors.primary
                    : highlighted
                        ? Colors.white
                        : Colors.white70,
                size: 26,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  color: checked || highlighted ? Colors.white : Colors.white70,
                  fontSize: 13,
                  fontWeight:
                      checked || highlighted ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
