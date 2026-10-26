import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../ui/app_button.dart';
import '../ui/app_card.dart';
import '../ui/app_colors.dart';
import '../ui/app_image.dart';
import '../ui/app_pill.dart';
import '../ui/app_price.dart';
import '../ui/app_search_bar.dart';
import '../ui/app_text.dart';
import 'booking_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<Map<String, dynamic>> _trips = [];
  String _type = '';
  bool _loading = true;

  static const _types = {
    '': 'الكل',
    'MARINE': 'بحرية',
    'SAFARI': 'سفاري',
    'MOUNTAIN': 'جبلية',
    'HERITAGE': 'أثرية',
    'DESERT': 'صحراوية',
    'CITY': 'جولات مدينة',
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await context.read<ApiClient>().get(
            '/trips',
            query: {if (_type.isNotEmpty) 'type': _type, 'limit': 40},
          );
      if (!mounted) return;
      final items = (data is Map && data['items'] != null)
          ? (data['items'] as List)
          : (data as List);
      setState(() => _trips = items.cast());
    } catch (_) {
      if (mounted) setState(() => _trips = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('الرحلات'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          SizedBox(
            height: 46,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpace.md),
              children: _types.entries
                  .map(
                    (e) => Padding(
                      padding: const EdgeInsets.only(left: AppSpace.xs),
                      child: AppChip(
                        label: e.value,
                        selected: _type == e.key,
                        onTap: () {
                          setState(() => _type = e.key);
                          _load();
                        },
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: _trips.isEmpty && !_loading
                ? const AppEmpty(
                    icon: Icons.explore_outlined,
                    title: 'لا توجد رحلات',
                    subtitle: 'جرّب فئة أخرى',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpace.md,
                      AppSpace.md,
                      AppSpace.md,
                      AppSpace.xxl,
                    ),
                    itemCount: _trips.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppSpace.sm),
                    itemBuilder: (_, i) => InkWell(
                      onTap: () => _showTrip(_trips[i]),
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: _tripCard(_trips[i], isDark),
                    ),
                  ),
          ),
          ],
        ),
    );
  }

  // ────── تفاصيل الرحلة ──────
  Future<void> _showTrip(Map<String, dynamic> t) async {
    final images = (t['images'] as List?)?.cast<dynamic>() ?? [];
    final includes = (t['includes'] as List?)?.cast<String>() ?? [];
    final duration = (t['durationDays'] as num?)?.toInt() ?? 1;
    final minGuests = (t['minGuests'] as num?)?.toInt() ?? 1;

    await showAppSheet(
      context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AspectRatio(
                      aspectRatio: 16 / 9,
                      child: AppImage(
                        url: images.isNotEmpty ? images.first.toString() : null,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(AppSpace.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              AppPill(
                                label:
                                    AppLabels.tripTypes[t['type']?.toString() ?? ''] ??
                                        '',
                                tone: AppPillTone.teal,
                                size: 11,
                                dense: true,
                              ),
                              const SizedBox(width: AppSpace.xs),
                              AppPill(
                                label: '$duration يوم',
                                icon: Icons.schedule_rounded,
                                tone: AppPillTone.mint,
                                size: 11,
                                dense: true,
                              ),
                              const Spacer(),
                              if (((t['ratingAvg'] as num?) ?? 0) > 0) ...[
                                const Icon(
                                  Icons.star_rounded,
                                  size: 15,
                                  color: AppColors.star,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  (t['ratingAvg'] as num).toStringAsFixed(1),
                                  style: AppText.label.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: AppSpace.sm),
                          Text(
                            t['title']?.toString() ?? '',
                            style: AppText.h3,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            t['city']?['nameAr']?.toString() ?? '',
                            style: AppText.bodySmall,
                          ),
                          if ((t['summary']?.toString() ?? '').isNotEmpty) ...[
                            const SizedBox(height: AppSpace.sm),
                            Text(
                              t['summary'].toString(),
                              style: AppText.bodyMedium,
                            ),
                          ],
                          if (includes.isNotEmpty) ...[
                            const SizedBox(height: AppSpace.md),
                            Text('يشمل البرنامج', style: AppText.h4),
                            const SizedBox(height: AppSpace.xs),
                            ...includes.map(
                              (inc) => Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 3),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.check_rounded,
                                      size: 15,
                                      color: AppColors.forest,
                                    ),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        inc,
                                        style: AppText.bodySmall,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // ────── شريط الحجز ──────
            Container(
              padding: EdgeInsets.fromLTRB(
                AppSpace.lg,
                AppSpace.sm,
                AppSpace.lg,
                MediaQuery.of(ctx).padding.bottom + AppSpace.sm,
              ),
              decoration: BoxDecoration(
                color: Theme.of(ctx).brightness == Brightness.dark
                    ? AppColors.darkSurface
                    : Colors.white,
                border: Border(
                  top: BorderSide(
                    color: Theme.of(ctx).brightness == Brightness.dark
                        ? AppColors.darkBorder
                        : AppColors.border,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('للشخص الواحد', style: AppText.labelFaint),
                        AppPriceRow(
                          amount: (t['pricePerPerson'] as num?) ?? 0,
                          currency: t['currency']?.toString() ?? 'IQD',
                          size: AppPriceSize.medium,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    width: 190,
                    child: AppButton(
                      label: 'احجز الرحلة',
                      icon: Icons.confirmation_number_outlined,
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => BookingScreen(
                              target: 'TRIP',
                              propertyId: t['id'].toString(),
                              propertyTitle: t['title']?.toString() ?? 'رحلة',
                              pricePerNight: (t['pricePerPerson'] as num?) ?? 0,
                              currency: t['currency']?.toString() ?? 'IQD',
                              checkIn: DateTime.now()
                                  .add(const Duration(days: 1)),
                              checkOut: DateTime.now().add(
                                Duration(days: duration + 1),
                              ),
                              guests: minGuests > 1 ? minGuests : 1,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tripCard(Map<String, dynamic> t, bool isDark) {
    final images = (t['images'] as List?)?.cast<dynamic>() ?? [];
    final includes = (t['includes'] as List?)?.cast<String>() ?? [];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadow.e1,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AspectRatio(
            aspectRatio: 16 / 10,
            child: Stack(
              fit: StackFit.expand,
              children: [
                AppImage(
                  url: images.isNotEmpty ? images.first.toString() : null,
                ),
                Positioned(
                  top: AppSpace.xs,
                  right: AppSpace.xs,
                  child: AppPill(
                    label: AppLabels.tripTypes[t['type']?.toString() ?? ''] ?? '',
                    tone: AppPillTone.glass,
                    size: 11,
                    dense: true,
                  ),
                ),
                Positioned(
                  left: AppSpace.xs,
                  bottom: AppSpace.xs,
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
                  style: AppText.h4.copyWith(fontSize: 15),
                ),
                const SizedBox(height: 3),
                Text(
                  t['summary']?.toString() ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.bodySmall,
                ),
                if (includes.isNotEmpty) ...[
                  const SizedBox(height: AppSpace.sm),
                  Wrap(
                    spacing: AppSpace.xs,
                    runSpacing: 4,
                    children: includes
                        .take(4)
                        .map(
                          (inc) => Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_rounded,
                                size: 12,
                                color: isDark
                                    ? AppColors.darkForest
                                    : AppColors.forest,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                inc,
                                style: AppText.labelFaint.copyWith(
                                  fontSize: 10.5,
                                ),
                              ),
                            ],
                          ),
                        )
                        .toList(),
                  ),
                ],
                const SizedBox(height: AppSpace.sm),
                Row(
                  children: [
                    if (((t['ratingAvg'] as num?) ?? 0) > 0) ...[
                      const Icon(
                        Icons.star_rounded,
                        size: 14,
                        color: AppColors.star,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        (t['ratingAvg'] as num).toStringAsFixed(1),
                        style: AppText.label.copyWith(
                          color: isDark ? AppColors.darkText : AppColors.text,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: AppSpace.sm),
                    ],
                    Expanded(
                      child: Text(
                        t['city']?['nameAr']?.toString() ?? 'العراق',
                        style: AppText.labelFaint,
                      ),
                    ),
                    AppPriceRow(
                      amount: (t['pricePerPerson'] as num?) ?? 0,
                      currency: t['currency']?.toString() ?? 'IQD',
                      size: AppPriceSize.small,
                      suffix: '/ شخص',
                    ),
                  ],
                ),
                // عرض أقرب موعد وعدد المقاعد
                if (t['nextDeparture'] != null) ...[
                  const SizedBox(height: AppSpace.xs),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_outlined, size: 12, color: isDark ? AppColors.darkTextSoft : AppColors.textSoft),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(t['nextDeparture'].toString()),
                        style: AppText.labelFaint.copyWith(fontSize: 11),
                      ),
                      if ((t['seatsLeft'] as int?) != null && (t['seatsLeft'] as int) <= 5) ...[
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'آخر ${t['seatsLeft']} مقاعد',
                            style: AppText.labelFaint.copyWith(color: Colors.red.shade600, fontSize: 10),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String isoDate) {
    try {
      final d = DateTime.parse(isoDate);
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      return '${d.day} ${months[d.month - 1]}';
    } catch (_) {
      return '';
    }
  }
}
