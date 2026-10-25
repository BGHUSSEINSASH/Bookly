import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/api_client.dart';
import '../ui/app_button.dart';
import '../ui/app_card.dart';
import '../ui/app_colors.dart';
import '../ui/app_image.dart';
import '../ui/app_pill.dart';
import '../ui/app_price.dart';
import '../ui/app_specs.dart';
import '../ui/app_text.dart';
import 'booking_screen.dart';
import 'login_screen.dart';

class PropertyDetailScreen extends StatefulWidget {
  const PropertyDetailScreen({
    super.key,
    required this.propertyId,
    this.category = '',
  });

  final String propertyId;
  final String category;

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  Map<String, dynamic>? _property;
  bool _loading = true;
  int _imageIndex = 0;
  bool _liked = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final api = context.read<ApiClient>();
      dynamic data;
      if (widget.propertyId.isNotEmpty) {
        data = await api.get('/properties/${widget.propertyId}');
      } else {
        final list = await api.get('/properties', query: {
          if (widget.category.isNotEmpty) 'category': widget.category,
          'limit': 1,
        });
        final items = (list is Map && list['items'] != null)
            ? list['items'] as List
            : list as List;
        data = items.first;
      }
      if (!mounted) return;
      setState(() => _property = Map<String, dynamic>.from(data));

      // مزامنة حالة المفضلة من الخادم
      if (api.isAuthenticated) {
        try {
          final favs = await api.get('/favorites');
          if (!mounted || favs is! List) return;
          final id = _property?['id']?.toString();
          setState(() {
            _liked = favs.any(
              (f) => ((f as Map)['property'] as Map?)?['id']?.toString() == id,
            );
          });
        } catch (_) {}
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  /// إضافة/إزالة المفضلة عبر الخادم (مع تراجع عند الفشل)
  Future<void> _toggleFavorite() async {
    final api = context.read<ApiClient>();
    if (!api.isAuthenticated) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    final id = _property?['id']?.toString();
    if (id == null) return;
    final next = !_liked;
    setState(() => _liked = next);
    try {
      if (next) {
        await api.post('/favorites', {'propertyId': id});
      } else {
        await api.delete('/favorites/$id');
      }
    } catch (_) {
      if (mounted) setState(() => _liked = !next);
    }
  }

  /// نسخ رابط العقار للمشاركة
  Future<void> _shareLink() async {
    final slug = _property?['slug']?.toString() ?? _property?['id']?.toString() ?? '';
    const webBase = String.fromEnvironment(
      'WEB_URL',
      defaultValue: 'http://localhost:3000',
    );
    await Clipboard.setData(ClipboardData(text: '$webBase/property/$slug'));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم نسخ رابط العقار')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = _property;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkPage : AppColors.page,
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : p == null
              ? AppEmpty(
                  icon: Icons.error_outline_rounded,
                  title: 'تعذر تحميل العقار',
                  actionLabel: 'إعادة المحاولة',
                  onAction: _load,
                )
              : Stack(
                  children: [
                    CustomScrollView(
                      slivers: [
                        _gallerySliver(p),
                        SliverToBoxAdapter(child: _content(p)),
                      ],
                    ),
                    _topBar(),
                    _bottomBar(p),
                  ],
                ),
    );
  }

