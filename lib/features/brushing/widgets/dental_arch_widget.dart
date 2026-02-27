import 'package:flutter/material.dart';

import '../../../core/constants/brushing_zones.dart';
import 'dental_arch_painter.dart';

/// Displays the dental arch visualization with zone highlighting.
class DentalArchWidget extends StatelessWidget {
  const DentalArchWidget({
    super.key,
    required this.currentZone,
    required this.glowAnimation,
    required this.completedZoneCount,
  });

  final BrushingZone currentZone;
  final double glowAnimation;
  final int completedZoneCount;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(240, 240),
      painter: DentalArchPainter(
        currentZone: currentZone,
        glowAnimation: glowAnimation,
        completedZoneCount: completedZoneCount,
      ),
    );
  }
}
