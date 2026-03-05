import 'package:flutter/material.dart';

/// Dentic brand colors — dental teal color system.
class AppColors {
  AppColors._();

  /// Primary dental teal (Tailwind teal-500)
  static const Color primary = Color(0xFF0D9488);

  /// Dark mode primary variant (teal-300)
  static const Color primaryLight = Color(0xFF2DD4BF);

  /// Dark teal for emphasis
  static const Color primaryDark = Color(0xFF0F766E);

  /// Light background — faint green-tint white
  static const Color backgroundLight = Color(0xFFFAFCFB);

  /// Dark background — dark teal-black
  static const Color backgroundDark = Color(0xFF0F1512);

  /// Surface colors
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1A2420);

  /// Semantic colors
  static const Color success = Color(0xFF34C759);
  static const Color warning = Color(0xFFFF9500);
  static const Color error = Color(0xFFFF3B30);

  /// Check-in status
  static const Color checkedIn = primary;
  static const Color missed = Color(0xFFBDBDBD);

  /// Brushing screen immersive gradient (dark teal tones)
  static const Color brushingGradientStart = Color(0xFF0A3A36);
  static const Color brushingGradientEnd = Color(0xFF0F1F1D);
}
