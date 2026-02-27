// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Dentic';

  @override
  String get appTagline => 'Build a lifelong brushing habit.';

  @override
  String get home => 'Home';

  @override
  String get history => 'History';

  @override
  String get settings => 'Settings';

  @override
  String get today => 'Today';

  @override
  String get morning => 'Morning';

  @override
  String get evening => 'Evening';

  @override
  String streakCount(int count) {
    return '$count-day streak';
  }

  @override
  String get streakEmpty => 'Start brushing to build your streak!';

  @override
  String get startBrushing => 'Start Brushing';

  @override
  String get historyTitle => 'History';

  @override
  String get historySubtitle => 'Track your brushing progress.';

  @override
  String get historyEmpty => 'No brushing history yet';

  @override
  String get historyEmptyHint =>
      'Complete your first session\nto see stats here.';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get brushing => 'Brushing';

  @override
  String get toothbrushMode => 'Toothbrush Mode';

  @override
  String get manual => 'Manual';

  @override
  String get sessionDuration => 'Session Duration';

  @override
  String get threeMinutes => '3 minutes';

  @override
  String get notifications => 'Notifications';

  @override
  String get reminders => 'Reminders';

  @override
  String get morningAndEvening => 'Morning & evening';

  @override
  String get sound => 'Sound';

  @override
  String get defaultLabel => 'Default';

  @override
  String get about => 'About';

  @override
  String get version => 'Version';

  @override
  String get appearance => 'Appearance';

  @override
  String get theme => 'Theme';

  @override
  String get language => 'Language';

  @override
  String get systemTheme => 'System';

  @override
  String get lightTheme => 'Light';

  @override
  String get darkTheme => 'Dark';

  @override
  String get followSystem => 'Follow system';

  @override
  String get english => 'English';

  @override
  String get chinese => '中文';

  @override
  String zoneProgress(int current, int total) {
    return 'Zone $current / $total';
  }

  @override
  String get sessionComplete => 'Session Complete!';

  @override
  String get restart => 'Restart';

  @override
  String get done => 'Done';

  @override
  String get pause => 'Pause';

  @override
  String get skip => 'Skip';

  @override
  String get resume => 'Resume';

  @override
  String get start => 'Start';
}
