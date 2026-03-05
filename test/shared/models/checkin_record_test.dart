import 'package:flutter_test/flutter_test.dart';
import 'package:dentic/shared/models/checkin_record.dart';

void main() {
  group('CheckinRecord', () {
    test('isComplete requires both morning and evening', () {
      final record = CheckinRecord(
        date: DateTime(2026, 3, 5),
        morningDone: true,
        eveningDone: true,
      );
      expect(record.isComplete, true);
    });

    test('isPartial is true with only morning', () {
      final record = CheckinRecord(
        date: DateTime(2026, 3, 5),
        morningDone: true,
      );
      expect(record.isPartial, true);
      expect(record.isComplete, false);
    });

    test('isPartial is true with only evening', () {
      final record = CheckinRecord(
        date: DateTime(2026, 3, 5),
        eveningDone: true,
      );
      expect(record.isPartial, true);
      expect(record.isComplete, false);
    });

    test('neither partial nor complete by default', () {
      final record = CheckinRecord(date: DateTime(2026, 3, 5));
      expect(record.isPartial, false);
      expect(record.isComplete, false);
    });

    test('copyWith preserves fields', () {
      final original = CheckinRecord(
        date: DateTime(2026, 3, 5),
        morningDone: true,
      );
      final copy = original.copyWith(eveningDone: true);
      expect(copy.morningDone, true);
      expect(copy.eveningDone, true);
      expect(copy.date, DateTime(2026, 3, 5));
    });

    test('copyWith overrides fields', () {
      final original = CheckinRecord(
        date: DateTime(2026, 3, 5),
        morningDone: true,
        eveningDone: true,
      );
      final copy = original.copyWith(morningDone: false);
      expect(copy.morningDone, false);
      expect(copy.eveningDone, true);
    });
  });

  group('CheckinRecordAdapter', () {
    test('has correct typeId', () {
      final adapter = CheckinRecordAdapter();
      expect(adapter.typeId, 0);
    });
  });
}
