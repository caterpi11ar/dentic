// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appName => 'Dentic';

  @override
  String get appTagline => '养成终身刷牙好习惯。';

  @override
  String get home => '首页';

  @override
  String get history => '历史';

  @override
  String get settings => '设置';

  @override
  String get today => '今日';

  @override
  String get morning => '早上';

  @override
  String get evening => '晚上';

  @override
  String get goodMorning => '早上好！';

  @override
  String get goodEvening => '晚上好！';

  @override
  String streakCount(int count) {
    return '连续 $count 天';
  }

  @override
  String get streakEmpty => '开始刷牙，建立你的连续记录！';

  @override
  String get streakActive => '继续保持！';

  @override
  String get startBrushing => '开始刷牙';

  @override
  String get historyTitle => '历史';

  @override
  String get historySubtitle => '追踪你的刷牙进度。';

  @override
  String get historyEmpty => '还没有刷牙记录';

  @override
  String get historyEmptyHint => '完成第一次刷牙\n即可在此查看统计。';

  @override
  String get settingsTitle => '设置';

  @override
  String get brushing => '刷牙';

  @override
  String get toothbrushMode => '牙刷类型';

  @override
  String get manual => '手动';

  @override
  String get electric => '电动';

  @override
  String get sessionDuration => '刷牙时长';

  @override
  String durationMinutes(int count) {
    return '$count 分钟';
  }

  @override
  String get threeMinutes => '3 分钟';

  @override
  String get notifications => '通知';

  @override
  String get reminders => '提醒';

  @override
  String get morningAndEvening => '早晚提醒';

  @override
  String get sound => '声音';

  @override
  String get defaultLabel => '默认';

  @override
  String get about => '关于';

  @override
  String get version => '版本';

  @override
  String get appearance => '外观';

  @override
  String get theme => '主题';

  @override
  String get language => '语言';

  @override
  String get systemTheme => '跟随系统';

  @override
  String get lightTheme => '浅色';

  @override
  String get darkTheme => '深色';

  @override
  String get followSystem => '跟随系统';

  @override
  String get english => 'English';

  @override
  String get chinese => '中文';

  @override
  String zoneProgress(int current, int total) {
    return '区域 $current / $total';
  }

  @override
  String get sessionComplete => '刷牙完成！';

  @override
  String get restart => '重新开始';

  @override
  String get done => '完成';

  @override
  String get pause => '暂停';

  @override
  String get skip => '跳过';

  @override
  String get resume => '继续';

  @override
  String get start => '开始';

  @override
  String completeDays(int count) {
    return '$count 天完成';
  }

  @override
  String partialDays(int count) {
    return '$count 天部分';
  }

  @override
  String avgQuality(int percent) {
    return '$percent% 平均';
  }

  @override
  String get sessionDetails => '刷牙详情';

  @override
  String sessionDurationValue(int seconds) {
    return '$seconds秒';
  }

  @override
  String zonesCompletedValue(int completed, int total) {
    return '$completed/$total 区域';
  }

  @override
  String qualityScore(int percent) {
    return '质量：$percent%';
  }
}
