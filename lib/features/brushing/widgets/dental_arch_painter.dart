import 'dart:math';

import 'package:flutter/material.dart';

import '../../../core/constants/brushing_zones.dart';
import '../../../core/theme/app_colors.dart';

/// Draws a top-down view of upper + lower dental arches as white circles
/// arranged in a horseshoe shape. Active zone teeth show a pulsing teal glow;
/// completed zones are desaturated teal; inactive zones are light gray.
class DentalArchPainter extends CustomPainter {
  DentalArchPainter({
    required this.currentZone,
    required this.glowAnimation,
    required this.completedZoneCount,
  });

  final BrushingZone currentZone;

  /// 0.0-1.0 pulsing value for active zone glow.
  final double glowAnimation;

  /// Number of zones already completed (used to dim earlier teeth).
  final int completedZoneCount;

  static const int _teethPerArch = 14;

  // Teal-based colors for teeth states
  static const Color _activeColor = Color(0xFFE0FFFF); // teal-white
  static const Color _completedColor = Color(0xFF5F9E99); // desaturated teal
  static const Color _inactiveColor = Color(0xFFBCC8C6); // light gray-teal

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    final archWidth = size.width * 0.82;
    final archHeight = size.height * 0.22;
    final gap = size.height * 0.12;

    // Upper arch center.
    final upperCy = cy - gap / 2 - archHeight / 2;
    // Lower arch center.
    final lowerCy = cy + gap / 2 + archHeight / 2;

