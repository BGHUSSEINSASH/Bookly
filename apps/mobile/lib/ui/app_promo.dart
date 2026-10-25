import 'package:flutter/material.dart';
import 'app_button.dart';
import 'app_colors.dart';
import 'app_image.dart';
import 'app_pill.dart';
import 'app_text.dart';

/// دائرة فئة — أيقونة داخل دائرة نعناعية + تسمية أسفلها.
class AppCircleCategory extends StatelessWidget {
  const AppCircleCategory({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
    this.selected = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = selected
        ? (isDark ? AppColors.darkForest : AppColors.forest)
        : (isDark ? AppColors.darkSurfaceAlt : AppColors.mint);
    final fg = selected
        ? (isDark ? AppColors.darkPage : Colors.white)
        : (isDark ? AppColors.darkForest : AppColors.forest);

    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: AppMotion.standard,
            curve: AppMotion.curve,
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: bg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 25, color: fg),
          ),
          const SizedBox(height: 7),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppText.bodySmall.copyWith(
              fontSize: 11.5,
              color: isDark ? AppColors.darkText : AppColors.text,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

/// بانر متحرك مع مؤشرات نقاط (النشطة شريط مطوّل)
class AppBannerCarousel extends StatefulWidget {
  const AppBannerCarousel({
    super.key,
    required this.banners,
    required this.onTap,
  });

  final List<Map<String, dynamic>> banners;
  final void Function(Map<String, dynamic>) onTap;

  @override
  State<AppBannerCarousel> createState() => _AppBannerCarouselState();
}

class _AppBannerCarouselState extends State<AppBannerCarousel> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: 156,
          child: PageView.builder(
            itemCount: widget.banners.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) {
              final b = widget.banners[i];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 2),
                child: _BannerCard(
                  banner: b,
                  onTap: () => widget.onTap(b),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpace.xs),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.banners.length, (i) {
            final active = i == _index;
            return AnimatedContainer(
              duration: AppMotion.standard,
              curve: AppMotion.curve,
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: active ? 20 : 6,
              height: 4,
              decoration: BoxDecoration(
                color: active
                    ? AppColors.clay
                    : (Theme.of(context).brightness == Brightness.dark
                        ? AppColors.darkBorder
                        : AppColors.borderStrong),
                borderRadius: BorderRadius.circular(2),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _BannerCard extends StatelessWidget {
  const _BannerCard({required this.banner, required this.onTap});

  final Map<String, dynamic> banner;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      borderRadius: BorderRadius.circular(AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              banner['imageUrl']?.toString() ?? '',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: isDark ? AppColors.darkSurfaceAlt : AppColors.mint,
              ),
            ),
            // تعتيم من اليمين (RTL) لقراءة النص
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerRight,
                  end: Alignment.centerLeft,
                  colors: [
                    (isDark ? AppColors.forestDeep : AppColors.forestDark)
                        .withOpacity(0.9),
                    (isDark ? AppColors.forestDeep : AppColors.forestDark)
                        .withOpacity(0.25),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpace.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    banner['title']?.toString() ?? '',
                    maxLines: 2,
                    style: AppText.h2.copyWith(
                      color: Colors.white,
                      fontSize: 18,
                    ),
                  ),
                  if (banner['subtitle'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      banner['subtitle'].toString(),
                      maxLines: 2,
                      style: AppText.bodySmall.copyWith(
                        color: Colors.white.withOpacity(0.82),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// بانر ترويجي تركوازي — شارة ليمونية، نقاط بعلامات ليمونية، زر ليموني.
class AppPromoCard extends StatelessWidget {
  const AppPromoCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.points,
    required this.ctaLabel,
    required this.onCta,
    this.badge = 'مجاناً بالكامل',
    this.imageUrl,
    this.whiteCta = false,
  });

  final String title;
  final String subtitle;
  final List<String> points;
  final String ctaLabel;
  final VoidCallback onCta;
  final String badge;
  final String? imageUrl;
  final bool whiteCta;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpace.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceAlt : AppColors.forest,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          if (imageUrl != null)
            Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: 150,
              child: Opacity(
                opacity: 0.22,
                child: AppImage(url: imageUrl, fit: BoxFit.cover),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(AppSpace.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (badge.isNotEmpty)
                  Align(
                    alignment: Alignment.centerRight,
                    child: AppPill(
                      label: badge,
                      icon: Icons.verified_outlined,
                      tone: AppPillTone.lime,
                      size: 10.5,
                      dense: true,
                    ),
                  ),
                const SizedBox(height: AppSpace.sm),
                Text(
                  title,
                  style: AppText.h2.copyWith(color: Colors.white, fontSize: 19),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: AppText.bodySmall.copyWith(
                    color: Colors.white.withOpacity(0.72),
                  ),
                ),
                const SizedBox(height: AppSpace.sm),
                for (final p in points)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.check_rounded,
                          size: 16,
                          color: AppColors.lime,
                        ),
                        const SizedBox(width: 7),
                        Expanded(
                          child: Text(
                            p,
                            style: AppText.bodySmall.copyWith(
                              color: Colors.white.withOpacity(0.88),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: AppSpace.sm),
                Align(
                  alignment: Alignment.centerRight,
                  child: AppButton(
                    label: ctaLabel,
                    icon: Icons.arrow_back_rounded,
                    variant: whiteCta
                        ? AppButtonVariant.white
                        : AppButtonVariant.lime,
                    expand: false,
                    height: 44,
                    onPressed: onCta,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
