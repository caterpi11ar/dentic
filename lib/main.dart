import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:liquid_glass_widgets/liquid_glass_widgets.dart';

import 'app.dart';
import 'core/providers.dart';
import 'core/services/checkin_service.dart';
import 'core/services/settings_service.dart';
import 'shared/models/checkin_record.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Hive
  await Hive.initFlutter();
  Hive.registerAdapter(CheckinRecordAdapter());
  final settingsBox = await Hive.openBox<dynamic>('settings');
  final checkinsBox = await Hive.openBox<CheckinRecord>('checkins');

  // Liquid Glass
  await LiquidGlassWidgets.initialize();

  runApp(
    ProviderScope(
      overrides: [
        settingsServiceProvider.overrideWithValue(
          SettingsService(settingsBox),
        ),
        checkinServiceProvider.overrideWithValue(
          CheckinService(checkinsBox),
        ),
      ],
      child: const DenticApp(),
    ),
  );
}
