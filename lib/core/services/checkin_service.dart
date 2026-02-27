import 'package:hive/hive.dart';

import '../../shared/models/checkin_record.dart';

/// Persists daily check-in records via Hive, keyed by `yyyy-MM-dd`.
class CheckinService {
  CheckinService(this._box);

  final Box<CheckinRecord> _box;

  static String _keyFor(DateTime date) =>
      '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

  CheckinRecord getRecord(DateTime date) {
    final key = _keyFor(date);
    return _box.get(key) ??
        CheckinRecord(date: DateTime(date.year, date.month, date.day));
  }

  Future<void> saveRecord(CheckinRecord record) {
    return _box.put(_keyFor(record.date), record);
  }

  /// Returns all records for a given month.
  List<CheckinRecord> getRecordsForMonth(int year, int month) {
    return _box.values.where((r) {
      return r.date.year == year && r.date.month == month;
    }).toList();
  }

  /// Counts consecutive days (from today backwards) where at least
  /// one brushing was recorded (isPartial == true).
  int getStreak() {
    var streak = 0;
    var day = DateTime.now();
    day = DateTime(day.year, day.month, day.day);

    while (true) {
      final record = _box.get(_keyFor(day));
      if (record == null || !record.isPartial) break;
      streak++;
      day = day.subtract(const Duration(days: 1));
    }
    return streak;
  }
}
