/// Global app constants.
class AppConstants {
  AppConstants._();

  /// Default brushing session duration in seconds (3 minutes).
  static const int defaultSessionDurationSec = 180;

  /// Number of brushing zones.
  static const int zoneCount = 14;

  /// Duration per zone in seconds (evenly divided).
  static int get secondsPerZone => defaultSessionDurationSec ~/ zoneCount;

  /// App name.
  static const String appName = 'Dentic';
}
