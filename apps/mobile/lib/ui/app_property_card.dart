import 'package:flutter/material.dart';
import 'app_card.dart';
import 'app_colors.dart';
import 'app_image.dart';
import 'app_pill.dart';
import 'app_price.dart';
import 'app_text.dart';

/// بطاقة عقار بنمط شناشيل — صورة مع شارات، سعر تركوازي، وشريط مواصفات ثلاثي.
class AppPropertyCard extends StatelessWidget {
  const AppPropertyCard({
    super.key,
    required this.property,
    this.onTap,
    this.width,
  });

  final Map<String, dynamic> property;
  final VoidCallback? onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final images = (property['images'] as List?)?.cast<dynamic>() ?? [];
    final imageUrl = images.isNotEmpty ? images.first.toString() : null;
    final city = property['city'] as Map<String, dynamic>?;
    final category = property['category']?.toString() ?? '';
    final currency = property['currency']?.toString() ?? 'IQD';
    final price = (property['pricePerNight'] as num?) ?? 0;
    final hasVideo = property['hasVideo'] == true;

    final bedrooms = (property['bedrooms'] as num?)?.toInt() ?? 0;
    final bathrooms = (property['bathrooms'] as num?)?.toInt() ?? 0;
    final area = (property['areaSqm'] as num?)?.toInt() ?? 0;

    final specs = <AppStat>[
      if (bedrooms > 0)
        AppStat(
          icon: Icons.bed_outlined,
          value: '$bedrooms',
          label: 'غرف',
        ),
      if (bathrooms > 0)
        AppStat(
          icon: Icons.bathtub_outlined,
          value: '$bathrooms',
          label: 'حمام',
        ),
      if (area > 0)
        AppStat(
          icon: Icons.crop_square_rounded,
          value: '$area',
          label: 'م²',
        ),
    ];

    final border = isDark ? AppColors.darkBorder : AppColors.border;
    final radius = BorderRadius.circular(AppRadius.xl);

    return SizedBox(
      width: width,
      child: Material(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: radius,
        clipBehavior: Clip.antiAlias,
        elevation: 0,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AspectRatio(
                aspectRatio: 4 / 3,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    AppImage(url: imageUrl),
                    if (category.isNotEmpty)
                      Positioned(
                        top: AppSpace.sm,
                        right: AppSpace.sm,
                        child: AppPill(
                          label: AppLabels.categoryLabels[category] ??
                              category,
                          tone: AppPillTone.forest,
                          size: 11,
                          dense: true,
                        ),
                      ),
                    if (hasVideo)
                      const Positioned(
                        bottom: AppSpace.sm,
                        left: AppSpace.sm,
                        child: AppPill(
                          label: 'فيديو',
                          icon: Icons.play_arrow_rounded,
                          tone: AppPillTone.glass,
                          size: 10.5,
                          dense: true,
                        ),
                      )
                    else if (images.length > 1)
                      Positioned(
                        bottom: AppSpace.sm,
                        left: AppSpace.sm,
                        child: AppImageCounter(count: images.length),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpace.sm,
                  AppSpace.sm,
                  AppSpace.sm,
                  AppSpace.xs,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: AlignmentDirectional.centerStart,
                      child: AppPriceRow(
                        amount: price,
                        currency: currency,
                        size: AppPriceSize.medium,
                        suffix: '/ ليلة',
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (city != null)
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 13,
                            color: AppColors.textFaint,
                          ),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              city['nameAr']?.toString() ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppText.bodySmall.copyWith(
                                fontSize: 11.5,
                                color: AppColors.textSoft,
                              ),
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 4),
                    Text(
                      property['title']?.toString() ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.h4.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkText : AppColors.text,
                      ),
                    ),
                  ],
                ),
              ),
              if (specs.isNotEmpty) ...[
                Container(height: 1, color: border),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpace.xs,
                    vertical: AppSpace.xs,
                  ),
                  child: AppStatsRow(stats: specs),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// بطاقة أفقية مضغوطة (قوائم جانبية)
class AppPropertyCardMini extends StatelessWidget {
  const AppPropertyCardMini({
    super.key,
    required this.property,
    this.onTap,
    this.width = 190,
  });

  final Map<String, dynamic> property;
  final VoidCallback? onTap;
  final double width;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final images = (property['images'] as List?)?.cast<dynamic>() ?? [];
    final city = property['city'] as Map<String, dynamic>?;
    final category = property['category']?.toString() ?? '';

    return SizedBox(
      width: width,
      child: Material(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    AppImage(
                      url:
                          images.isNotEmpty ? images.first.toString() : null,
                    ),
                    if (category.isNotEmpty)
                      Positioned(
                        top: AppSpace.xs,
                        right: AppSpace.xs,
                        child: AppPill(
                          label: AppLabels.categoryLabels[category] ??
                              category,
                          tone: AppPillTone.forest,
                          size: 10,
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
                    AppPriceRow(
                      amount: (property['pricePerNight'] as num?) ?? 0,
                      currency: property['currency']?.toString() ?? 'IQD',
                      size: AppPriceSize.small,
                      suffix: '/ ليلة',
                    ),
                    const SizedBox(height: 3),
                    Text(
                      property['title']?.toString() ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.h4.copyWith(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkText : AppColors.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      city?['nameAr']?.toString() ?? '',
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
            ],
          ),
        ),
      ),
    );
  }
}
