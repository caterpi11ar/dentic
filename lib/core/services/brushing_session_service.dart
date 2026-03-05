import 'package:hive/hive.dart';

import '../../shared/models/brushing_session.dart';

/// Persists brushing session records via Hive, keyed by session ID.
class BrushingSessionService {
  BrushingSessionService(this._box);

  final Box<BrushingSession> _box;

  Future<void> saveSession(BrushingSession session) {
    return _box.put(session.id, session);
  }

  List<BrushingSession> getSessionsForDate(DateTime date) {
    return _box.values.where((s) {
      return s.startedAt.year == date.year &&
          s.startedAt.month == date.month &&
          s.startedAt.day == date.day;
    }).toList();
  }

  List<BrushingSession> getSessionsForMonth(int year, int month) {
    return _box.values.where((s) {
      return s.startedAt.year == year && s.startedAt.month == month;
    }).toList();
  }
}
