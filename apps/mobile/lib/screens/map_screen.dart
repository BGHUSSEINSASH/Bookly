import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../core/api_client.dart';
import '../core/format.dart';
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
  bool _locationLoading = false;
  bool _showSearchHere = false;
  Map<String, dynamic>? _selectedProperty;

  static const _baghdad = LatLng(33.3152, 44.3661);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _showSearchHere = false; });
    try {
      final bounds = _map.camera.visibleBounds;
      final data = await context.read<ApiClient>().get('/properties/map', query: {
        'ne_lat': bounds.northEast.latitude.toString(),
        'ne_lng': bounds.northEast.longitude.toString(),
        'sw_lat': bounds.southWest.latitude.toString(),
        'sw_lng': bounds.southWest.longitude.toString(),
        'zoom': _map.camera.zoom.toStringAsFixed(0),
        if (_category.isNotEmpty) 'category': _category,
      });
      if (!mounted) return;
      final items = data is List ? data : (data?['items'] as List? ?? []);
      setState(() => _properties = items.cast());
    } catch (_) {
      try {
        final data = await context.read<ApiClient>().get('/properties', query: {
          'limit': 60,
          if (_category.isNotEmpty) 'category': _category,
        });
        if (!mounted) return;
        final items = (data is Map && data['items'] != null)
            ? (data['items'] as List)
            : (data as List? ?? []);
        setState(() => _properties = items.cast());
      } catch (_) {
        if (mounted) setState(() => _properties = []);
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _goToMyLocation() async {
    setState(() => _locationLoading = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) _showSnack('الرجاء تفعيل خدمة الموقع');
        return;
      }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) _showSnack('تم رفض صلاحية الموقع');
          return;
        }
      }
      if (permission == LocationPermission.deniedForever) {
        if (mounted) _showSnack('صلاحية الموقع محظورة — افتح الإعدادات');
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      _map.move(LatLng(pos.latitude, pos.longitude), 13);
      setState(() => _showSearchHere = true);
    } catch (_) {
      if (mounted) _showSnack('تعذّر تحديد الموقع');
    } finally {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _showPropertySheet(Map<String, dynamic> p) async {
    setState(() => _selectedProperty = p);
    await showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _PropertyBottomSheet(
        property: p,
        onViewDetails: () {
          Navigator.pop(context);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => PropertyDetailScreen(propertyId: p['id'].toString()),
            ),
          );
        },
      ),
    );
    if (mounted) setState(() => _selectedProperty = null);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            mapController: _map,
            options: MapOptions(
              initialCenter: _baghdad,
              initialZoom: 11,
              onPositionChanged: (_, __) {
                if (!_showSearchHere && !_loading) {
                  setState(() => _showSearchHere = true);
                }
              },
              onTap: (_, __) {
                if (_selectedProperty != null) setState(() => _selectedProperty = null);
              },
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
                    .map((p) => Marker(
                          point: LatLng(
                            (p['latitude'] as num).toDouble(),
                            (p['longitude'] as num).toDouble(),
                          ),
                          width: 80,
                          height: 36,
                          child: GestureDetector(
                            onTap: () => _showPropertySheet(p),
                            child: _PricePin(
                              price: (p['price'] as num?) ?? (p['pricePerNight'] as num?) ?? 0,
                              selected: _selectedProperty?['id'] == p['id'],
                              isDark: isDark,
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ],
          ),

          if (_style == MapStyle.satellite)
            IgnorePointer(child: Container(color: AppColors.forest.withOpacity(0.15))),

          // ── Header ──
          Positioned(
            top: MediaQuery.of(context).padding.top + AppSpace.xs,
            right: AppSpace.md,
            left: AppSpace.md,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white).withOpacity(0.97),
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
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white).withOpacity(0.97),
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

          // ── Tools ──
          Positioned(
            top: 200,
            right: AppSpace.md,
            child: Container(
              decoration: BoxDecoration(
                color: (isDark ? AppColors.darkSurface : Colors.white).withOpacity(0.97),
                borderRadius: BorderRadius.circular(AppRadius.md),
                boxShadow: AppShadow.e3,
              ),
              child: Column(
                children: [
                  _tool(Icons.add_rounded, 'تكبير', () => _map.move(_map.camera.center, _map.camera.zoom + 1)),
                  _divider(isDark),
                  _tool(Icons.remove_rounded, 'تصغير', () => _map.move(_map.camera.center, _map.camera.zoom - 1)),
                  _divider(isDark),
                  _locationLoading
                      ? const SizedBox(width: 44, height: 44, child: Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))))
                      : _tool(Icons.my_location_rounded, 'موقعي', _goToMyLocation),
                  _divider(isDark),
                  _tool(Icons.layers_outlined, 'الطبقات', _showMapStyle),
                ],
              ),
            ),
          ),

          // ── Search Here button ──
          if (_showSearchHere && !_loading)
            Positioned(
              top: 210,
              left: 0, right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _load,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkForest : AppColors.forest,
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      boxShadow: AppShadow.e3,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.search_rounded, color: Colors.white, size: 16),
                        const SizedBox(width: 6),
                        Text('ابحث في هذه المنطقة', style: AppText.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          if (_loading) const Positioned(bottom: 80, left: 0, right: 0, child: Center(child: CircularProgressIndicator())),

          if (!_loading && _properties.isNotEmpty)
            Positioned(
              bottom: AppSpace.xl, left: AppSpace.md, right: AppSpace.md,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpace.md, vertical: AppSpace.xs),
                  decoration: BoxDecoration(
                    color: (isDark ? AppColors.darkSurface : Colors.white).withOpacity(0.97),
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    boxShadow: AppShadow.e2,
                  ),
                  child: Text('${_properties.length} عقار على الخريطة',
                      style: AppText.bodySmall.copyWith(fontWeight: FontWeight.w600, color: isDark ? AppColors.darkText : AppColors.text)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _divider(bool isDark) => Container(height: 1, width: 40, color: isDark ? AppColors.darkBorder : AppColors.border);

  Widget _seg(String label, String value, bool active) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: GestureDetector(
        onTap: () { setState(() => _category = value); _load(); },
        child: AnimatedContainer(
          duration: AppMotion.standard,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mint) : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Text(label, textAlign: TextAlign.center,
            style: AppText.h4.copyWith(fontSize: 14, color: active ? (isDark ? AppColors.darkForest : AppColors.forest) : (isDark ? AppColors.darkTextSoft : AppColors.textSoft))),
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
        onTap: () { setState(() => _category = value); _load(); },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? (isDark ? AppColors.darkForest : AppColors.forest) : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Text(label, style: AppText.bodySmall.copyWith(
            color: active ? (isDark ? AppColors.darkPage : Colors.white) : (isDark ? AppColors.darkText : AppColors.text),
            fontWeight: active ? FontWeight.w600 : FontWeight.w400)),
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
        child: SizedBox(width: 44, height: 44, child: Icon(icon, size: 19, color: isDark ? AppColors.darkText : AppColors.text)),
      ),
    );
  }

  Future<void> _showMapStyle() async {
    await showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(AppSpace.lg, 0, AppSpace.lg, AppSpace.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const AppSheetTitle(title: 'نمط الخريطة'),
              const SizedBox(height: AppSpace.xs),
              _styleOption(ctx, MapStyle.standard, 'الخريطة', Icons.map_outlined),
              const SizedBox(height: AppSpace.xs),
              _styleOption(ctx, MapStyle.satellite, 'القمر الصناعي', Icons.satellite_alt_outlined),
            ],
          ),
        ),
      ),
    );
  }

  Widget _styleOption(BuildContext ctx, MapStyle value, String label, IconData icon) {
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    final active = _style == value;
    return Material(
      color: active ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft) : (isDark ? AppColors.darkSurface : Colors.white),
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        onTap: () { setState(() => _style = value); Navigator.pop(ctx); },
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.all(AppSpace.sm),
          child: Row(
            children: [
              Icon(icon, size: 20, color: active ? (isDark ? AppColors.darkForest : AppColors.forest) : (isDark ? AppColors.darkTextSoft : AppColors.textSoft)),
              const SizedBox(width: AppSpace.sm),
              Expanded(child: Text(label, style: AppText.h4.copyWith(fontSize: 14, color: isDark ? AppColors.darkText : AppColors.text))),
              if (active) Icon(Icons.check_circle_rounded, size: 20, color: isDark ? AppColors.darkForest : AppColors.forest),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────── Property Bottom Sheet ───────────────────────────────

class _PropertyBottomSheet extends StatelessWidget {
  final Map<String, dynamic> property;
  final VoidCallback onViewDetails;
  const _PropertyBottomSheet({required this.property, required this.onViewDetails});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final price = (property['price'] as num?) ?? (property['pricePerNight'] as num?) ?? 0;
    final currency = property['currency'] ?? 'IQD';
    final thumbnail = property['thumbnail']?.toString() ?? (property['images'] is List && (property['images'] as List).isNotEmpty ? (property['images'] as List).first.toString() : null);
    final rating = (property['rating'] as num?) ?? (property['ratingAvg'] as num?) ?? 0;
    final instantBook = property['instantBook'] == true || property['isInstantBook'] == true;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(top: 12, bottom: 16),
            decoration: BoxDecoration(color: isDark ? AppColors.darkBorder : AppColors.border, borderRadius: BorderRadius.circular(2)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 100, height: 80,
                    child: thumbnail != null
                        ? CachedNetworkImage(imageUrl: thumbnail, fit: BoxFit.cover, errorWidget: (_, __, ___) => Container(color: AppColors.mint, child: const Icon(Icons.home)))
                        : Container(color: AppColors.mint, child: const Icon(Icons.home, size: 32)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(child: Text(property['title']?.toString() ?? '', style: AppText.h4.copyWith(color: isDark ? AppColors.darkText : AppColors.text), maxLines: 2, overflow: TextOverflow.ellipsis)),
                        if (instantBook) Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(8)),
                          child: Text('فوري', style: AppText.bodySmall.copyWith(color: Colors.green.shade700, fontSize: 10)),
                        ),
                      ]),
                      const SizedBox(height: 4),
                      if (rating > 0) Row(children: [
                        const Icon(Icons.star_rounded, size: 14, color: AppColors.star),
                        const SizedBox(width: 2),
                        Text(rating.toStringAsFixed(1), style: AppText.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                      ]),
                      const SizedBox(height: 6),
                      Text('${formatAmount(price.toDouble())} $currency / ليلة',
                          style: AppText.h4.copyWith(color: AppColors.forest, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).padding.bottom + 12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onViewDetails,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.forest,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('عرض التفاصيل', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────── Price Pin ───────────────────────────────

class _PricePin extends StatelessWidget {
  const _PricePin({required this.price, required this.selected, required this.isDark});
  final num price;
  final bool selected;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final bg = selected ? Colors.white : (isDark ? AppColors.darkForest : AppColors.forest);
    final fg = selected ? (isDark ? AppColors.darkForest : AppColors.forest) : Colors.white;
    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: selected ? (isDark ? AppColors.darkForest : AppColors.forest) : Colors.white, width: 2),
        boxShadow: selected ? AppShadow.e3 : AppShadow.e2,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      alignment: Alignment.center,
      child: Text(
        price >= 1000000 ? '${(price / 1000000).toStringAsFixed(1)}M'
            : price >= 1000 ? '${(price / 1000).toStringAsFixed(0)}K'
            : price.toStringAsFixed(0),
        style: TextStyle(fontFamily: AppText.body, fontSize: 11, height: 1.2, fontWeight: FontWeight.w700, color: fg),
      ),
    );
  }
}