    _drawArch(canvas, cx, upperCy, archWidth, archHeight, isUpper: true);
    _drawArch(canvas, cx, lowerCy, archWidth, archHeight, isUpper: false);
  }

  void _drawArch(
    Canvas canvas,
    double cx,
    double cy,
    double archWidth,
    double archHeight, {
    required bool isUpper,
  }) {
    final teeth = _computeTeethPositions(cx, cy, archWidth, archHeight,
        isUpper: isUpper);
    final activeIndices = _activeTeethIndices(isUpper);

    // Draw from outside-in so front teeth overlap back teeth.
    final drawOrder = _backToFrontOrder();

    for (final i in drawOrder) {
      final pos = teeth[i];
      final radius = _toothRadius(i, archWidth);
      final isActive = activeIndices != null && activeIndices.contains(i);
      final isCompleted = _isToothInCompletedZone(i, isUpper);

      _drawTooth(canvas, pos, radius,
          isActive: isActive, isCompleted: isCompleted);
    }
  }

  /// Positions 14 teeth along a horseshoe-shaped arch.
  List<Offset> _computeTeethPositions(
    double cx,
    double cy,
    double archWidth,
    double archHeight, {
    required bool isUpper,
  }) {
    final positions = <Offset>[];
    for (var i = 0; i < _teethPerArch; i++) {
      // Parameter t from -1 to 1 across the arch.
      final t = -1.0 + 2.0 * i / (_teethPerArch - 1);

      // Linear X-spacing for even distribution.
      final x = cx + t * archWidth / 2;

      // Gentle parabola for smooth U-shape.
      final yOffset = archHeight * (1 - t * t);
      final y = isUpper ? cy - yOffset : cy + yOffset;

      positions.add(Offset(x, y));
    }
    return positions;
  }

  /// Tooth radius -- molars are larger, front teeth smaller.
  double _toothRadius(int index, double archWidth) {
    final baseRadius = archWidth / _teethPerArch * 1.05;

    // Molars: indices 0-3 (right) and 10-13 (left).
    if (index <= 3) {
      final d = 3 - index; // 0=closest to front, 3=furthest back
      return baseRadius * (1.05 + d * 0.05);
    }
    if (index >= 10) {
      final d = index - 10;
      return baseRadius * (1.05 + d * 0.05);
    }

    // Front teeth: indices 4-9.
    return baseRadius * 0.88;
  }

  /// Draw order: back teeth first per side, then front teeth.
  List<int> _backToFrontOrder() {
    return const [0, 1, 2, 3, 13, 12, 11, 10, 4, 5, 6, 7, 8, 9];
  }

  void _drawTooth(
    Canvas canvas,
    Offset center,
    double radius, {
    required bool isActive,
    required bool isCompleted,
  }) {
    // Soft shadow.
    final shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.25)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    canvas.drawCircle(center + const Offset(1.5, 1.5), radius, shadowPaint);

    // Fill color based on state.
    Color fillColor;
    double alpha;
    if (isActive) {
      fillColor = _activeColor;
      alpha = 0.85 + 0.15 * glowAnimation;
    } else if (isCompleted) {
      fillColor = _completedColor;
      alpha = 0.6;
    } else {
      fillColor = _inactiveColor;
      alpha = 0.5;
    }

    final fillPaint = Paint()
      ..color = fillColor.withValues(alpha: alpha)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, fillPaint);

    // Sparkle on active teeth.
    if (isActive) {
      _drawSparkle(canvas, center, radius);
    }
  }

  /// Draws a pulsing 4-pointed star sparkle on an active tooth.
  void _drawSparkle(Canvas canvas, Offset center, double toothRadius) {
    // Soft teal glow behind the star.
    final glowRadius = toothRadius * (0.6 + 0.3 * glowAnimation);
    final glowPaint = Paint()
      ..color = AppColors.primaryLight.withValues(
          alpha: 0.3 + 0.3 * glowAnimation)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawCircle(center, glowRadius, glowPaint);

    // 4-pointed star path.
    final outerR = toothRadius * (0.35 + 0.15 * glowAnimation);
    final innerR = outerR * 0.3;

    final path = Path();
    for (var i = 0; i < 8; i++) {
      final angle = i * pi / 4 - pi / 2; // Start from top.
      final r = i.isEven ? outerR : innerR;
      final x = center.dx + r * cos(angle);
      final y = center.dy + r * sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();

    final starPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.7 + 0.3 * glowAnimation)
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, starPaint);
  }

  /// Returns the set of tooth indices (0-13) that are active for the
  /// current zone in the given arch, or null if this arch is not active.
  Set<int>? _activeTeethIndices(bool isUpper) {
    final name = currentZone.name;
    final isUpperZone = name.startsWith('upper');
    final isLowerZone = name.startsWith('lower');

    if (isUpper && !isUpperZone) return null;
    if (!isUpper && !isLowerZone) return null;

    if (name.contains('Right')) {
      return {0, 1, 2, 3};
    } else if (name.contains('Front')) {
      return {4, 5, 6, 7, 8, 9};
    } else if (name.contains('Left')) {
      return {10, 11, 12, 13};
    } else if (name.contains('Occlusal')) {
      return Set.from(List.generate(_teethPerArch, (i) => i));
    }
    return null;
  }

  bool _isToothInCompletedZone(int toothIndex, bool isUpper) {
    for (var z = 0; z < completedZoneCount; z++) {
      final zone = BrushingZone.values[z];
      final name = zone.name;
      final isUpperZone = name.startsWith('upper');
      final isLowerZone = name.startsWith('lower');

      if (isUpper && !isUpperZone) continue;
      if (!isUpper && !isLowerZone) continue;

      Set<int> indices;
      if (name.contains('Right')) {
        indices = {0, 1, 2, 3};
      } else if (name.contains('Front')) {
        indices = {4, 5, 6, 7, 8, 9};
      } else if (name.contains('Left')) {
        indices = {10, 11, 12, 13};
      } else if (name.contains('Occlusal')) {
        indices = Set.from(List.generate(_teethPerArch, (i) => i));
      } else {
        continue;
      }

      if (indices.contains(toothIndex)) return true;
    }
    return false;
  }

  @override
  bool shouldRepaint(DentalArchPainter oldDelegate) {
    return oldDelegate.currentZone != currentZone ||
        oldDelegate.glowAnimation != glowAnimation ||
        oldDelegate.completedZoneCount != completedZoneCount;
  }
}
