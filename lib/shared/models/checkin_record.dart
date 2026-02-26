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
}
