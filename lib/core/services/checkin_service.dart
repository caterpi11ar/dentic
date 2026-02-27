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
}
