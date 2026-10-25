import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../state/auth_provider.dart';
import '../ui/app_button.dart';
import '../ui/app_card.dart';
import '../ui/app_colors.dart';
import '../ui/app_price.dart';
import '../ui/app_text.dart';
import 'login_screen.dart';
import 'my_bookings_screen.dart';
import 'property_detail_screen.dart';
import 'settings_screen.dart';
import 'wallet_screen.dart';
import 'vendor_dashboard_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _wallet;
  Map<String, dynamic>? _loyalty;
  int _bookingsCount = 0;
  late final AuthProvider _auth;

  @override
  void initState() {
    super.initState();
    _auth = context.read<AuthProvider>();
    _auth.addListener(_onAuthChanged);
    _load();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    super.dispose();
  }

  /// إعادة تحميل الرصيد والنقاط عند تسجيل الدخول أو الخروج
  void _onAuthChanged() {
    if (!mounted) return;
    if (!api.isAuthenticated) {
      setState(() {
        _wallet = null;
        _loyalty = null;
        _bookingsCount = 0;
      });
    } else {
      _load();
    }
  }

  ApiClient get api => context.read<ApiClient>();

  Future<void> _load() async {
    if (!api.isAuthenticated) return;
    try {
      final res = await Future.wait([
        api.get('/wallet').catchError((_) => null),
        api.get('/loyalty/me').catchError((_) => null),
        api.getFull('/bookings', query: {'limit': 1}).catchError((_) => null),
      ]);
      if (!mounted) return;
      final meta = (res[2] as Map?)?['meta'];
      setState(() {
        _wallet = res[0] as Map<String, dynamic>?;
        _loyalty = res[1] as Map<String, dynamic>?;
        _bookingsCount =
            ((meta is Map ? meta['total'] : null) as num?)?.toInt() ?? 0;
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.only(bottom: AppSpace.xxl),
          children: [
            // ────── الترويسة ──────
            Container(
              padding: const EdgeInsets.fromLTRB(
                AppSpace.md,
                AppSpace.lg,
                AppSpace.md,
                AppSpace.lg,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  colors: isDark
                      ? [AppColors.forestDeep, const Color(0xFF0A241E)]
                      : [AppColors.forest, AppColors.forestDeep],
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withOpacity(0.3),
                        width: 2,
                      ),
                    ),
                    child: Text(
                      (user?['fullName']?.toString() ?? 'ز').substring(0, 1),
                      style: AppText.h1.copyWith(color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: AppSpace.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?['fullName']?.toString() ?? 'زائر',
                          style: AppText.h2.copyWith(
                            color: Colors.white,
                            fontSize: 18,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?['email']?.toString() ?? 'لم تسجل الدخول',
                          style: AppText.bodySmall.copyWith(
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!auth.isLoggedIn)
                    TextButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      ),
                      child: Text(
                        'دخول',
                        style: AppText.h4.copyWith(color: Colors.white),
                      ),
                    ),
                ],
              ),
            ),

            if (auth.isLoggedIn) ...[
              // ────── إحصاءات ──────
              Padding(
                padding: const EdgeInsets.all(AppSpace.md),
                child: Row(
                  children: [
                    _stat(
                      context,
                      '${_wallet?['balance'] != null ? formatAmount((_wallet!['balance'] as num)) : '0'} د.ع',
                      'رصيد المحفظة',
                      Icons.account_balance_wallet_outlined,
                    ),
                    const SizedBox(width: AppSpace.xs),
                    _stat(
                      context,
                      '${(_loyalty?['points'] as num?)?.toInt() ?? 0}',
                      'نقطة مكافأة',
                      Icons.stars_outlined,
                    ),
                    const SizedBox(width: AppSpace.xs),
                    _stat(
                      context,
                      '$_bookingsCount',
                      'حجز',
                      Icons.confirmation_number_outlined,
                    ),
                  ],
                ),
              ),

              // ────── المدفوعات ──────
              AppSectionHeader(
                title: 'حساباتي',
                subtitle: 'المحفظة والحجوزات والمفضلة',
                padding: const EdgeInsets.fromLTRB(
                  AppSpace.md,
                  AppSpace.sm,
                  AppSpace.md,
                  AppSpace.xs,
                ),
              ),

              _menuItem(
                context,
                Icons.account_balance_wallet_outlined,
                'المحفظة',
                'شحن وسجل العمليات',
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const WalletScreen()),
                ),
              ),
              _menuItem(
                context,
                Icons.confirmation_number_outlined,
                'حجوزاتي',
                'تتبع وإلغاء وتقييم',
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MyBookingsScreen()),
                ),
              ),
              _menuItem(
                context,
                Icons.favorite_border_rounded,
                'المفضلة',
                'العقارات المحفوظة',
                () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                ),
              ),

              // ────── لوحة المزوّد (إذا كان المستخدم مزوّداً) ──────
              if (['FARM_OWNER', 'HOTEL_MANAGER', 'TRAVEL_AGENCY', 'VENDOR', 'ADMIN', 'SUPER_ADMIN']
                  .contains(auth.user?['role']))
                _menuItem(
                  context,
                  Icons.store_mall_directory_outlined,
                  'لوحة المزوّد',
                  'الحجوزات الواردة وعقاراتك',
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const VendorDashboardScreen()),
                  ),
                ),
            ],

            // ────── الإعدادات ──────
            AppSectionHeader(
              title: 'الإعدادات',
              subtitle: 'التطبيق والعرض والمساعدة',
              padding: const EdgeInsets.fromLTRB(
                AppSpace.md,
                AppSpace.lg,
                AppSpace.md,
                AppSpace.xs,
              ),
            ),
            _menuItem(
              context,
              Icons.settings_outlined,
              'إعدادات التطبيق',
              'اللغة والعملة والوضع الليلي',
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              ),
            ),
            _menuItem(
              context,
                Icons.support_agent_outlined,
              'الدعم الفني',
              'تذاكر وأسئلة شائعة',
              () {},
            ),
            _menuItem(
              context,
                Icons.info_outline_rounded,
              'عن Bookly',
              'نسخة التطبيق: 1.0.0',
              () {},
            ),

            const SizedBox(height: AppSpace.lg),
            if (auth.isLoggedIn)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
                child: AppButton(
                  label: 'تسجيل الخروج',
                  icon: Icons.logout_rounded,
                  variant: AppButtonVariant.ghost,
                  onPressed: () async {
                    await auth.logout();
                    if (mounted) setState(() {});
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _stat(
    BuildContext context,
    String value,
    String label,
    IconData icon,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: AppSpace.sm,
          horizontal: AppSpace.xs,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 17,
              color: isDark ? AppColors.darkForest : AppColors.forest,
            ),
            const SizedBox(height: 4),
            FittedBox(
              child: Text(
                value,
                style: AppText.h4.copyWith(
                  fontSize: 13,
                  color: isDark ? AppColors.darkText : AppColors.text,
                ),
              ),
            ),
            const SizedBox(height: 1),
            Text(label, style: AppText.labelFaint.copyWith(fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _menuItem(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(
          AppSpace.md,
          0,
          AppSpace.md,
          AppSpace.xs,
        ),
        padding: const EdgeInsets.all(AppSpace.sm),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
            ),
            const SizedBox(width: AppSpace.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppText.h4.copyWith(
                      fontSize: 14,
                      color: isDark ? AppColors.darkText : AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(subtitle, style: AppText.labelFaint),
                ],
              ),
            ),
            Icon(
              Icons.chevron_left_rounded,
              size: 20,
              color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
            ),
          ],
        ),
      ),
    );
  }
}

