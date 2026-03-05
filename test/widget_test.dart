import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:hive/hive.dart';
import 'dart:io';

import 'package:dentic/core/providers.dart';
import 'package:dentic/core/services/audio_service.dart';
import 'package:dentic/core/services/brushing_session_service.dart';
import 'package:dentic/core/services/checkin_service.dart';
import 'package:dentic/core/services/settings_service.dart';
import 'package:dentic/features/checkin/checkin_screen.dart';
import 'package:dentic/l10n/app_localizations.dart';
import 'package:dentic/shared/models/brushing_session.dart';
import 'package:dentic/shared/models/checkin_record.dart';

void main() {
  late Directory tempDir;
  late Box<dynamic> settingsBox;
  late Box<CheckinRecord> checkinsBox;
  late Box<BrushingSession> sessionsBox;

  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('hive_widget_test_');
    Hive.init(tempDir.path);
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(CheckinRecordAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(BrushingSessionAdapter());
    }
    settingsBox = await Hive.openBox<dynamic>('test_settings');
    checkinsBox = await Hive.openBox<CheckinRecord>('test_checkins');
    sessionsBox = await Hive.openBox<BrushingSession>('test_sessions');
  });

  tearDown(() async {
    await settingsBox.deleteFromDisk();
    await checkinsBox.deleteFromDisk();
    await sessionsBox.deleteFromDisk();
    await Hive.close();
    await tempDir.delete(recursive: true);
  });

  testWidgets('CheckinScreen renders greeting and chips',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          settingsServiceProvider
              .overrideWithValue(SettingsService(settingsBox)),
          checkinServiceProvider
              .overrideWithValue(CheckinService(checkinsBox)),
          brushingSessionServiceProvider
              .overrideWithValue(BrushingSessionService(sessionsBox)),
          audioServiceProvider.overrideWithValue(AudioService()),
        ],
        child: const MaterialApp(
          localizationsDelegates: [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: AppLocalizations.supportedLocales,
          home: Scaffold(body: CheckinScreen()),
        ),
      ),
    );

    // Pump several frames to let flutter_animate render widgets.
    for (var i = 0; i < 10; i++) {
      await tester.pump(const Duration(milliseconds: 100));
    }

    // Greeting visible
    final hasMorning = find.text('Good morning!');
    final hasEvening = find.text('Good evening!');
    expect(
      hasMorning.evaluate().isNotEmpty || hasEvening.evaluate().isNotEmpty,
      true,
    );

    // Check-in chips visible
    expect(find.text('Morning'), findsOneWidget);
    expect(find.text('Evening'), findsOneWidget);

    // Start Brushing button visible
    expect(find.text('Start Brushing'), findsOneWidget);
  });
}
