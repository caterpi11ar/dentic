import 'package:flutter/material.dart';

/// Dentic brand colors — blue dental color system.
class AppColors {
  AppColors._();

  /// Primary dental blue
  static const Color primary = Color(0xFF007AFF);

  /// Lighter blue for surfaces
  static const Color primaryLight = Color(0xFFE3F2FD);

  /// Dark blue for emphasis
  static const Color primaryDark = Color(0xFF0055B3);

  /// Background colors
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color backgroundDark = Color(0xFF121212);

  /// Semantic colors
  static const Color success = Color(0xFF34C759);
  static const Color warning = Color(0xFFFF9500);
  static const Color error = Color(0xFFFF3B30);

  /// Check-in status
  static const Color checkedIn = primary;
  static const Color missed = Color(0xFFBDBDBD);

  /// Liquid Glass — light mode
  static final Color glassSurface = Colors.white.withValues(alpha: 0.15);
  static final Color glassBorder = Colors.white.withValues(alpha: 0.2);

  /// Liquid Glass — dark mode
  static final Color glassSurfaceDark = Colors.white.withValues(alpha: 0.08);
  static final Color glassBorderDark = Colors.white.withValues(alpha: 0.12);

  /// Gradient background — light
  static const Color gradientStart = Color(0xFF1A1A2E);
  static const Color gradientEnd = Color(0xFF16213E);

  /// Gradient background — dark
  static const Color gradientStartDark = Color(0xFF0D0D1A);
  static const Color gradientEndDark = Color(0xFF0F1629);
}
