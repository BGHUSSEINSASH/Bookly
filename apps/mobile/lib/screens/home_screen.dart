import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../state/auth_provider.dart';
import '../ui/app_button.dart';
import '../ui/app_card.dart';
import '../ui/app_city_card.dart';
import '../ui/app_colors.dart';
import '../ui/app_image.dart';
import '../ui/app_pill.dart';
import '../ui/app_price.dart';
import '../ui/app_property_card.dart';
import '../ui/app_promo.dart';
import '../ui/app_search_bar.dart';
import '../ui/app_shimmer.dart';
import '../ui/app_text.dart';
import 'login_screen.dart';
import 'notifications_screen.dart';
import 'property_detail_screen.dart';
import 'search_screen.dart';
import 'trips_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> _latest = [];
  List<Map<String, dynamic>> _farms = [];
  List<Map<String, dynamic>> _hotels = [];
  List<Map<String, dynamic>> _trips = [];
  List<Map<String, dynamic>> _cities = [];
  bool _loading = true;
  int _unreadNotifications = 0;

  static const _banners = [
    {
      'title': 'مزرعتك لعطلة نهاية الأسبوع',
      'subtitle': 'مسبح خاص · شواء عائلي · أقل من ساعة من بغداد',
      'imageUrl':
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&h=400&q=80&sat=-12&exp=4',
    },
    {
      'title': 'فنادق مختارة في أجمل المدن',
      'subtitle': 'إفطار مجاني · إلغاء مرن · تقييمات موثوقة',
      'imageUrl':
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&h=400&q=80&sat=-12&exp=4',
    },
  ];

  static const articles = [
    {
      'title': 'ثلاث مزارع قريبة من بغداد تكفي لعطلة نهاية الأسبوع',
      'body':
          'مسافة أقل من ساعة، مسبح خاص، وشواء عائلي. جمعنا خيارات جرّبناها بأنفسنا.',
      'image': 'photo-1488646953014-85cb44e25828',
      'date': '١٢ أكتوبر',
    },
    {
      'title': 'كيف تختار فندقًا في وسط المدينة دون أن تدفع أكثر؟',
      'body':
          'ثلاث قواعد بسيطة توفّر عليك ليلة كاملة: احجز منتصف الأسبوع، قارن الإفطار، واقرأ آخر عشر مراجعات.',
      'image': 'photo-1555396273-367ea4eb4db5',
      'date': '٨ أكتوبر',
    },
    {
      'title': 'رحلة يوم واحد إلى الأهوار: ماذا تأخذ معك؟',
      'body':
          'دليل عملي خفيف: مواعيد القوارب، أفضل وقت للتصوير، وما لا تحتاجه فعلًا في حقيبتك.',
      'image': 'photo-1547592180-85f173990554',
      'date': '٢ أكتوبر',
    },
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final res = await Future.wait([
        api.get('/properties/deals?limit=6'),
        api.get('/properties/featured?limit=6'),
        api.get('/properties?category=HOTEL&limit=6'),
        api.get('/trips?limit=6'),
        api.get('/properties/cities'),
      ]);
      if (!mounted) return;
      setState(() {
        _latest = _asList(res[0]);
        _farms = _asList(res[1]);
        _hotels = _asList(res[2]);
        _trips = _asList(res[3]);
        _cities = _asList(res[4]);
      });
    } catch (_) {
      // تجاهل — الهياكل تُعرض
    } finally {
      if (mounted) setState(() => _loading = false);
    }
    await _loadUnread();
  }

  Future<void> _loadUnread() async {
    if (!mounted) return;
    if (!context.read<AuthProvider>().isLoggedIn) {
      if (mounted) setState(() => _unreadNotifications = 0);
      return;
    }
    try {
      final data =
          await context.read<ApiClient>().get('/notifications/unread-count');
      if (!mounted) return;
      setState(() =>
          _unreadNotifications =
              (data is Map ? data['count'] as num? : null)?.toInt() ?? 0);
    } catch (_) {
      // صامت — العدّاد ليس حرجًا
    }
  }

  void _openNotifications() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
    );
    await _loadUnread();
  }

  List<Map<String, dynamic>> _asList(dynamic data) {
    if (data is Map && data['items'] != null) return (data['items'] as List).cast();
    if (data is List) return data.cast();
    return const [];
  }

  void _open(Map<String, dynamic> p) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PropertyDetailScreen(propertyId: p['id'].toString()),
      ),
    );
  }

  void _goSearch([String? category]) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SearchScreen(initialCategory: category),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final latest = _latest.isNotEmpty ? _latest : _farms;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: _load,
          color: AppColors.forest,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _header(auth)),
              SliverToBoxAdapter(child: _searchLauncher()),
              SliverToBoxAdapter(child: _categories()),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(top: AppSpace.xs),
                  child: AppBannerCarousel(
                    banners: _banners,
                    onTap: (b) => _goSearch(),
                  ),
                ),
              ),

              if (_loading)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      AppSpace.md,
                      AppSpace.lg,
                      AppSpace.md,
                      AppSpace.md,
                    ),
                    child: Row(
                      children: [
                        Expanded(child: AppSkeletonCard(height: 280)),
                        SizedBox(width: AppSpace.sm),
                        Expanded(child: AppSkeletonCard(height: 280)),
                      ],
                    ),
                  ),
                ),

              if (latest.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: AppSectionHeader(
                    title: 'أحدث الإعلانات',
                    subtitle: 'إضافات جديدة من مزودينا',
                    onSeeAll: () => _goSearch(),
                  ),
                ),
                SliverToBoxAdapter(child: _horizontalCards(latest)),
              ],

              const SliverToBoxAdapter(child: PromoCard()),

              if (_farms.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: AppSectionHeader(
                    title: 'مزارع مميزة',
                    subtitle: 'مساحات خاصة ووقت أبطأ',
                    onSeeAll: () => _goSearch('FARM'),
                  ),
                ),
                SliverToBoxAdapter(child: _horizontalCards(_farms)),
              ],

              if (_cities.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: AppSectionHeader(
                    title: 'استكشف حسب المدينة',
                    subtitle: 'من بغداد إلى أربيل',
                    onSeeAll: () => _goSearch(),
                  ),
                ),
                SliverToBoxAdapter(child: _citiesRow()),
              ],

              if (_hotels.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: AppSectionHeader(
                    title: 'فنادق مختارة',
                    subtitle: 'إقامة مريحة في قلب المدينة',
                    onSeeAll: () => _goSearch('HOTEL'),
                  ),
                ),
                SliverToBoxAdapter(child: _hotelsList()),
              ],

              if (_trips.isNotEmpty) ...[
                SliverToBoxAdapter(
                  child: AppSectionHeader(
                    title: 'رحلات قصيرة',
                    subtitle: 'تجارب تُحكى بعد العودة',
                    onSeeAll: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const TripsScreen()),
                    ),
                  ),
                ),
                SliverToBoxAdapter(child: _tripsRow()),
              ],

              const SliverToBoxAdapter(
                child: AppSectionHeader(
                  title: 'دفتر بوكلي',
                  subtitle: 'نصائح وتجارب من فريقنا',
                ),
              ),
              SliverToBoxAdapter(child: _articlesList()),

              SliverToBoxAdapter(child: _closing()),

              const SliverToBoxAdapter(child: SizedBox(height: AppSpace.xxl)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _header(AuthProvider auth) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final name = (auth.user?['fullName']?.toString() ?? '').trim();
    final firstName = name.isEmpty ? '' : name.split(' ').first;
    final sub = isDark ? AppColors.darkTextSoft : AppColors.textFaint;

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.md,
        AppSpace.md,
        AppSpace.md,
        AppSpace.xs,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'بوكلي',
                  style: AppText.h2.copyWith(
                    fontSize: 23,
                    fontWeight: FontWeight.w800,
                    color: isDark ? AppColors.darkForest : AppColors.forest,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  auth.isLoggedIn && firstName.isNotEmpty
                      ? 'أهلًا $firstName'
                      : 'أهلًا بك في بوكلي',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.labelFaint.copyWith(color: sub),
                ),
              ],
            ),
          ),
          AppIconButton(
            icon: _unreadNotifications > 0
                ? Icons.notifications_rounded
                : Icons.notifications_none_rounded,
            badge: _unreadNotifications > 0 && _unreadNotifications < 100
                ? '$_unreadNotifications'
                : null,
            onPressed: auth.isLoggedIn ? _openNotifications : null,
          ),
          if (!auth.isLoggedIn) ...[
            const SizedBox(width: AppSpace.xs),
            AppIconButton(
              icon: Icons.login_rounded,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _searchLauncher() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.md,
        AppSpace.sm,
        AppSpace.md,
        AppSpace.xs,
      ),
      child: AppSearchBar(
        readOnly: true,
        onTap: () => _goSearch(),
        onFilterTap: () => _goSearch(),
        hint: 'ابحث عن مزرعة، فندق، شاليه…',
      ),
    );
  }

  Widget _categories() {
    const items = [
      ('FARM', 'مزارع', Icons.park_outlined),
      ('HOTEL', 'فنادق', Icons.apartment_rounded),
      ('CHALET', 'شاليهات', Icons.cabin_outlined),
      ('TRIP', 'رحلات', Icons.explore_outlined),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpace.md,
        vertical: AppSpace.sm,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          for (final item in items)
            AppCircleCategory(
              icon: item.$3,
              label: item.$2,
              onTap: () => _goSearch(item.$1),
            ),
        ],
      ),
    );
  }

  Widget _horizontalCards(List<Map<String, dynamic>> items) {
    return SizedBox(
      height: 368,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpace.sm),
        itemBuilder: (_, i) => AppPropertyCard(
          property: items[i],
          width: 258,
          onTap: () => _open(items[i]),
        ),
      ),
    );
  }

  Widget _citiesRow() {
    return SizedBox(
      height: 148,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
        itemCount: _cities.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpace.sm),
        itemBuilder: (_, i) {
          final c = _cities[i];
          return AppCityCard(
            name: c['nameAr']?.toString() ?? '',
            imageUrl: cityImage(c['slug']?.toString() ?? 'baghdad'),
            count: c['_count']?['properties'],
            onTap: () => _goSearch(),
          );
        },
      ),
    );
  }

  Widget _tripsRow() {
    return SizedBox(
      height: 210,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
        itemCount: _trips.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpace.sm),
        itemBuilder: (_, i) {
          final t = _trips[i];
          final images = (t['images'] as List?)?.cast<dynamic>() ?? [];
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return SizedBox(
            width: 268,
            child: Material(
              borderRadius: BorderRadius.circular(AppRadius.xl),
              clipBehavior: Clip.antiAlias,
              color: isDark ? AppColors.darkSurface : Colors.white,
              child: InkWell(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const TripsScreen()),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          AppImage(
                            url: images.isNotEmpty
                                ? images.first.toString()
                                : null,
                          ),
                          Positioned(
                            top: AppSpace.sm,
                            right: AppSpace.sm,
                            child: AppPill(
                              label: AppLabels.tripTypes[
                                      t['type']?.toString() ?? ''] ??
                                  '',
                              tone: AppPillTone.forest,
                              size: 10.5,
                              dense: true,
                            ),
                          ),
                          Positioned(
                            left: AppSpace.sm,
                            bottom: AppSpace.sm,
                            child: AppPill(
                              label: '${t['durationDays'] ?? 1} يوم',
                              icon: Icons.schedule_rounded,
                              tone: AppPillTone.glass,
                              size: 10.5,
                              dense: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(AppSpace.sm),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t['title']?.toString() ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.h4.copyWith(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? AppColors.darkText
                                  : AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  t['city']?['nameAr']?.toString() ??
                                      'العراق',
                                  style: AppText.labelFaint.copyWith(
                                    color: isDark
                                        ? AppColors.darkTextSoft
                                        : AppColors.textFaint,
                                  ),
                                ),
                              ),
                              AppPriceRow(
                                amount: (t['pricePerPerson'] as num?) ?? 0,
                                currency:
                                    t['currency']?.toString() ?? 'IQD',
                                size: AppPriceSize.small,
                                suffix: '/ شخص',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _hotelsList() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final border = isDark ? AppColors.darkBorder : AppColors.border;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
      child: Column(
        children: [
          for (var i = 0; i < _hotels.length; i++) ...[
            if (i > 0) Divider(height: 1, color: border),
            InkWell(
              onTap: () => _open(_hotels[i]),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpace.sm),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      child: SizedBox(
                        width: 92,
                        height: 74,
                        child: AppImage(
                          url: ((_hotels[i]['images'] as List?) ?? [])
                                  .isNotEmpty
                              ? (_hotels[i]['images'] as List).first.toString()
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpace.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _hotels[i]['title']?.toString() ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.h4.copyWith(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color:
                                  isDark ? AppColors.darkText : AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            [
                              _hotels[i]['city']?['nameAr']?.toString() ?? '',
                              if (((_hotels[i]['bedrooms'] as num?) ?? 0) > 0)
                                '${(_hotels[i]['bedrooms'] as num).toInt()} غرف',
                            ].where((e) => e.isNotEmpty).join(' · '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.labelFaint.copyWith(
                              color: isDark
                                  ? AppColors.darkTextSoft
                                  : AppColors.textFaint,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpace.xs),
                    AppPriceRow(
                      amount: (_hotels[i]['pricePerNight'] as num?) ?? 0,
                      currency:
                          _hotels[i]['currency']?.toString() ?? 'IQD',
                      size: AppPriceSize.small,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _articlesList() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
      child: Column(
        children: articles.map((a) {
          return Container(
            margin: const EdgeInsets.only(bottom: AppSpace.sm),
            padding: const EdgeInsets.all(AppSpace.sm),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.border,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  child: SizedBox(
                    width: 92,
                    height: 92,
                    child: AppImage(
                      url:
                          'https://images.unsplash.com/${a['image']}?auto=format&fit=crop&w=300&h=300&q=80&sat=-12&exp=4',
                    ),
                  ),
                ),
                const SizedBox(width: AppSpace.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        a['title'].toString(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.h4.copyWith(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkText : AppColors.text,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        a['body'].toString(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.labelFaint.copyWith(
                          height: 1.5,
                          color: isDark
                              ? AppColors.darkTextSoft
                              : AppColors.textSoft,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            a['date'].toString(),
                            style: AppText.labelFaint.copyWith(
                              fontSize: 10,
                              color: isDark
                                  ? AppColors.darkTextSoft
                                  : AppColors.textFaint,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            width: 3,
                            height: 3,
                            decoration: const BoxDecoration(
                              color: AppColors.textFaint,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'فريق Bookly',
                            style: AppText.labelFaint.copyWith(
                              fontSize: 10,
                              color: isDark
                                  ? AppColors.darkTextSoft
                                  : AppColors.textFaint,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _closing() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.md,
        AppSpace.lg,
        AppSpace.md,
        AppSpace.md,
      ),
      child: AppButton(
        label: 'تصفح جميع العقارات',
        icon: Icons.search_rounded,
        variant: AppButtonVariant.soft,
        height: 48,
        onPressed: () => _goSearch(),
      ),
    );
  }
}

/// كارت «أضف مزرعتك وابدأ الكسب»
class PromoCard extends StatelessWidget {
  const PromoCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpace.lg, bottom: AppSpace.xs),
      child: AppPromoCard(
        title: 'أضف مزرعتك وابدأ الكسب',
        subtitle:
            'اشترك كمزوّد، وتابع مشاهداتك، واستقبل طلبات الحجز مباشرة.',
        points: const [
          'التسجيل مجاني بالكامل',
          'تابع المشاهدات واستقبل الطلبات',
        ],
        ctaLabel: 'ابدأ الآن',
        imageUrl:
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&h=800&q=80&sat=-12&exp=4',
        onCta: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        ),
      ),
    );
  }
}
