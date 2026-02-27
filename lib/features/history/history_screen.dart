import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/models/checkin_record.dart';

/// Brushing history with calendar view and stats.
class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  late int _year;
  late int _month;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _year = now.year;
    _month = now.month;
  }

  void _prevMonth() {
    setState(() {
      _month--;
      if (_month < 1) {
        _month = 12;
        _year--;
      }
    });
  }

  void _nextMonth() {
    final now = DateTime.now();
    // Don't go past the current month.
    if (_year == now.year && _month >= now.month) return;
    setState(() {
      _month++;
      if (_month > 12) {
        _month = 1;
        _year++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l = AppLocalizations.of(context)!;
    final records =
        ref.watch(monthRecordsProvider((year: _year, month: _month)));

    // Build a lookup map: day-of-month → record.
    final recordMap = <int, CheckinRecord>{};
    for (final r in records) {
      recordMap[r.date.day] = r;
    }

    final daysInMonth = DateTime(_year, _month + 1, 0).day;
    final firstWeekday = DateTime(_year, _month, 1).weekday % 7; // 0=Sun
    final now = DateTime.now();
    final isCurrentMonth = _year == now.year && _month == now.month;

    // Count stats.
    var completeDays = 0;
    var partialDays = 0;
    for (final r in records) {
      if (r.isComplete) {
        completeDays++;
      } else if (r.isPartial) {
        partialDays++;
      }
    }

    final monthName = _monthName(_month);

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Text(
              l.historyTitle,
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
              l.historySubtitle,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: Colors.white60,
              ),
            )
                .animate()
                .fadeIn(duration: 500.ms, delay: 100.ms)
                .slideY(begin: -0.2, end: 0),
            const SizedBox(height: 24),

            // Month navigation
            GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: _prevMonth,
                    icon: const Icon(CupertinoIcons.chevron_left,
                        color: Colors.white70, size: 20),
                  ),
                  Text(
                    '$monthName $_year',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    onPressed:
                        isCurrentMonth ? null : _nextMonth,
                    icon: Icon(CupertinoIcons.chevron_right,
                        color: isCurrentMonth
                            ? Colors.white24
                            : Colors.white70,
                        size: 20),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 200.ms),
            const SizedBox(height: 16),

            // Calendar grid
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Weekday headers
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                          .map((d) => SizedBox(
                                width: 36,
                                child: Center(
                                  child: Text(
                                    d,
                                    style:
                                        theme.textTheme.bodySmall?.copyWith(
                                      color: Colors.white54,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                    const SizedBox(height: 8),

                    // Day cells
                    Expanded(
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 7,
                          mainAxisSpacing: 4,
                          crossAxisSpacing: 4,
                        ),
                        itemCount: firstWeekday + daysInMonth,
                        itemBuilder: (context, index) {
                          if (index < firstWeekday) {
                            return const SizedBox.shrink();
                          }
                          final day = index - firstWeekday + 1;
                          final isFuture = isCurrentMonth && day > now.day;
                          final record = recordMap[day];

                          return _DayCell(
                            day: day,
                            isComplete: record?.isComplete ?? false,
                            isPartial:
                                (record?.isPartial ?? false) &&
                                !(record?.isComplete ?? false),
                            isFuture: isFuture,
                            isToday: isCurrentMonth && day == now.day,
                          );
                        },
                      ),
                    ),

                    // Summary stats
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatChip(
                          icon: CupertinoIcons.check_mark_circled_solid,
                          color: AppColors.primary,
                          text: l.completeDays(completeDays),
                        ),
                        _StatChip(
                          icon: CupertinoIcons.circle_lefthalf_fill,
                          color: AppColors.warning,
                          text: l.partialDays(partialDays),
                        ),
                      ],
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(duration: 600.ms, delay: 300.ms)
                  .scale(
                      begin: const Offset(0.95, 0.95),
                      end: const Offset(1, 1)),
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  String _monthName(int month) {
    const names = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return names[month];
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.day,
    required this.isComplete,
    required this.isPartial,
    required this.isFuture,
    required this.isToday,
  });

  final int day;
  final bool isComplete;
  final bool isPartial;
  final bool isFuture;
  final bool isToday;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color? bgColor;
    Color textColor;
    BoxBorder? border;

    if (isFuture) {
      textColor = Colors.white24;
    } else if (isComplete) {
      bgColor = AppColors.primary.withValues(alpha: 0.8);
      textColor = Colors.white;
    } else if (isPartial) {
      bgColor = AppColors.warning.withValues(alpha: 0.3);
      textColor = Colors.white;
      border = Border.all(
        color: AppColors.warning.withValues(alpha: 0.6),
        width: 1.5,
      );
    } else {
      textColor = Colors.white60;
    }

    if (isToday) {
      border = Border.all(color: Colors.white54, width: 1.5);
    }

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: border,
      ),
      child: Center(
        child: Text(
          '$day',
          style: theme.textTheme.bodySmall?.copyWith(
            color: textColor,
            fontWeight: isComplete || isToday ? FontWeight.w700 : null,
          ),
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.icon,
    required this.color,
    required this.text,
  });

  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 6),
        Text(
          text,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white70,
              ),
        ),
      ],
    );
  }
}