/// شاشة المفضلة
class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await context.read<ApiClient>().get('/favorites');
      if (!mounted) return;
      setState(() => _items = (data as List).cast());
    } catch (_) {}
  }

  Future<void> _remove(Map<String, dynamic> fav) async {
    final id = fav['property'] is Map ? (fav['property'] as Map)['id'] : null;
    if (id == null) return;
    try {
      await context.read<ApiClient>().delete('/favorites/$id');
      if (mounted) setState(() => _items.remove(fav));
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المفضلة')),
      body: _items.isEmpty
          ? const AppEmpty(
              icon: Icons.favorite_border_rounded,
              title: 'قائمة المفضلة فارغة',
              subtitle: 'احفظ عقاراتك المفضلة للرجوع إليها لاحقًا',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppSpace.md),
              itemCount: _items.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppSpace.sm),
              itemBuilder: (_, i) {
                final p = _items[i]['property'] as Map<String, dynamic>? ?? {};
                return InkWell(
                  onTap: () {
                    if (p['id'] == null) return;
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PropertyDetailScreen(
                          propertyId: p['id'].toString(),
                        ),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpace.sm),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.favorite_rounded,
                          color: Theme.of(context).colorScheme.primary,
                          size: 20,
                        ),
                        const SizedBox(width: AppSpace.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p['title']?.toString() ?? '',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.h4.copyWith(fontSize: 14),
                              ),
                              AppPriceRow(
                                amount: (p['pricePerNight'] as num?) ?? 0,
                                currency: p['currency']?.toString() ?? 'IQD',
                                size: AppPriceSize.small,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          tooltip: 'إزالة من المفضلة',
                          onPressed: () => _remove(_items[i]),
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
