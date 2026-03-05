import 'package:flutter_test/flutter_test.dart';
import 'package:dentic/shared/models/brushing_session.dart';

void main() {
  group('BrushingSession', () {
    test('completionRate returns correct ratio', () {
      final s = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 180,
        zonesCompleted: 7,
        totalZones: 14,
      );
      expect(s.completionRate, 0.5);
    });

    test('isComplete is true when all zones completed', () {
      final s = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 180,
        zonesCompleted: 14,
        totalZones: 14,
      );
      expect(s.isComplete, true);
    });

    test('isComplete is false when zones are missing', () {
      final s = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 120,
        zonesCompleted: 10,
        totalZones: 14,
      );
      expect(s.isComplete, false);
    });

    test('qualityScore is ~1.0 for perfect session', () {
      // 14 zones * 13s expected = 182s expected
      final s = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 182,
        zonesCompleted: 14,
        totalZones: 14,
      );
      expect(s.qualityScore, closeTo(1.0, 0.05));
    });

    test('qualityScore is lower for incomplete session', () {
      final s = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 90,
        zonesCompleted: 7,
        totalZones: 14,
      );
      expect(s.qualityScore, lessThan(0.7));
      expect(s.qualityScore, greaterThan(0.0));
    });

    test('copyWith preserves fields', () {
      final original = BrushingSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5),
        durationSec: 180,
        zonesCompleted: 14,
        totalZones: 14,
        period: BrushingPeriod.morning,
      );
      final copy = original.copyWith(durationSec: 200);
      expect(copy.id, '1');
      expect(copy.durationSec, 200);
      expect(copy.zonesCompleted, 14);
      expect(copy.period, BrushingPeriod.morning);
    });
  });

  group('BrushingSessionAdapter', () {
    test('has correct typeId', () {
      final adapter = BrushingSessionAdapter();
      expect(adapter.typeId, 1);
    });
  });
}
