import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'app_colors.dart';

/// هيكل تحميل متلألئ
class AppShimmer extends StatelessWidget {
  const AppShimmer({
    super.key,
    this.width,
    this.height = 16,
    this.radius = AppRadius.sm,
    this.shape = BoxShape.rectangle,
  });

  final double? width;
  final double height;
  final double radius;
  final BoxShape shape;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? AppColors.darkSurfaceAlt : AppColors.border,
      highlightColor: isDark ? AppColors.darkBorder : AppColors.surface,
      period: const Duration(milliseconds: 1400),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: shape == BoxShape.circle
              ? null
              : BorderRadius.circular(radius),
          shape: shape,
        ),
      ),
    );
  }
}

/// بطاقة هيكل كاملة (صورة + أسطر)
class AppSkeletonCard extends StatelessWidget {
  const AppSkeletonCard({super.key, this.height = 300, this.width});

  final double height;
  final double? width;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Expanded(child: AppShimmer(radius: 0)),
          Padding(
            padding: const EdgeInsets.all(AppSpace.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                AppShimmer(width: 120, height: 18),
                SizedBox(height: AppSpace.sm),
                AppShimmer(height: 12),
                SizedBox(height: AppSpace.xs),
                AppShimmer(width: 180, height: 12),
                SizedBox(height: AppSpace.md),
                Row(
                  children: [
                    Flexible(
                      child: AppShimmer(height: 14),
                    ),
                    SizedBox(width: AppSpace.sm),
                    Flexible(
                      flex: 2,
                      child: AppShimmer(height: 14),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// هيكل قائمة (أسطر)
class AppSkeletonList extends StatelessWidget {
  const AppSkeletonList({super.key, this.count = 6, this.itemHeight = 84});

  final int count;
  final double itemHeight;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        count,
        (i) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpace.sm),
          child: Container(
            height: itemHeight,
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            padding: const EdgeInsets.all(AppSpace.sm),
            child: const Row(
              children: [
                AppShimmer(width: 64, height: 64, radius: AppRadius.sm),
                SizedBox(width: AppSpace.sm),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppShimmer(height: 14),
                      SizedBox(height: AppSpace.xs),
                      AppShimmer(height: 11),
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
