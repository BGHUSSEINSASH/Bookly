import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/api_client.dart';
import 'ui/app_colors.dart';
import 'ui/app_tabbar.dart';
import 'ui/app_theme.dart';
import 'state/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/search_screen.dart';
import 'screens/trips_screen.dart';
import 'screens/map_screen.dart';
import 'screens/profile_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiClient();
  await api.loadTokens();

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: api),
        ChangeNotifierProvider(create: (_) => AuthProvider(api)..bootstrap()),
        ChangeNotifierProvider(create: (_) => ThemeController()),
      ],
      child: const BooklyApp(),
    ),
  );
}

/// متحكّم بالوضع الليلي
class ThemeController extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.light;

  ThemeMode get mode => _mode;
  bool get isDark => _mode == ThemeMode.dark;

  void toggle() {
    _mode = isDark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }
}

class BooklyApp extends StatelessWidget {
  const BooklyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeMode = context.watch<ThemeController>().mode;

    return MaterialApp(
      title: 'Bookly',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const RootShell(),
    );
  }
}

/// الهيكل الرئيسي — 5 تبويبات مطابقة للمرجع
class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  static const _tabs = [
    AppTabItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: 'الرئيسية',
    ),
    AppTabItem(
      icon: Icons.map_outlined,
      activeIcon: Icons.map_rounded,
      label: 'الخريطة',
    ),
    AppTabItem(
      icon: Icons.play_circle_outline_rounded,
      activeIcon: Icons.play_circle_rounded,
      label: 'الرحلات',
    ),
    AppTabItem(
      icon: Icons.search_rounded,
      activeIcon: Icons.search_rounded,
      label: 'البحث',
    ),
    AppTabItem(
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      label: 'حسابي',
    ),
  ];

  /// الصفحات التي زُرِرت (لتفادي بناء الخريطة قبل الحاجة)
  final Set<int> _visited = {0};

  static Widget _pageFor(int index) {
    switch (index) {
      case 0:
        return const HomeScreen();
      case 1:
        return const MapScreen();
      case 2:
        return const TripsScreen();
      case 3:
        return const SearchScreen();
      default:
        return const ProfileScreen();
    }
  }

  void _select(int i) {
    setState(() {
      _visited.add(i);
      _index = i;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: List.generate(
          _tabs.length,
          (i) => _visited.contains(i) ? _pageFor(i) : const SizedBox.shrink(),
        ),
      ),
      bottomNavigationBar: AppTabBar(
        currentIndex: _index,
        onTap: _select,
        items: _tabs,
      ),
    );
  }
}

/// يوفّر ألوان الوضع الحالي بسهولة
extension ThemeContextX on BuildContext {
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
  Color get surfaceColor =>
      isDarkMode ? AppColors.darkSurface : Colors.white;
}
