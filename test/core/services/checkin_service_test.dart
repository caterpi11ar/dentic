import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'dart:io';

import 'package:dentic/core/services/checkin_service.dart';
import 'package:dentic/shared/models/checkin_record.dart';

void main() {
  late Box<CheckinRecord> box;
  late CheckinService service;
  late Directory tempDir;

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_test_');
    Hive.init(tempDir.path);
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(CheckinRecordAdapter());
    }
    box = await Hive.openBox<CheckinRecord>('test_checkins');
    service = CheckinService(box);
  });

  tearDown(() async {
    await box.deleteFromDisk();
    await tempDir.delete(recursive: true);
  });

  group('CheckinService', () {
    test('getRecord returns empty record for new date', () {
      final record = service.getRecord(DateTime(2026, 3, 5));
      expect(record.morningDone, false);
      expect(record.eveningDone, false);
    });

    test('saveRecord and getRecord round-trip', () async {
      final record = CheckinRecord(
        date: DateTime(2026, 3, 5),
        morningDone: true,
      );
      await service.saveRecord(record);
      final fetched = service.getRecord(DateTime(2026, 3, 5));
      expect(fetched.morningDone, true);
      expect(fetched.eveningDone, false);
    });

    test('getRecordsForMonth returns correct records', () async {
      await service.saveRecord(CheckinRecord(
        date: DateTime(2026, 3, 1),
        morningDone: true,
      ));
      await service.saveRecord(CheckinRecord(
        date: DateTime(2026, 3, 15),
        eveningDone: true,
      ));
      await service.saveRecord(CheckinRecord(
        date: DateTime(2026, 2, 28),
        morningDone: true,
      ));

      final march = service.getRecordsForMonth(2026, 3);
      expect(march.length, 2);

      final feb = service.getRecordsForMonth(2026, 2);
      expect(feb.length, 1);
    });

    group('getStreak', () {
      test('returns 0 when no records exist', () {
        expect(service.getStreak(), 0);
      });

      test('returns 1 for today only', () async {
        final today = DateTime.now();
        await service.saveRecord(CheckinRecord(
          date: DateTime(today.year, today.month, today.day),
          morningDone: true,
        ));
        expect(service.getStreak(), 1);
      });

      test('returns consecutive days count', () async {
        final today = DateTime.now();
        final todayNorm = DateTime(today.year, today.month, today.day);
        for (var i = 0; i < 5; i++) {
          final day = todayNorm.subtract(Duration(days: i));
          await service.saveRecord(CheckinRecord(
            date: day,
            morningDone: true,
          ));
        }
        expect(service.getStreak(), 5);
      });

      test('streak breaks on gap day', () async {
        final today = DateTime.now();
        final todayNorm = DateTime(today.year, today.month, today.day);
        // Today and yesterday
        await service.saveRecord(CheckinRecord(
          date: todayNorm,
          morningDone: true,
        ));
        await service.saveRecord(CheckinRecord(
          date: todayNorm.subtract(const Duration(days: 1)),
          morningDone: true,
        ));
        // Skip day -2, have day -3
        await service.saveRecord(CheckinRecord(
          date: todayNorm.subtract(const Duration(days: 3)),
          morningDone: true,
        ));
        expect(service.getStreak(), 2);
      });
    });
  });
}
