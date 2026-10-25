import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_pill.dart';
import 'app_text.dart';

/// صورة مع تدرّج بديل وانتقال ناعم
class AppImage extends StatelessWidget {
  const AppImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.radius = 0,
    this.fallbackIcon = Icons.photo_outlined,
  });

  final String? url;
  final BoxFit fit;
  final double? width;
  final double? height;
  final double radius;
  final IconData fallbackIcon;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget placeholder = Container(
      color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
      alignment: Alignment.center,
      child: Icon(
        fallbackIcon,
        size: 26,
        color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
      ),
    );

    if (url == null || url!.isEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: SizedBox(width: width, height: height, child: placeholder),
      );
    }

    if (url!.startsWith('assets/')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Image.asset(
          url!,
          fit: fit,
          width: width,
          height: height,
          errorBuilder: (_, __, ___) =>
              SizedBox(width: width, height: height, child: placeholder),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: CachedNetworkImage(
        imageUrl: url!,
        fit: fit,
        width: width,
        height: height,
        fadeInDuration: AppMotion.standard,
        placeholder: (_, __) => SizedBox(
          width: width,
          height: height,
          child: placeholder,
        ),
        errorWidget: (_, __, ___) =>
            SizedBox(width: width, height: height, child: placeholder),
      ),
    );
  }
}

/// عدّاد الصور (مثل «5») فوق الصورة
class AppImageCounter extends StatelessWidget {
  const AppImageCounter({super.key, required this.count, this.hasVideo = false});

  final int count;
  final bool hasVideo;

  @override
  Widget build(BuildContext context) {
    return AppPill(
      label: '$count',
      icon: hasVideo ? Icons.play_arrow_rounded : Icons.photo_library_outlined,
      tone: AppPillTone.glass,
      size: 11,
      dense: true,
    );
  }
}

/// نجوم التقييم
class AppStars extends StatelessWidget {
  const AppStars({super.key, required this.rating, this.size = 14});

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
          half ? Icons.star_half_rounded : (filled ? Icons.star_rounded : Icons.star_outline_rounded),
          size: size,
          color: AppColors.star,
        );
      }),
    );
  }
}

/// شارة التقييم فوق الصورة
class AppRatingBadge extends StatelessWidget {
  const AppRatingBadge({super.key, required this.rating});

  final double rating;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xs),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, size: 12, color: AppColors.star),
          const SizedBox(width: 2),
          Text(
            rating.toStringAsFixed(1),
            style: const TextStyle(
              fontFamily: AppText.body,
              fontSize: 11,
              height: 1.3,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
