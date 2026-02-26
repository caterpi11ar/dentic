import 'dart:ui';

import 'package:flutter/material.dart';

/// Reusable Liquid Glass container with backdrop blur + semi-transparent fill.
class GlassContainer extends StatelessWidget {
  const GlassContainer({
    super.key,
    required this.child,
    this.blurSigma = 15,
    this.backgroundOpacity = 0.15,
    this.borderOpacity = 0.2,
    this.borderRadius = 20,
    this.padding,
  });

  final Widget child;
  final double blurSigma;
  final double backgroundOpacity;
  final double borderOpacity;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgOpacity = isDark ? backgroundOpacity * 0.53 : backgroundOpacity;
    final bdOpacity = isDark ? borderOpacity * 0.6 : borderOpacity;
    final sigma = isDark ? blurSigma + 3 : blurSigma;

    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: sigma, sigmaY: sigma),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: bgOpacity),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: Colors.white.withValues(alpha: bdOpacity),
            ),
          ),
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
