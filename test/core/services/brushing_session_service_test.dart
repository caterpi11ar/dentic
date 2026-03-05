import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'dart:io';

import 'package:dentic/core/services/brushing_session_service.dart';
import 'package:dentic/shared/models/brushing_session.dart';

void main() {
  late Box<BrushingSession> box;
  late BrushingSessionService service;
  late Directory tempDir;

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_session_test_');
    Hive.init(tempDir.path);
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(BrushingSessionAdapter());
    }
    box = await Hive.openBox<BrushingSession>('test_sessions');
    service = BrushingSessionService(box);
  });

  tearDown(() async {
    await box.deleteFromDisk();
    await tempDir.delete(recursive: true);
  });

  group('BrushingSessionService', () {
    BrushingSession makeSession({
      required String id,
      required DateTime startedAt,
      int durationSec = 180,
      int zonesCompleted = 14,
    }) {
      return BrushingSession(
        id: id,
        startedAt: startedAt,
        durationSec: durationSec,
        zonesCompleted: zonesCompleted,
        totalZones: 14,
      );
    }

    test('saveSession and getSessionsForDate', () async {
      final session = makeSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5, 8, 30),
      );
      await service.saveSession(session);

      final results = service.getSessionsForDate(DateTime(2026, 3, 5));
      expect(results.length, 1);
      expect(results.first.id, '1');

      final noResults = service.getSessionsForDate(DateTime(2026, 3, 6));
      expect(noResults, isEmpty);
    });

    test('getSessionsForMonth returns correct sessions', () async {
      await service.saveSession(makeSession(
        id: '1',
        startedAt: DateTime(2026, 3, 1, 8),
      ));
      await service.saveSession(makeSession(
        id: '2',
        startedAt: DateTime(2026, 3, 15, 20),
      ));
      await service.saveSession(makeSession(
        id: '3',
        startedAt: DateTime(2026, 2, 28, 8),
      ));

      final march = service.getSessionsForMonth(2026, 3);
      expect(march.length, 2);

      final feb = service.getSessionsForMonth(2026, 2);
      expect(feb.length, 1);
    });

    test('multiple sessions on same day', () async {
      await service.saveSession(makeSession(
        id: '1',
        startedAt: DateTime(2026, 3, 5, 8, 0),
      ));
      await service.saveSession(makeSession(
        id: '2',
        startedAt: DateTime(2026, 3, 5, 20, 0),
      ));

      final results = service.getSessionsForDate(DateTime(2026, 3, 5));
      expect(results.length, 2);
    });
  });
}
