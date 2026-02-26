import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import '../../core/constants/brushing_zones.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';

/// Full-screen brushing session with timer and zone guidance.
/// Launched outside the shell (no bottom nav).
class BrushingScreen extends StatefulWidget {
  const BrushingScreen({super.key});

  @override
  State<BrushingScreen> createState() => _BrushingScreenState();
}

class _BrushingScreenState extends State<BrushingScreen>
    with TickerProviderStateMixin {
  late final AnimationController _timerController;
  late final AnimationController _celebrationScaleController;
  late final Animation<double> _celebrationScale;
  late final ConfettiController _confettiController;

  int _currentZoneIndex = 0;
  bool _isRunning = false;
  bool _isComplete = false;

  int get _secondsPerZone => AppConstants.secondsPerZone;
  BrushingZone get _currentZone => BrushingZone.values[_currentZoneIndex];
  int get _totalZones => BrushingZone.values.length;

  @override
  void initState() {
    super.initState();
    _timerController = AnimationController(
      vsync: this,
      duration: Duration(seconds: _secondsPerZone),
    );
    _timerController.addStatusListener(_onTimerStatus);

    _celebrationScaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _celebrationScale = CurvedAnimation(
      parent: _celebrationScaleController,
      curve: Curves.elasticOut,
    );

    _confettiController = ConfettiController(
      duration: const Duration(seconds: 3),
    );
  }

  void _onTimerStatus(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      _advanceZone();
    }
  }

  void _advanceZone() {
    HapticFeedback.mediumImpact();
    if (_currentZoneIndex < _totalZones - 1) {
      setState(() {
        _currentZoneIndex++;
      });
      _timerController.reset();
      _timerController.forward();
    } else {
      setState(() {
        _isRunning = false;
        _isComplete = true;
      });
      HapticFeedback.heavyImpact();
      _confettiController.play();
      _celebrationScaleController.forward(from: 0);
    }
  }

  void _startOrResume() {
    setState(() => _isRunning = true);
    _timerController.forward();
  }

  void _pause() {
    setState(() => _isRunning = false);
    _timerController.stop();
  }

  void _reset() {
    setState(() {
      _currentZoneIndex = 0;
      _isRunning = false;
      _isComplete = false;
    });
    _timerController.reset();
    _celebrationScaleController.reset();
  }

  @override
  void dispose() {
    _timerController.dispose();
    _celebrationScaleController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [AppColors.gradientStartDark, AppColors.gradientEndDark]
              : [AppColors.gradientStart, AppColors.gradientEnd],
        ),
      ),
      child: AdaptiveLiquidGlassLayer(
        settings: const LiquidGlassSettings(
          thickness: 40,
          blur: 15,
          refractiveIndex: 1.5,
        ),
        child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.white,
            title: Text(
              'Zone ${_currentZoneIndex + 1} / $_totalZones',
              style: const TextStyle(color: Colors.white),
            ),
          ),
          body: Stack(
            children: [
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      const Spacer(),

                      // 3D model placeholder — glass circle
                      GlassContainer(
                        width: 200,
                        height: 200,
                        shape: LiquidRoundedSuperellipse(borderRadius: 100),
                        quality: GlassQuality.premium,
                        child: const Center(
                          child: Icon(
                            Icons.view_in_ar,
                            size: 80,
                            color: Colors.white70,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Zone label
                      Text(
                        _currentZone.labelZh,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _currentZone.labelEn,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Timer ring — wrapped in glass card
                      GlassCard(
                        padding: const EdgeInsets.all(24),
                        quality: GlassQuality.premium,
                        child: AnimatedBuilder(
                          animation: _timerController,
                          builder: (context, child) {
                            final remaining = (_secondsPerZone *
                                    (1 - _timerController.value))
                                .ceil();
                            return SizedBox(
                              width: 120,
                              height: 120,
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  CircularProgressIndicator(
                                    value: 1 - _timerController.value,
                                    strokeWidth: 8,
                                    backgroundColor:
                                        Colors.white.withValues(alpha: 0.2),
                                    valueColor:
                                        const AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                  Center(
                                    child: Text(
                                      '${remaining}s',
                                      style: theme.textTheme.headlineLarge
                                          ?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),

                      const Spacer(),

                      // Controls
                      if (_isComplete)
                        ScaleTransition(
                          scale: _celebrationScale,
                          child: Column(
                            children: [
                              const Icon(
                                Icons.check_circle,
                                size: 64,
                                color: Colors.white,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Session Complete!',
                                style: theme.textTheme.titleLarge?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 24),
                              Row(
                                children: [
                                  Expanded(
                                    child: GlassButton.custom(
                                      onTap: _reset,
                                      height: 56,
                                      shape: LiquidRoundedSuperellipse(borderRadius: 16),
                                      child: const Text(
                                        'Restart',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: GlassButton.custom(
                                      onTap: () =>
                                          Navigator.of(context).pop(),
                                      height: 56,
                                      shape: LiquidRoundedSuperellipse(borderRadius: 16),
                                      child: const Text(
                                        'Done',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )
                      else
                        Row(
                          children: [
                            if (_isRunning) ...[
                              Expanded(
                                child: GlassButton.custom(
                                  onTap: _pause,
                                  height: 56,
                                  shape: LiquidRoundedSuperellipse(borderRadius: 16),
                                  child: const Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.pause,
                                          size: 20, color: Colors.white),
                                      SizedBox(width: 8),
                                      Text(
                                        'Pause',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: GlassButton.custom(
                                  onTap: _advanceZone,
                                  height: 56,
                                  shape: LiquidRoundedSuperellipse(borderRadius: 16),
                                  child: const Text(
                                    'Skip',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ] else
                              Expanded(
                                child: GlassButton.custom(
                                  onTap: _startOrResume,
                                  height: 56,
                                  shape: LiquidRoundedSuperellipse(borderRadius: 16),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.play_arrow,
                                          size: 20, color: Colors.white),
                                      const SizedBox(width: 8),
                                      Text(
                                        _timerController.value > 0
                                            ? 'Resume'
                                            : 'Start',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),

              // Confetti overlay
              Align(
                alignment: Alignment.topCenter,
                child: ConfettiWidget(
                  confettiController: _confettiController,
                  blastDirectionality: BlastDirectionality.explosive,
                  maxBlastForce: 30,
                  minBlastForce: 10,
                  emissionFrequency: 0.05,
                  numberOfParticles: 25,
                  gravity: 0.2,
                  colors: const [
                    AppColors.primary,
                    Colors.white,
                    Color(0xFF80D8FF),
                    Color(0xFFFFD54F),
                    Color(0xFF82B1FF),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
