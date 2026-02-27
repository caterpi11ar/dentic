import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import '../../../core/constants/brushing_zones.dart';
import '../../../core/theme/app_colors.dart';

/// Draws a top-down occlusal view of upper + lower dental arches.
///
/// Active zone teeth glow/pulse with [AppColors.primary]; completed zones
/// appear dimmer. A soft gum ridge sits behind each arch.
class DentalArchPainter extends CustomPainter {
  DentalArchPainter({
    required this.currentZone,
    required this.glowAnimation,
    required this.completedZoneCount,
  });

  final BrushingZone currentZone;

  /// 0.0–1.0 pulsing value for active zone glow.
  final double glowAnimation;

  /// Number of zones already completed (used to dim earlier teeth).
  final int completedZoneCount;

  // 16 teeth per arch.
  static const int _teethPerArch = 16;

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Layout: upper arch in top half, lower arch in bottom half, with gap.
    final archWidth = size.width * 0.82;
    final archHeight = size.height * 0.34;
    const gap = 12.0;

    // Upper arch center
    final upperCy = cy - gap / 2 - archHeight / 2;
    // Lower arch center
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

    // Draw gum ridge first (behind teeth).
    _drawGumRidge(canvas, teeth, cx, cy, archWidth, archHeight,
        isUpper: isUpper);

    // Determine which teeth are active / completed for this arch.
    final activeIndices = _activeTeethIndices(isUpper);
    final surfaceType = _currentSurfaceType();

