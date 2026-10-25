import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../ui/app_button.dart';
import '../ui/app_card.dart';
import '../ui/app_colors.dart';
import '../ui/app_pill.dart';
import '../ui/app_price.dart';
import '../ui/app_property_card.dart';
import '../ui/app_search_bar.dart';
import '../ui/app_text.dart';
import 'property_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, this.initialCategory});

  final String? initialCategory;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  List<Map<String, dynamic>> _results = [];
  List<Map<String, dynamic>> _cities = [];
  bool _loading = true;
  String _category = '';
  String _cityId = '';
  String _sort = 'RELEVANCE';
  int _filterCount = 0;
  Set<String> _amenities = {};
  double _maxPrice = 0;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _category = widget.initialCategory ?? '';
    _loadCities();
    _search();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadCities() async {
    try {
      final data = await context.read<ApiClient>().get('/properties/cities');
      if (!mounted) return;
      setState(() => _cities = (data as List).cast());
    } catch (_) {}
  }

  Future<void> _search() async {
    setState(() => _loading = true);
    try {
      final data = await context.read<ApiClient>().get('/properties', query: {
        if (_controller.text.isNotEmpty) 'q': _controller.text,
        if (_category.isNotEmpty) 'category': _category,
        if (_cityId.isNotEmpty) 'cityId': _cityId,
        if (_amenities.isNotEmpty) 'amenities': _amenities.join(','),
        if (_maxPrice > 0) 'maxPrice': _maxPrice.round(),
        'sortBy': _sort,
        'limit': 40,
      });
      if (!mounted) return;
      final items = (data is Map && data['items'] != null)
          ? (data['items'] as List)
          : (data as List);
      setState(() => _results = items.cast());
    } catch (_) {
      if (mounted) setState(() => _results = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = _results.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('البحث'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            onPressed: _showSort,
            icon: const Icon(Icons.swap_vert_rounded, size: 20),
          ),
        ],
      ),
      body: Column(
        children: [
          // ────── البحث + الفلاتر ──────
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpace.md,
              AppSpace.xs,
              AppSpace.md,
              AppSpace.xs,
            ),
            child: AppSearchBar(
              controller: _controller,
              hint: 'ابحث عن مزرعة، فندق، رحلة…',
              onChanged: (_) {
                _debounce?.cancel();
                _debounce = Timer(const Duration(milliseconds: 400), _search);
              },
              filterCount: _filterCount,
              onFilterTap: _showFilters,
            ),
          ),

          // ────── شرائح الفئات ──────
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
              children: [
                _cat('الكل', ''),
                _cat('مزارع', 'FARM'),
                _cat('شاليهات', 'CHALET'),
                _cat('استراحات', 'REST'),
                _cat('فنادق', 'HOTEL'),
                _cat('شقق', 'APARTMENT'),
              ],
            ),
          ),

          // ────── عدد النتائج + شريحة المدينة ──────
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpace.md,
              AppSpace.xs,
              AppSpace.md,
              AppSpace.xs,
            ),
            child: Row(
              children: [
                Text(
                  '$total نتيجة',
                  style: AppText.bodySmall.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkText : AppColors.text,
                  ),
                ),
                const Spacer(),
                if (_cityId.isNotEmpty)
                  AppPill(
                    label: _cityName,
                    tone: AppPillTone.forest,
                    size: 11,
                  ),
              ],
            ),
          ),

          if (_loading) const LinearProgressIndicator(minHeight: 2),

          // ────── النتائج ──────
          Expanded(
            child: _results.isEmpty && !_loading
                ? AppEmpty(
                    icon: Icons.search_off_rounded,
                    title: 'لا توجد نتائج',
                    subtitle: 'جرّب تغيير الفئة أو المدينة أو الفلاتر',
                    actionLabel: 'إعادة البحث',
                    onAction: _search,
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpace.md,
                      0,
                      AppSpace.md,
                      AppSpace.xxl,
                    ),
                    itemCount: _results.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpace.sm),
                    itemBuilder: (_, i) => AppPropertyCard(
                      property: _results[i],
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PropertyDetailScreen(
                            propertyId: _results[i]['id'].toString(),
                          ),
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  String get _cityName {
    final c = _cities.where((x) => x['id'] == _cityId).firstOrNull;
    return c?['nameAr']?.toString() ?? '';
  }

  Widget _cat(String label, String value) {
    final active = _category == value;
    return Padding(
      padding: const EdgeInsets.only(left: AppSpace.xs),
      child: AppChip(
        label: label,
        selected: active,
        onTap: () {
          setState(() => _category = value);
          _search();
        },
      ),
    );
  }

  // ────── شيت الفلاتر ──────
  Future<void> _showFilters() async {
    var tempCity = _cityId;
    var tempAmenities = Set<String>.from(_amenities);
    var tempPrice = _maxPrice;

    await showAppSheet(
      context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AppSheetTitle(
                  title: 'الفلاتر',
                  subtitle: 'اختر ما يناسب رحلتك',
                ),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpace.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // ────── المدينة ──────
                        const AppSectionLabel(text: 'المدينة'),
                        Wrap(
                          spacing: AppSpace.xs,
                          runSpacing: AppSpace.xs,
                          children: [
                            AppChip(
                              label: 'الكل',
                              selected: tempCity == '',
                              onTap: () => setSheet(() => tempCity = ''),
                            ),
                            ..._cities.take(14).map(
                                  (c) => AppChip(
                                    label: c['nameAr']?.toString() ?? '',
                                    selected: tempCity == c['id'],
                                    onTap: () =>
                                        setSheet(() => tempCity = c['id'].toString()),
                                  ),
                                ),
                          ],
                        ),
                        const SizedBox(height: AppSpace.lg),

                        // ────── السعر ──────
                        const AppSectionLabel(text: 'السعر الأقصى للليلة'),
                        Slider(
                          value: tempPrice,
                          max: 500000,
                          divisions: 50,
                          label: tempPrice == 0
                              ? 'الكل'
                              : formatAmount(tempPrice.round()),
                          onChanged: (v) => setSheet(() => tempPrice = v),
                        ),
                        const SizedBox(height: AppSpace.sm),

                        // ────── المرافق ──────
                        const AppSectionLabel(text: 'المرافق'),
                        Wrap(
                          spacing: AppSpace.xs,
                          runSpacing: AppSpace.xs,
                          children: AppLabels.amenityLabels.entries
                              .take(10)
                              .map(
                                (e) => AppChip(
                                  label: e.value,
                                  selected: tempAmenities.contains(e.key),
                                  onTap: () => setSheet(() {
                                    if (tempAmenities.contains(e.key)) {
                                      tempAmenities.remove(e.key);
                                    } else {
                                      tempAmenities.add(e.key);
                                    }
                                  }),
                                ),
                              )
                              .toList(),
                        ),
                        const SizedBox(height: AppSpace.xl),
                      ],
                    ),
                  ),
                ),

                // ────── أزرار ──────
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpace.lg,
                    0,
                    AppSpace.lg,
                    AppSpace.lg,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: 'إعادة تعيين',
                          variant: AppButtonVariant.ghost,
                          onPressed: () {
                            setSheet(() {
                              tempCity = '';
                              tempAmenities = {};
                              tempPrice = 0;
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: AppSpace.xs),
                      Expanded(
                        flex: 2,
                        child: AppButton(
                          label: 'عرض النتائج',
                          onPressed: () {
                            Navigator.pop(ctx);
                            setState(() {
                              _cityId = tempCity;
                              _amenities = tempAmenities;
                              _maxPrice = tempPrice;
                              _filterCount =
                                  (tempCity.isNotEmpty ? 1 : 0) +
                                      tempAmenities.length +
                                      (tempPrice > 0 ? 1 : 0);
                            });
                            _search();
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ────── شيت الفرز ──────
  Future<void> _showSort() async {
    const options = {
      'RELEVANCE': 'الأكثر ملاءمة',
      'PRICE_ASC': 'السعر: من الأقل',
      'PRICE_DESC': 'السعر: من الأعلى',
      'RATING_DESC': 'الأعلى تقييمًا',
      'NEWEST': 'الأحدث',
      'POPULAR': 'الأكثر مشاهدة',
    };

    await showAppSheet(
      context,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const AppSheetTitle(title: 'الترتيب'),
              const SizedBox(height: AppSpace.xs),
              ...options.entries.map(
                (e) => InkWell(
                  onTap: () {
                    setState(() => _sort = e.key);
                    Navigator.pop(ctx);
                    _search();
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpace.lg,
                      vertical: AppSpace.sm,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            e.value,
                            style: AppText.h4.copyWith(
                              fontSize: 14,
                              color: isDark
                                  ? AppColors.darkText
                                  : AppColors.text,
                            ),
                          ),
                        ),
                        if (_sort == e.key)
                          Icon(
                            Icons.check_circle_rounded,
                            size: 20,
                            color: isDark
                                ? AppColors.darkForest
                                : AppColors.forest,
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpace.lg),
            ],
          ),
        );
      },
    );
  }
}

/// عنوان صغير داخل الشيت
class AppSectionLabel extends StatelessWidget {
  const AppSectionLabel({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.xs),
      child: Text(
        text,
        style: AppText.h4.copyWith(
          fontSize: 14,
          color: isDark ? AppColors.darkText : AppColors.text,
        ),
      ),
    );
  }
}
