import 'package:hive/hive.dart';

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

  /// Quality score: completion rate weighted by duration accuracy.
  /// A full session at expected duration scores 1.0.
  double get qualityScore {
    final completion = completionRate;
    // Expected duration = totalZones * ~13s (180/14)
    final expectedDuration = totalZones * 13;
    final durationRatio = expectedDuration > 0
        ? (durationSec / expectedDuration).clamp(0.0, 1.5)
        : 1.0;
    // Weight: 70% completion, 30% duration accuracy
    final durationScore = 1.0 - (durationRatio - 1.0).abs();
    return (completion * 0.7 + durationScore * 0.3).clamp(0.0, 1.0);
  }

  BrushingSession copyWith({
    String? id,
    DateTime? startedAt,
    int? durationSec,
    int? zonesCompleted,
    int? totalZones,
    BrushingPeriod? period,
  }) {
    return BrushingSession(
      id: id ?? this.id,
      startedAt: startedAt ?? this.startedAt,
      durationSec: durationSec ?? this.durationSec,
      zonesCompleted: zonesCompleted ?? this.zonesCompleted,
      totalZones: totalZones ?? this.totalZones,
      period: period ?? this.period,
    );
  }
}

enum BrushingPeriod {
  morning,
  evening,
}

/// Hive TypeAdapter for [BrushingSession].
class BrushingSessionAdapter extends TypeAdapter<BrushingSession> {
  @override
  final int typeId = 1;

  @override
  BrushingSession read(BinaryReader reader) {
    final id = reader.readString();
    final startedAt = DateTime.parse(reader.readString());
    final durationSec = reader.readInt();
    final zonesCompleted = reader.readInt();
    final totalZones = reader.readInt();
    final periodIndex = reader.readInt();
    return BrushingSession(
      id: id,
      startedAt: startedAt,
      durationSec: durationSec,
      zonesCompleted: zonesCompleted,
      totalZones: totalZones,
      period: BrushingPeriod.values[periodIndex],
    );
  }

  @override
  void write(BinaryWriter writer, BrushingSession obj) {
    writer.writeString(obj.id);
    writer.writeString(obj.startedAt.toIso8601String());
    writer.writeInt(obj.durationSec);
    writer.writeInt(obj.zonesCompleted);
    writer.writeInt(obj.totalZones);
    writer.writeInt(obj.period.index);
  }
}
