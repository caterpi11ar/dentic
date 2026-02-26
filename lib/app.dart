import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'core/router.dart';

class DenticApp extends StatelessWidget {
  const DenticApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Dentic',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