    for (var i = 0; i < teeth.length; i++) {
      final pos = teeth[i];
      final toothW = archWidth / _teethPerArch * 0.72;
      final toothH = _toothHeight(i, archHeight);

      // Angle each tooth to follow the arch curve.
      final angle = _toothAngle(i, isUpper);

      final isActive = activeIndices != null && activeIndices.contains(i);
      final isCompleted = _isToothInCompletedZone(i, isUpper);

      _drawTooth(
        canvas,
        pos,
        toothW,
        toothH,
        angle,
        isActive: isActive,
        isCompleted: isCompleted,
        surfaceType: isActive ? surfaceType : null,
        isUpper: isUpper,
      );
    }
  }

  /// Positions 16 teeth along a parabolic U-shape.
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
      final x = cx + t * archWidth / 2;
      // Parabolic curve: deeper in the middle.
      final yOffset = archHeight * 0.5 * (1 - t * t);
      final y = isUpper ? cy - yOffset : cy + yOffset;
      positions.add(Offset(x, y));
    }
    return positions;
  }

  double _toothHeight(int index, double archHeight) {
    // Front teeth are slightly smaller, molars larger.
    if (index >= 5 && index <= 10) return archHeight * 0.22;
    return archHeight * 0.28;
  }

  double _toothAngle(int index, bool isUpper) {
    // Slight rotation following the arch curve.
    final t = -1.0 + 2.0 * index / (_teethPerArch - 1);
    return t * 0.3 * (isUpper ? 1 : -1);
  }

  void _drawGumRidge(
    Canvas canvas,
    List<Offset> teeth,
    double cx,
    double cy,
    double archWidth,
    double archHeight, {
    required bool isUpper,
  }) {
    if (teeth.isEmpty) return;

    final path = Path();
    // Outer contour (expanded from teeth positions).
    final expand = archHeight * 0.18;

    final outerPoints = <Offset>[];
    for (var i = 0; i < teeth.length; i++) {
      final t = -1.0 + 2.0 * i / (_teethPerArch - 1);
      final x = cx + t * (archWidth / 2 + expand);
      final yOffset = (archHeight * 0.5 + expand) * (1 - t * t);
      final y = isUpper ? cy - yOffset : cy + yOffset;
      outerPoints.add(Offset(x, y));
    }

    path.moveTo(outerPoints.first.dx, outerPoints.first.dy);
    for (var i = 1; i < outerPoints.length; i++) {
      final prev = outerPoints[i - 1];
      final curr = outerPoints[i];
      final midX = (prev.dx + curr.dx) / 2;
      final midY = (prev.dy + curr.dy) / 2;
      path.quadraticBezierTo(prev.dx, prev.dy, midX, midY);
    }
    path.lineTo(outerPoints.last.dx, outerPoints.last.dy);

    // Close back via inner line.
    final innerY = isUpper ? cy + archHeight * 0.1 : cy - archHeight * 0.1;
    path.lineTo(outerPoints.last.dx, innerY);
    path.lineTo(outerPoints.first.dx, innerY);
    path.close();

    final gumPaint = Paint()
      ..shader = RadialGradient(
        center: Alignment.center,
        radius: 1.0,
        colors: [
          const Color(0xFFFF9E9E).withValues(alpha: 0.25),
          const Color(0xFFFFB3B3).withValues(alpha: 0.08),
        ],
      ).createShader(Rect.fromCenter(
        center: Offset(cx, cy),
        width: archWidth + expand * 2,
        height: archHeight + expand * 2,
      ));

    canvas.drawPath(path, gumPaint);
  }

  void _drawTooth(
    Canvas canvas,
    Offset center,
    double width,
    double height,
    double angle, {
    required bool isActive,
    required bool isCompleted,
    required bool isUpper,
    _SurfaceType? surfaceType,
  }) {
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(angle);

    final rect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset.zero, width: width, height: height),
      Radius.circular(width * 0.3),
    );

    // Shadow for depth.
    final shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.30)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
    canvas.drawRRect(rect.shift(const Offset(2, 2)), shadowPaint);

    // Gradient fill for 3D depth.
    Color baseColor;
    Color highlightColor;
    if (isActive) {
      final glow = 0.6 + 0.4 * glowAnimation;
      baseColor = Color.lerp(
        Colors.white,
        AppColors.primary,
        0.3 + 0.3 * glowAnimation,
      )!
          .withValues(alpha: glow);
      highlightColor = Color.lerp(
        const Color(0xFFF0F8FF),
        AppColors.primary.withValues(alpha: 0.6),
        0.2 + 0.2 * glowAnimation,
      )!;
    } else if (isCompleted) {
      baseColor = Colors.white.withValues(alpha: 0.3);
      highlightColor = Colors.white.withValues(alpha: 0.15);
    } else {
      baseColor = Colors.white.withValues(alpha: 0.75);
      highlightColor = const Color(0xFFF5F5F0).withValues(alpha: 0.55);
    }

    final gradientPaint = Paint()
      ..shader = ui.Gradient.linear(
        Offset(0, -height / 2),
        Offset(0, height / 2),
        [highlightColor, baseColor],
      );
    canvas.drawRRect(rect, gradientPaint);

    // Enamel highlight — subtle bright arc across the top of the tooth.
    if (!isCompleted) {
      final highlightPaint = Paint()
        ..color = Colors.white.withValues(alpha: isActive ? 0.5 : 0.35)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.8;
      final highlightPath = Path()
        ..moveTo(-width * 0.3, -height * 0.35)
        ..quadraticBezierTo(0, -height * 0.42, width * 0.3, -height * 0.35);
      canvas.drawPath(highlightPath, highlightPaint);
    }

    // Active glow ring — brighter and wider.
    if (isActive) {
      final glowPaint = Paint()
        ..color =
            AppColors.primary.withValues(alpha: 0.4 + 0.4 * glowAnimation)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0
        ..maskFilter =
            MaskFilter.blur(BlurStyle.normal, 4 + glowAnimation * 4);
      canvas.drawRRect(rect, glowPaint);
    }

    // Border.
    final borderPaint = Paint()
      ..color = isActive
          ? AppColors.primary.withValues(alpha: 0.8)
          : Colors.white.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;
    canvas.drawRRect(rect, borderPaint);

    // Surface indicator for active teeth.
    if (isActive && surfaceType != null) {
      _drawSurfaceIndicator(canvas, width, height, surfaceType, isUpper);
    }

    canvas.restore();
  }

  void _drawSurfaceIndicator(
    Canvas canvas,
    double toothWidth,
    double toothHeight,
    _SurfaceType type,
    bool isUpper,
  ) {
    final indicatorPaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    switch (type) {
      case _SurfaceType.outer:
        // Arc on the outer (labial) side.
        final outerY = isUpper ? -toothHeight / 2 : toothHeight / 2;
        final arcRect = Rect.fromCenter(
          center: Offset(0, outerY),
          width: toothWidth * 0.6,
          height: toothHeight * 0.3,
        );
        canvas.drawArc(
          arcRect,
          isUpper ? pi : 0,
          pi,
          false,
          indicatorPaint,
        );
      case _SurfaceType.inner:
        // Arc on the inner (lingual) side.
        final innerY = isUpper ? toothHeight / 2 : -toothHeight / 2;
        final arcRect = Rect.fromCenter(
          center: Offset(0, innerY),
          width: toothWidth * 0.6,
          height: toothHeight * 0.3,
        );
        canvas.drawArc(
          arcRect,
          isUpper ? 0 : pi,
          pi,
          false,
          indicatorPaint,
        );
      case _SurfaceType.occlusal:
        // Filled center dot.
        canvas.drawCircle(
          Offset.zero,
          toothWidth * 0.15,
          Paint()..color = AppColors.primary,
        );
    }
  }

  /// Returns the set of tooth indices (0-15) that are active for the
  /// current zone in the given arch, or null if this arch is not active.
  Set<int>? _activeTeethIndices(bool isUpper) {
    final zone = currentZone;
    final name = zone.name;
    final isUpperZone = name.startsWith('upper');
    final isLowerZone = name.startsWith('lower');

    if (isUpper && !isUpperZone) return null;
    if (!isUpper && !isLowerZone) return null;

    if (name.contains('Right')) {
      return {0, 1, 2, 3, 4};
    } else if (name.contains('Front')) {
      return {5, 6, 7, 8, 9, 10};
    } else if (name.contains('Left')) {
      return {11, 12, 13, 14, 15};
    } else if (name.contains('Occlusal')) {
      // All teeth in this arch.
      return Set.from(List.generate(_teethPerArch, (i) => i));
    }
    return null;
  }

  _SurfaceType _currentSurfaceType() {
    final name = currentZone.name;
    if (name.contains('Outer')) return _SurfaceType.outer;
    if (name.contains('Inner')) return _SurfaceType.inner;
    return _SurfaceType.occlusal;
  }

  bool _isToothInCompletedZone(int toothIndex, bool isUpper) {
    // Check if any zone before the current one includes this tooth.
    for (var z = 0; z < completedZoneCount; z++) {
      final zone = BrushingZone.values[z];
      final name = zone.name;
      final isUpperZone = name.startsWith('upper');
      final isLowerZone = name.startsWith('lower');

      if (isUpper && !isUpperZone) continue;
      if (!isUpper && !isLowerZone) continue;

      Set<int> indices;
      if (name.contains('Right')) {
        indices = {0, 1, 2, 3, 4};
      } else if (name.contains('Front')) {
        indices = {5, 6, 7, 8, 9, 10};
      } else if (name.contains('Left')) {
        indices = {11, 12, 13, 14, 15};
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

enum _SurfaceType { outer, inner, occlusal }
