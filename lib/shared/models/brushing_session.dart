/// A completed brushing session record.
class BrushingSession {
  const BrushingSession({
    required this.id,
    required this.startedAt,
    required this.durationSec,
    required this.zonesCompleted,
    required this.totalZones,
    this.period = BrushingPeriod.morning,
  });

  final String id;
  final DateTime startedAt;
  final int durationSec;
  final int zonesCompleted;
  final int totalZones;
  final BrushingPeriod period;

  double get completionRate => zonesCompleted / totalZones;
  bool get isComplete => zonesCompleted == totalZones;
}

enum BrushingPeriod {
  morning,
  evening,
}
