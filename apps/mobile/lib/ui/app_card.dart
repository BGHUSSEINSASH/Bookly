import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// عنوان قسم — شريط عمودي تركوازي عند بداية العنوان + «اظهار الكل».
class AppSectionHeader extends StatelessWidget {
  const AppSectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.onSeeAll,
    this.seeAllLabel = 'اظهار الكل',
    this.padding = const EdgeInsets.fromLTRB(
      AppSpace.md,
      AppSpace.xl,
      AppSpace.md,
      AppSpace.sm,
    ),
  });

  final String title;
  final String? subtitle;
  final VoidCallback? onSeeAll;
  final String seeAllLabel;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? AppColors.darkText : AppColors.text;
    final subColor = isDark ? AppColors.darkTextSoft : AppColors.textSoft;

    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 3.5,
            height: 22,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkForest : AppColors.forest,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: AppSpace.xs),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppText.h2.copyWith(
                    fontSize: 18,
                    color: titleColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: AppText.bodySmall.copyWith(color: subColor),
                  ),
                ],
              ],
            ),
          ),
          if (onSeeAll != null)
            InkWell(
              onTap: onSeeAll,
              borderRadius: BorderRadius.circular(AppRadius.xs),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      seeAllLabel,
                      style: AppText.bodySmall.copyWith(
                        color: isDark
                            ? AppColors.darkForest
                            : AppColors.forest,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(
                      Icons.chevron_left_rounded,
                      size: 17,
                      color: isDark
                          ? AppColors.darkForest
                          : AppColors.forest,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// صف إحصاءات (3 أعمدة بفواصل) — كما في المرجع
class AppStatsRow extends StatelessWidget {
  const AppStatsRow({super.key, required this.stats});

  final List<AppStat> stats;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return IntrinsicHeight(
      child: Row(
        children: [
          for (var i = 0; i < stats.length; i++) ...[
            if (i > 0)
              Container(
                width: 1,
                margin: const EdgeInsets.symmetric(horizontal: AppSpace.xs),
                color: isDark ? AppColors.darkBorder : AppColors.border,
              ),
            Expanded(child: stats[i]),
          ],
        ],
      ),
    );
  }
}

class AppStat extends StatelessWidget {
  const AppStat({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: isDark ? AppColors.darkForest : AppColors.forest,
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: AppText.h4.copyWith(
            color: isDark ? AppColors.darkText : AppColors.text,
            fontFamily: AppText.body,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
        Text(
          label,
          style: AppText.labelFaint.copyWith(
            color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
          ),
        ),
      ],
    );
  }
}

/// حالة فارغة موحّدة
class AppEmpty extends StatelessWidget {
  const AppEmpty({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.compact = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: EdgeInsets.all(compact ? AppSpace.lg : AppSpace.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: compact ? 56 : 72,
              height: compact ? 56 : 72,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Icon(
                icon,
                size: compact ? 26 : 32,
                color: isDark ? AppColors.darkForest : AppColors.forest,
              ),
            ),
            SizedBox(height: compact ? AppSpace.sm : AppSpace.md),
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppText.h3.copyWith(
                color: isDark ? AppColors.darkText : AppColors.text,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: AppSpace.xxs),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: AppText.bodySmall.copyWith(
                  color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
                ),
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: AppSpace.md),
              OutlinedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: Text(actionLabel!),
                style: OutlinedButton.styleFrom(
                  foregroundColor:
                      isDark ? AppColors.darkForest : AppColors.forest,
                  side: BorderSide(
                    color: isDark ? AppColors.darkForest : AppColors.forest,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
