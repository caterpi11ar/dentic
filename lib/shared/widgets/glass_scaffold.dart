import 'package:flutter/material.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/theme/app_colors.dart';

/// Scaffold wrapped in gradient background + AdaptiveLiquidGlassLayer.
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
      child: AdaptiveLiquidGlassLayer(
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
    );
  }
}
