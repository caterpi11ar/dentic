import 'package:hive/hive.dart';

/// Daily check-in record for AM/PM brushing.
class CheckinRecord {
  const CheckinRecord({
    required this.date,
    this.morningDone = false,
    this.eveningDone = false,
  });

  final DateTime date;
  final bool morningDone;
  final bool eveningDone;

  bool get isComplete => morningDone && eveningDone;
  bool get isPartial => morningDone || eveningDone;

  CheckinRecord copyWith({
    DateTime? date,
    bool? morningDone,
    bool? eveningDone,
  }) {
    return CheckinRecord(
      date: date ?? this.date,
      morningDone: morningDone ?? this.morningDone,
      eveningDone: eveningDone ?? this.eveningDone,
    );
  }
}

/// Hive TypeAdapter for [CheckinRecord].
class CheckinRecordAdapter extends TypeAdapter<CheckinRecord> {
  @override
  final int typeId = 0;

  @override
  CheckinRecord read(BinaryReader reader) {
    final date = DateTime.parse(reader.readString());
    final morningDone = reader.readBool();
    final eveningDone = reader.readBool();
    return CheckinRecord(
      date: date,
      morningDone: morningDone,
      eveningDone: eveningDone,
    );
  }

  @override
  void write(BinaryWriter writer, CheckinRecord obj) {
    writer.writeString(obj.date.toIso8601String());
    writer.writeBool(obj.morningDone);
    writer.writeBool(obj.eveningDone);
  }
}