  // ────────────── المعرض ──────────────
  Widget _gallerySliver(Map<String, dynamic> p) {
    final images = (p['images'] as List?)?.cast<dynamic>() ?? [];
    return SliverToBoxAdapter(
      child: Stack(
        children: [
          SizedBox(
            height: 268,
            child: images.isEmpty
                ? Container(color: AppColors.mintSoft)
                : PageView.builder(
                    itemCount: images.length,
                    onPageChanged: (i) => setState(() => _imageIndex = i),
                    itemBuilder: (_, i) => AppImage(
                      url: images[i].toString(),
                      fit: BoxFit.cover,
                    ),
                  ),
          ),
          // عدّاد الصور
          if (images.isNotEmpty)
            Positioned(
              bottom: AppSpace.md,
              left: AppSpace.md,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.55),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
                child: Text(
                  '${_imageIndex + 1} / ${images.length}',
                  style: const TextStyle(
                    fontFamily: AppText.body,
                    fontSize: 11.5,
                    height: 1.3,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          // مؤشرات
          if (images.length > 1)
            Positioned(
              bottom: AppSpace.md + 6,
              right: AppSpace.md,
              child: Row(
                children: List.generate(
                  images.length,
                  (i) => AnimatedContainer(
                    duration: AppMotion.standard,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    width: i == _imageIndex ? 16 : 5,
                    height: 5,
                    decoration: BoxDecoration(
                      color: i == _imageIndex
                          ? Colors.white
                          : Colors.white.withOpacity(0.45),
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ────────────── الشريط العلوي ──────────────
  Widget _topBar() {
    return Positioned(
      top: MediaQuery.of(context).padding.top + AppSpace.xs,
      right: AppSpace.md,
      left: AppSpace.md,
      child: Row(
        children: [
          // زر الرجوع (يمين)
          AppIconButton(
            icon: Icons.arrow_forward_rounded,
            onPressed: () => Navigator.pop(context),
            background: Colors.white.withOpacity(0.92),
            foreground: AppColors.text,
          ),
          const Spacer(),
          // مفضلة + مشاركة (يسار)
          AppIconButton(
            icon: _liked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
            onPressed: _toggleFavorite,
            background: Colors.white.withOpacity(0.92),
            foreground: _liked ? AppColors.forest : AppColors.text,
          ),
          const SizedBox(width: AppSpace.xs),
          AppIconButton(
            icon: Icons.ios_share_rounded,
            onPressed: _shareLink,
            background: Colors.white.withOpacity(0.92),
            foreground: AppColors.text,
          ),
        ],
      ),
    );
  }

  // ────────────── المحتوى ──────────────
  Widget _content(Map<String, dynamic> p) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final city = p['city'] as Map<String, dynamic>?;
    final category = p['category']?.toString() ?? '';
    final currency = p['currency']?.toString() ?? 'IQD';
    final reviews = (p['reviews'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final roomTypes = (p['roomTypes'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final amenities = (p['amenities'] as List?)?.cast<String>() ?? [];

    final specs = [
      AppSpec('نوع العقار', AppLabels.categoryLabels[category] ?? category),
      AppSpec('عدد الغرف', '${(p['bedrooms'] as num?)?.toInt() ?? 0}'),
      AppSpec(
        'عدد الضيوف',
        '${(p['maxGuests'] as num?)?.toInt() ?? 0}',
      ),
      AppSpec(
        'المساحة',
        '${(p['areaSqm'] as num?)?.toInt() ?? 0} م²',
      ),
      AppSpec('سنة البناء', '2023'),
      AppSpec('نوع الحجز', p['isInstantBook'] == true ? 'فوري' : 'بموافقة'),
    ];

    return Padding(
      padding: const EdgeInsets.only(bottom: 130),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: AppSpace.md),

          // ────── السعر + العملة ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                AppPriceRow(
                  amount: (p['pricePerNight'] as num?) ?? 0,
                  currency: currency,
                  size: AppPriceSize.large,
                ),
                const SizedBox(width: AppSpace.xs),
                Text('لليلة', style: AppText.bodySmall),
                const Spacer(),
                if (p['negotiable'] == true)
                  const AppPill(
                    label: 'قابل للتفاوض',
                    tone: AppPillTone.lime,
                    size: 11,
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.xs),

          // ────── الشارات ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: Row(
              children: [
                AppPill(
                  label: AppLabels.categoryLabels[category] ?? category,
                  tone: AppPillTone.forest,
                  size: 11.5,
                ),
                const SizedBox(width: AppSpace.xs),
                if (p['isInstantBook'] == true)
                  const AppPill(
                    label: 'حجز فوري',
                    tone: AppPillTone.lime,
                    size: 11.5,
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.sm),

          // ────── العنوان ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: Text(
              p['title']?.toString() ?? '',
              style: AppText.h1.copyWith(
                fontSize: 21,
                color: isDark ? AppColors.darkText : AppColors.text,
              ),
            ),
          ),
          const SizedBox(height: 4),

          // ────── الموقع ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: Row(
              children: [
                Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
                ),
                const SizedBox(width: 3),
                Expanded(
                  child: Text(
                    '${city?['nameAr'] ?? 'العراق'} — ${city?['nameEn'] ?? ''}',
                    style: AppText.bodySmall,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.md),

          // ────── جدول المواصفات ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: AppSpecsTable(specs: specs),
          ),
          const SizedBox(height: AppSpace.md),

          // ────── صف البيانات ──────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
            child: Row(
              children: [
                _meta(Icons.visibility_outlined, '${(p['viewsCount'] as num?)?.toInt() ?? 0} مشاهدة'),
                const SizedBox(width: AppSpace.md),
                _meta(Icons.bed_outlined, '${reviews.length} تقييم'),
                const Spacer(),
                Text(
                  'آخر تحديث: اليوم',
                  style: AppText.labelFaint,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.lg),

          // ────── الموقع على الخريطة ──────
          _mapSection(p, isDark),
          const SizedBox(height: AppSpace.lg),

          // ────── الوصف ──────
          if (p['summary'] != null)
            _section(
              'الوصف',
              isDark,
              Text(
                p['summary'].toString(),
                style: AppText.bodyLarge.copyWith(
                  fontSize: 14,
                  color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
                ),
              ),
            ),

          // ────── المرافق ──────
          if (amenities.isNotEmpty) ...[
            _section('المرافق والخدمات', isDark, _amenities(amenities, isDark)),
          ],

          // ────── الغرف ──────
          if (roomTypes.isNotEmpty) ...[
            _section('أنواع الغرف', isDark, _rooms(roomTypes, currency, isDark)),
          ],

          // ────── التقييمات ──────
          if (reviews.isNotEmpty) ...[
            _section(
              'التقييمات',
              isDark,
              _reviews(reviews, p, isDark),
            ),
          ],

          // ────── المزوّد ──────
          _section('معلومات المزود', isDark, _vendor(p, isDark)),
        ],
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
        ),
        const SizedBox(width: 4),
        Text(text, style: AppText.bodySmall),
      ],
    );
  }

  Widget _section(String title, bool isDark, Widget child) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpace.md,
            AppSpace.md,
            AppSpace.md,
            AppSpace.sm,
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 26,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkForest : AppColors.forest,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: AppSpace.xs),
              Text(title, style: AppText.h3),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
          child: child,
        ),
      ],
    );
  }

  Widget _amenities(List<String> amenities, bool isDark) {
    return Wrap(
      spacing: AppSpace.xs,
      runSpacing: AppSpace.xs,
      children: amenities
          .map(
            (a) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
                borderRadius: BorderRadius.circular(AppRadius.pill),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.check_rounded,
                    size: 13,
                    color: isDark ? AppColors.darkForest : AppColors.forest,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    AppLabels.amenityLabels[a] ?? a,
                    style: AppText.bodySmall.copyWith(
                      fontSize: 12,
                      color: isDark ? AppColors.darkText : AppColors.text,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _rooms(
    List<Map<String, dynamic>> rooms,
    String currency,
    bool isDark,
  ) {
    return Column(
      children: rooms.map((r) {
        final images = (r['images'] as List?)?.cast<dynamic>() ?? [];
        return Container(
          margin: const EdgeInsets.only(bottom: AppSpace.sm),
          padding: const EdgeInsets.all(AppSpace.sm),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
          child: Row(
            children: [
              if (images.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                  child: SizedBox(
                    width: 74,
                    height: 74,
                    child: AppImage(url: images.first.toString()),
                  ),
                ),
              const SizedBox(width: AppSpace.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r['name']?.toString() ?? '',
                      style: AppText.h4.copyWith(fontSize: 14),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${r['bedType'] ?? ''} · حتى ${r['maxGuests'] ?? 0} ضيوف'
                      '${r['breakfastIncluded'] == true ? ' · شامل الإفطار' : ''}',
                      style: AppText.labelFaint,
                    ),
                    const SizedBox(height: 6),
                    AppPriceRow(
                      amount: (r['pricePerNight'] as num?) ?? 0,
                      currency: r['currency']?.toString() ?? currency,
                      size: AppPriceSize.small,
                      suffix: '/ ليلة',
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _reviews(
    List<Map<String, dynamic>> reviews,
    Map<String, dynamic> p,
    bool isDark,
  ) {
    final rating = (p['ratingAvg'] as num?)?.toDouble() ?? 0;
    final count = (p['ratingCount'] as num?)?.toInt() ?? reviews.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpace.md),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Text(
                    rating.toStringAsFixed(1),
                    style: AppText.h1.copyWith(
                      fontSize: 30,
                      color: isDark ? AppColors.darkForest : AppColors.forest,
                    ),
                  ),
                  AppStars(rating: rating, size: 12),
                  const SizedBox(height: 3),
                  Text('$count تقييم', style: AppText.labelFaint),
                ],
              ),
              const SizedBox(width: AppSpace.md),
              const Expanded(
                child: AppRatingBars(
                  ratings: {5: 72, 4: 18, 3: 6, 2: 2, 1: 2},
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.sm),
        ...reviews.take(4).map(
              (r) => Container(
                margin: const EdgeInsets.only(bottom: AppSpace.sm),
                padding: const EdgeInsets.all(AppSpace.sm),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          alignment: Alignment.center,
                          decoration: const BoxDecoration(
                            color: AppColors.mint,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            (r['customer']?['fullName']?.toString() ?? 'ع')
                                .substring(0, 1),
                            style: AppText.h4.copyWith(
                              color: AppColors.forest,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpace.xs),
                        Expanded(
                          child: Text(
                            r['customer']?['fullName']?.toString() ?? 'عميل',
                            style: AppText.h4.copyWith(fontSize: 13),
                          ),
                        ),
                        AppStars(
                          rating: (r['rating'] as num?)?.toDouble() ?? 0,
                          size: 12,
                        ),
                      ],
                    ),
                    if (r['comment'] != null) ...[
                      const SizedBox(height: AppSpace.xs),
                      Text(
                        r['comment'].toString(),
                        style: AppText.bodySmall.copyWith(height: 1.6),
                      ),
                    ],
                  ],
                ),
              ),
            ),
      ],
    );
  }

  Widget _vendor(Map<String, dynamic> p, bool isDark) {
    final vendor = p['vendor'] as Map<String, dynamic>?;
    final name = vendor?['companyName']?.toString() ?? 'مزوّد خدمات';

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpace.sm),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  color: AppColors.mint,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  name.substring(0, 1),
                  style: AppText.h3.copyWith(color: AppColors.forest),
                ),
              ),
              const SizedBox(width: AppSpace.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: AppText.h4.copyWith(fontSize: 14)),
                    const SizedBox(height: 2),
                    Text('صاحب مزرعة معتمد', style: AppText.labelFaint),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_left_rounded,
                color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.sm),
        AppButton(
          label: 'محادثة فورية',
          icon: Icons.chat_bubble_outline_rounded,
          onPressed: () {
            final phone = (vendor?['phone']?.toString() ?? '')
                .replaceAll(RegExp(r'[^0-9]'), '');
            if (phone.isEmpty) return;
            launchUrl(
              Uri.parse('https://wa.me/$phone'),
              mode: LaunchMode.externalApplication,
            );
          },
        ),
        const SizedBox(height: AppSpace.xs),
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: 'اتصل',
                icon: Icons.call_outlined,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  final phone = vendor?['phone']?.toString() ?? '';
                  if (phone.isEmpty) return;
                  launchUrl(Uri.parse('tel:$phone'));
                },
              ),
            ),
            const SizedBox(width: AppSpace.xs),
            Expanded(
              child: AppButton(
                label: 'رقم الواتساب',
                icon: Icons.wechat_rounded,
                variant: AppButtonVariant.soft,
                onPressed: () {
                  final phone = (vendor?['phone']?.toString() ?? '')
                      .replaceAll(RegExp(r'[^0-9]'), '');
                  if (phone.isEmpty) return;
                  launchUrl(
                    Uri.parse('https://wa.me/$phone'),
                    mode: LaunchMode.externalApplication,
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _mapSection(Map<String, dynamic> p, bool isDark) {
    final lat = (p['latitude'] as num?)?.toDouble() ?? 33.3152;
    final lng = (p['longitude'] as num?)?.toDouble() ?? 44.3661;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpace.md,
            AppSpace.md,
            AppSpace.md,
            AppSpace.sm,
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 26,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkForest : AppColors.forest,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: AppSpace.xs),
              Text('الموقع على الخريطة', style: AppText.h3),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
          child: Column(
            children: [
              Container(
                height: 150,
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Stack(
                  children: [
                    CustomPaint(
                      size: Size.infinite,
                      painter: _MapPatternPainter(isDark: isDark),
                    ),
                    Center(
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkForest : AppColors.forest,
                          shape: BoxShape.circle,
                          boxShadow: AppShadow.e2,
                        ),
                        child: const Icon(
                          Icons.home_rounded,
                          color: Colors.white,
                          size: 17,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpace.xs),
              Container(
                height: 46,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.fullscreen_rounded,
                      size: 17,
                      color: isDark ? AppColors.darkForest : AppColors.forest,
                    ),
                    const SizedBox(width: AppSpace.xs),
                    Text(
                      'العرض على الخريطة',
                      style: AppText.h4.copyWith(
                        fontSize: 13.5,
                        color: isDark ? AppColors.darkForest : AppColors.forest,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'الإحداثيات: ${lat.toStringAsFixed(3)}, ${lng.toStringAsFixed(3)}',
                style: AppText.labelFaint,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ────────────── الشريط السفلي ──────────────
  Widget _bottomBar(Map<String, dynamic> p) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = context.watch<ApiClient>();

    return Positioned(
      bottom: 0,
      right: 0,
      left: 0,
      child: Container(
        padding: EdgeInsets.fromLTRB(
          AppSpace.md,
          AppSpace.sm,
          AppSpace.md,
          MediaQuery.of(context).padding.bottom + AppSpace.sm,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
        ),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                AppPriceRow(
                  amount: (p['pricePerNight'] as num?) ?? 0,
                  currency: p['currency']?.toString() ?? 'IQD',
                  size: AppPriceSize.large,
                ),
                Text('لليلة', style: AppText.labelFaint),
              ],
            ),
            const SizedBox(width: AppSpace.md),
            Expanded(
              child: AppButton(
                label: 'احجز الآن',
                trailingIcon: Icons.arrow_back_rounded,
                onPressed: () {
                  if (!auth.isAuthenticated) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                    return;
                  }
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookingScreen(
                        propertyId: p['id'].toString(),
                        propertyTitle: p['title']?.toString() ?? '',
                        pricePerNight: (p['pricePerNight'] as num?) ?? 0,
                        currency: p['currency']?.toString() ?? 'IQD',
                        checkIn: DateTime.now().add(const Duration(days: 1)),
                        checkOut: DateTime.now().add(const Duration(days: 3)),
                        guests: 2,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// نمط خريطة بسيط (بديل بصري)
class _MapPatternPainter extends CustomPainter {
  _MapPatternPainter({required this.isDark});

  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final road = isDark ? AppColors.darkBorder : const Color(0xFFE4E9E6);
    final block = isDark ? AppColors.darkSurfaceAlt : const Color(0xFFEFF3F1);
    final p = Paint()..color = block;

    for (double y = 0; y < size.height; y += 26) {
      for (double x = 0; x < size.width; x += 38) {
        final offset = (y ~/ 26).isOdd ? 18.0 : 0.0;
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(x + offset, y, 28, 16),
            const Radius.circular(3),
          ),
          p,
        );
      }
    }

    final rp = Paint()
      ..color = road
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(0, size.height * 0.32),
      Offset(size.width, size.height * 0.62),
      rp,
    );
    canvas.drawLine(
      Offset(size.width * 0.72, 0),
      Offset(size.width * 0.34, size.height),
      rp,
    );
  }

  @override
  bool shouldRepaint(covariant _MapPatternPainter oldDelegate) =>
      oldDelegate.isDark != isDark;
}
