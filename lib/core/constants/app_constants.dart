/// Global app constants.
class AppConstants {
  AppConstants._();

  /// Default brushing session duration in seconds (3 minutes).
  static const int defaultSessionDurationSec = 180;

  /// Number of brushing zones.
  static const int zoneCount = 14;

  /// Default duration per zone in seconds (evenly divided).
  static int get secondsPerZone => defaultSessionDurationSec ~/ zoneCount;

  /// Compute seconds per zone for a given total duration.
  static int secondsPerZoneFor(int totalDurationSec) =>
      totalDurationSec ~/ zoneCount;

  /// App name.
  static const String appName = 'Dentic';
}
