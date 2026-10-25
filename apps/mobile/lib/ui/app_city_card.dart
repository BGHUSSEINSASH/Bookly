import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_image.dart';
import 'app_text.dart';

/// بطاقة مدينة — صورة مربّعة باسمنا مركّعاً أعلى الصورة (يمين).
class AppCityCard extends StatelessWidget {
  const AppCityCard({
    super.key,
    required this.name,
    required this.imageUrl,
    this.count,
    this.onTap,
  });

  final String name;
  final String imageUrl;
  final int? count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 132,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: AspectRatio(
            aspectRatio: 1 / 1,
            child: Stack(
              fit: StackFit.expand,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  child: AppImage(url: imageUrl),
                ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withOpacity(0.05),
                        Colors.black.withOpacity(0.55),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  right: AppSpace.sm,
                  bottom: AppSpace.sm,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.h4.copyWith(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          shadows: const [
                            Shadow(
                              color: Color(0x66000000),
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                      if (count != null)
                        Text(
                          '$count مكان',
                          style: AppText.labelFaint.copyWith(
                            fontSize: 10,
                            color: Colors.white.withOpacity(0.85),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// صور المدن — ملفات محلية مقصوصة بنسبة 4:5 ومعدّلة لونيًا.
/// المفاتيح تطابق city.slug القادم من الـ API.
const Set<String> _citySlugs = {
  'baghdad',
  'basra',
  'erbil',
  'najaf',
  'karbala',
  'mosul',
  'doha',
  'dubai',
  'riyadh',
  'jeddah',
  'kuwait-city',
  'manama',
  'muscat',
  'amman',
  'cairo',
  'istanbul',
};

String cityImage(String slug) {
  final safe = _citySlugs.contains(slug) ? slug : 'baghdad';
  return 'assets/images/cities/$safe.jpg';
}
