import 'package:flutter/material.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/theme/app_colors.dart';

/// Scaffold with gradient background, floating ambient orbs, and glass layer.
class GlassScaffold extends StatelessWidget {
  const GlassScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.extendBody = false,
    this.extendBodyBehindAppBar = false,
  });

  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final bool extendBody;
  final bool extendBodyBehindAppBar;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gradient = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: isDark
          ? [AppColors.gradientStartDark, AppColors.gradientEndDark]
          : [AppColors.gradientStart, AppColors.gradientEnd],
    );

    return Container(
      decoration: BoxDecoration(gradient: gradient),
      child: Stack(
        children: [
          // Ambient floating orbs — give glass something to refract
          const _AmbientOrbs(),
          AdaptiveLiquidGlassLayer(
            settings: const LiquidGlassSettings(
              thickness: 30,
              blur: 10,
              refractiveIndex: 1.5,
            ),
            child: Scaffold(
              backgroundColor: Colors.transparent,
              appBar: appBar,
              body: body,
              bottomNavigationBar: bottomNavigationBar,
              extendBody: extendBody,
              extendBodyBehindAppBar: extendBodyBehindAppBar,
            ),
          ),
        ],
      ),
    );
  }
}

/// Decorative blurred color orbs floating in the background.
class _AmbientOrbs extends StatelessWidget {
  const _AmbientOrbs();

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return Stack(
      children: [
        _Orb(
          color: AppColors.primary.withValues(alpha: 0.25),
          size: 280,
          top: -40,
          right: -60,
        ),
        _Orb(
          color: const Color(0xFF6C63FF).withValues(alpha: 0.18),
          size: 220,
          top: size.height * 0.35,
          left: -80,
        ),
        _Orb(
          color: const Color(0xFF00BCD4).withValues(alpha: 0.15),
          size: 200,
          bottom: 120,
          right: -40,
        ),
        _Orb(
          color: const Color(0xFFE040FB).withValues(alpha: 0.1),
          size: 160,
          bottom: -30,
          left: 40,
        ),
      ],
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({
    required this.color,
    required this.size,
    this.top,
    this.left,
    this.right,
    this.bottom,
  });

  final Color color;
  final double size;
  final double? top;
  final double? left;
  final double? right;
  final double? bottom;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [color, color.withValues(alpha: 0)],
          ),
        ),
      ),
    );
  }
}
