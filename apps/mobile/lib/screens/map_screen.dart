import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../ui/app_colors.dart';
import '../ui/app_search_bar.dart';
import '../ui/app_text.dart';
import 'property_detail_screen.dart';

/// نمط الخريطة
enum MapStyle { standard, satellite }

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _map = MapController();
  List<Map<String, dynamic>> _properties = [];
  String _category = '';
  MapStyle _style = MapStyle.standard;
  bool _loading = true;

  static const _baghdad = LatLng(33.3152, 44.3661);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await context.read<ApiClient>().get('/properties', query: {
        'limit': 60,
        if (_category.isNotEmpty) 'category': _category,
      });
      if (!mounted) return;
      final items = (data is Map && data['items'] != null)
          ? (data['items'] as List)
          : (data as List);
      setState(() => _properties = items.cast());
    } catch (_) {
      if (mounted) setState(() => _properties = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // ────── الخريطة ──────
          FlutterMap(
            mapController: _map,
            options: MapOptions(
              initialCenter: _baghdad,
              initialZoom: 11,
              onTap: (_, __) {},
            ),
            children: [
              TileLayer(
                urlTemplate: _style == MapStyle.standard
                    ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                userAgentPackageName: 'app.bookly.bookly_app',
                errorTileCallback: (_, __, ___) {},
                tileProvider: NetworkTileProvider(),
              ),
              MarkerLayer(
                markers: _properties
                    .where((p) => p['latitude'] != null && p['longitude'] != null)
                    .map(
                      (p) => Marker(
                        point: LatLng(
                          (p['latitude'] as num).toDouble(),
                          (p['longitude'] as num).toDouble(),
                        ),
                        width: 44,
                        height: 44,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PropertyDetailScreen(
                                  propertyId: p['id'].toString(),
                                ),
                              ),
                            );
                          },
                          child: _Pin(
                            price: (p['pricePerNight'] as num?) ?? 0,
                            isDark: isDark,
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),

          // ────── وضع satellite: طبقة تعتيم خضراء ──────
          if (_style == MapStyle.satellite)
            IgnorePointer(
              child: Container(color: AppColors.forest.withOpacity(0.18)),
            ),

          // ────── الترويسة العلوية ──────
          Positioned(
            top: MediaQuery.of(context).padding.top + AppSpace.xs,
            right: AppSpace.md,
            left: AppSpace.md,
            child: Column(
              children: [
                // المبدّل (بيع/إيجار) → (مزارع/فنادق)
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white)
                        .withOpacity(0.96),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    boxShadow: AppShadow.e2,
                  ),
                  child: Row(
                    children: [
                      _seg('مزارع', 'FARM', _category != 'HOTEL'),
                      _seg('فنادق', 'HOTEL', _category == 'HOTEL'),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpace.xs),

                // شرائح الفئات
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white)
                        .withOpacity(0.96),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    boxShadow: AppShadow.e1,
                  ),
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    children: [
                      _cat('الكل', ''),
                      _cat('مزرعة', 'FARM'),
                      _cat('فندق', 'HOTEL'),
                      _cat('شاليه', 'CHALET'),
                      _cat('استراحة', 'REST'),
                      _cat('شقة', 'APARTMENT'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ────── لوحة الأدوات العائمة (يمين) ──────
          Positioned(
            top: 240,
            right: AppSpace.md,
            child: Container(
              decoration: BoxDecoration(
                color: (isDark ? AppColors.darkSurface : Colors.white)
                    .withOpacity(0.96),
                borderRadius: BorderRadius.circular(AppRadius.md),
                boxShadow: AppShadow.e3,
              ),
              child: Column(
                children: [
                  _tool(Icons.fullscreen_rounded, 'ملء الشاشة'),
                  _divider(isDark),
                  _tool(Icons.search_rounded, 'بحث'),
                  _divider(isDark),
                  _tool(Icons.add_rounded, 'تكبير', () {
                    _map.move(_map.camera.center, _map.camera.zoom + 1);
                  }),
                  _divider(isDark),
                  _tool(Icons.remove_rounded, 'تصغير', () {
                    _map.move(_map.camera.center, _map.camera.zoom - 1);
                  }),
                  _divider(isDark),
                  _tool(Icons.my_location_rounded, 'موقعي', () {
                    _map.move(_baghdad, 13);
                  }),
                  _divider(isDark),
                  _tool(Icons.layers_outlined, 'الطبقات', _showMapStyle),
                ],
              ),
            ),
          ),

          // ────── عدد النتائج ──────
          if (!_loading && _properties.isNotEmpty)
            Positioned(
              bottom: AppSpace.lg,
              left: AppSpace.md,
              right: AppSpace.md,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpace.md,
                    vertical: AppSpace.xs,
                  ),
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white)
                        .withOpacity(0.96),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    boxShadow: AppShadow.e2,
                  ),
                  child: Text(
                    '${_properties.length} نتيجة على الخريطة',
                    style: AppText.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkText : AppColors.text,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _divider(bool isDark) => Container(
        height: 1,
        width: 40,
        color: isDark ? AppColors.darkBorder : AppColors.border,
      );

  Widget _seg(String label, String value, bool active) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _category = value);
          _load();
        },
        child: AnimatedContainer(
          duration: AppMotion.standard,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active
                ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mint)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: AppText.h4.copyWith(
              fontSize: 14,
              color: active
                  ? (isDark ? AppColors.darkForest : AppColors.forest)
                  : (isDark ? AppColors.darkTextSoft : AppColors.textSoft),
            ),
          ),
        ),
      ),
    );
  }

  Widget _cat(String label, String value) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final active = _category == value;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 5),
      child: GestureDetector(
        onTap: () {
          setState(() => _category = value);
          _load();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active
                ? (isDark ? AppColors.darkForest : AppColors.forest)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Text(
            label,
            style: AppText.bodySmall.copyWith(
              color: active
                  ? (isDark ? AppColors.darkPage : Colors.white)
                  : (isDark ? AppColors.darkText : AppColors.text),
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }

  Widget _tool(IconData icon, String label, [VoidCallback? onTap]) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Tooltip(
      message: label,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(
            icon,
            size: 19,
            color: isDark ? AppColors.darkText : AppColors.text,
          ),
        ),
      ),
    );
  }

  Future<void> _showMapStyle() async {
    await showAppSheet(
      context,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpace.lg,
            0,
            AppSpace.lg,
            AppSpace.lg,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const AppSheetTitle(title: 'نمط الخريطة'),
              const SizedBox(height: AppSpace.xs),
              _styleOption(ctx, MapStyle.standard, 'الخريطة'),
              const SizedBox(height: AppSpace.xs),
              _styleOption(ctx, MapStyle.satellite, 'القمر الصناعي'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _styleOption(BuildContext ctx, MapStyle value, String label) {
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    final active = _style == value;
    return Material(
      color: active
          ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft)
          : (isDark ? AppColors.darkSurface : Colors.white),
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        onTap: () {
          setState(() => _style = value);
          Navigator.pop(ctx);
        },
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.all(AppSpace.sm),
          child: Row(
            children: [
              Icon(
                value == MapStyle.standard
                    ? Icons.map_outlined
                    : Icons.satellite_alt_outlined,
                size: 20,
                color: active
                    ? (isDark ? AppColors.darkForest : AppColors.forest)
                    : (isDark ? AppColors.darkTextSoft : AppColors.textSoft),
              ),
              const SizedBox(width: AppSpace.sm),
              Expanded(
                child: Text(
                  label,
                  style: AppText.h4.copyWith(
                    fontSize: 14,
                    color: isDark ? AppColors.darkText : AppColors.text,
                  ),
                ),
              ),
              if (active)
                Icon(
                  Icons.check_circle_rounded,
                  size: 20,
                  color: isDark ? AppColors.darkForest : AppColors.forest,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Pin extends StatelessWidget {
  const _Pin({required this.price, required this.isDark});

  final num price;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkForest : AppColors.forest,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: AppShadow.e2,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      alignment: Alignment.center,
      child: Text(
        price >= 1000000
            ? '${(price / 1000000).toStringAsFixed(1)}M'
            : '${(price / 1000).toStringAsFixed(0)}K',
        style: const TextStyle(
          fontFamily: AppText.body,
          fontSize: 11,
          height: 1.2,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}
