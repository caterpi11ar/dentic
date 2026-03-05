import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import '../../shared/models/brushing_session.dart';
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
    final colors = theme.colorScheme;
    final l = AppLocalizations.of(context)!;
    final records =
        ref.watch(monthRecordsProvider((year: _year, month: _month)));
    final sessions =
        ref.watch(monthSessionsProvider((year: _year, month: _month)));

    // Build a lookup map: day-of-month -> record.
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

    // Monthly average quality
    double? avgQuality;
    if (sessions.isNotEmpty) {
      final total =
          sessions.fold<double>(0, (sum, s) => sum + s.qualityScore);
      avgQuality = total / sessions.length;
    }

    final monthName = _monthName(_month);

    return SafeArea(
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
                color: colors.onSurface,
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
                color: colors.onSurfaceVariant,
              ),
            )
                .animate()
                .fadeIn(duration: 500.ms, delay: 100.ms)
                .slideY(begin: -0.2, end: 0),
            const SizedBox(height: 24),

            // Month navigation
            Card(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      onPressed: _prevMonth,
                      icon: Icon(Icons.chevron_left,
                          color: colors.onSurfaceVariant, size: 20),
                    ),
                    Text(
                      '$monthName $_year',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colors.onSurface,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    IconButton(
                      onPressed: isCurrentMonth ? null : _nextMonth,
                      icon: Icon(Icons.chevron_right,
                          color: isCurrentMonth
                              ? colors.onSurface.withValues(alpha: 0.25)
                              : colors.onSurfaceVariant,
                          size: 20),
                    ),
                  ],
                ),
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 200.ms),
            const SizedBox(height: 16),

            // Calendar grid
            Expanded(
              child: Card(
                child: Padding(
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
                                        color: colors.onSurfaceVariant,
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

                            // Gather sessions for this day
                            final daySessions = sessions
                                .where((s) => s.startedAt.day == day)
                                .toList();

                            return _DayCell(
                              day: day,
                              isComplete: record?.isComplete ?? false,
                              isPartial: (record?.isPartial ?? false) &&
                                  !(record?.isComplete ?? false),
                              isFuture: isFuture,
                              isToday: isCurrentMonth && day == now.day,
                              sessions: daySessions,
                            );
                          },
                        ),
                      ),

                      // Summary stats
                      Divider(color: colors.outlineVariant),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _StatChip(
                            icon: Icons.check_circle,
                            color: AppColors.primary,
                            text: l.completeDays(completeDays),
                          ),
                          _StatChip(
                            icon: Icons.timelapse,
                            color: AppColors.warning,
                            text: l.partialDays(partialDays),
                          ),
                          if (avgQuality != null)
                            _StatChip(
                              icon: Icons.star,
                              color: AppColors.primary,
                              text: l.avgQuality(
                                  (avgQuality * 100).round()),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              )
                  .animate()
                  .fadeIn(duration: 600.ms, delay: 300.ms)
                  .scale(
                      begin: const Offset(0.95, 0.95),
                      end: const Offset(1, 1)),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  String _monthName(int month) {
    const names = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
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
    this.sessions = const [],
  });

  final int day;
  final bool isComplete;
  final bool isPartial;
  final bool isFuture;
  final bool isToday;
  final List<BrushingSession> sessions;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;

    Color? bgColor;
    Color textColor;
    BoxBorder? border;

    if (isFuture) {
      textColor = colors.onSurface.withValues(alpha: 0.25);
    } else if (isComplete) {
      bgColor = AppColors.primary;
      textColor = Colors.white;
    } else if (isPartial) {
      bgColor = AppColors.warning.withValues(alpha: 0.15);
      textColor = colors.onSurface;
      border = Border.all(
        color: AppColors.warning.withValues(alpha: 0.6),
        width: 1.5,
      );
    } else {
      textColor = colors.onSurfaceVariant;
    }

    if (isToday) {
      border = Border.all(color: AppColors.primary, width: 2);
    }

    return GestureDetector(
      onTap: sessions.isNotEmpty ? () => _showDayDetail(context) : null,
      child: Container(
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
      ),
    );
  }

  void _showDayDetail(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final l = AppLocalizations.of(context)!;

    showModalBottomSheet(
      context: context,
      useRootNavigator: true,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l.sessionDetails,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.onSurface,
                ),
              ),
              const SizedBox(height: 16),
              ...sessions.map((s) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Icon(Icons.timer_outlined,
                            size: 18, color: colors.onSurfaceVariant),
                        const SizedBox(width: 8),
                        Text(
                          l.sessionDurationValue(s.durationSec),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colors.onSurface,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(Icons.grid_view,
                            size: 18, color: colors.onSurfaceVariant),
                        const SizedBox(width: 8),
                        Text(
                          l.zonesCompletedValue(
                              s.zonesCompleted, s.totalZones),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: colors.onSurface,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${(s.qualityScore * 100).round()}%',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  )),
            ],
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
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 6),
        Text(
          text,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
