import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/format.dart';
import '../../ui/app_colors.dart';
import '../../ui/app_text.dart';

/// بطاقة عقار (مزرعة / فندق / شاليه)
class PropertyCard extends StatelessWidget {
  const PropertyCard({super.key, required this.property, this.onTap});

  final Map<String, dynamic> property;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final images = (property['images'] as List?)?.cast<dynamic>() ?? [];
    final imageUrl = images.isNotEmpty ? images.first.toString() : null;
    final city = property['city'] as Map<String, dynamic>?;
    final rating = (property['ratingAvg'] as num?)?.toDouble() ?? 0;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 16 / 10,
              child: imageUrl == null
                  ? Container(color: AppColors.border)
                  : CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.border),
                      errorWidget: (_, __, ___) =>
                          Container(color: AppColors.border),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.mint,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          AppLabels.categoryLabels[property['category']] ??
                              property['category'].toString(),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.forestDark,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.star, size: 15, color: AppColors.star),
                      const SizedBox(width: 3),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    property['title'].toString(),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.text,
                      height: 1.4,
                    ),
                  ),
                  if (city != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      city['nameAr'].toString(),
                      style: const TextStyle(fontSize: 12, color: AppColors.textSoft),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatMoney(
                          (property['pricePerNight'] as num?) ?? 0,
                          property['currency']?.toString() ?? 'IQD',
                        ),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.forest,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          '/ ليلة',
                          style: const TextStyle(fontSize: 11, color: AppColors.textSoft),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// شريط النجوم
class RatingStars extends StatelessWidget {
  const RatingStars({super.key, required this.rating, this.size = 14});

  final double rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final filled = rating >= i + 1;
        final half = !filled && rating > i && rating < i + 1;
        return Icon(
          half ? Icons.star_half : (filled ? Icons.star : Icons.star_border),
          size: size,
          color: AppColors.star,
        );
      }),
    );
  }
}

/// حالة فارغة موحّدة
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: AppColors.textFaint),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.text,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSoft),
              ),
            ],
            if (action != null) ...[const SizedBox(height: 16), action!],
          ],
        ),
      ),
    );
  }
}

/// صف معلومة (أيقونة + نص)
class InfoRow extends StatelessWidget {
  const InfoRow({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSoft),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 13, color: AppColors.textSoft)),
      ],
    );
  }
}

/// تنسيق التاريخ بالعربية
String arDate(DateTime? d) => DateFormat('d MMM yyyy', 'ar').format(d ?? DateTime.now());
