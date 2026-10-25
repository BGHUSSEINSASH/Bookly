import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

enum AppPillTone { forest, lime, amber, teal, neutral, glass, danger, mint }

/// شارة صغيرة — زوايا هادئة بدل الحبوب
class AppPill extends StatelessWidget {
  const AppPill({
    super.key,
    required this.label,
    this.icon,
    this.tone = AppPillTone.forest,
    this.size = 12,
    this.dense = false,
  });

  final String label;
  final IconData? icon;
  final AppPillTone tone;
  final double size;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    late Color bg;
    late Color fg;
    switch (tone) {
      case AppPillTone.forest:
        bg = isDark ? AppColors.darkForest : AppColors.forest;
        fg = isDark ? AppColors.darkPage : Colors.white;
        break;
      case AppPillTone.lime:
        bg = AppColors.lime;
        fg = AppColors.forestDeep;
        break;
      case AppPillTone.amber:
        bg = AppColors.amber;
        fg = AppColors.amberText;
        break;
      case AppPillTone.teal:
        bg = AppColors.mint;
        fg = AppColors.forest;
        break;
      case AppPillTone.neutral:
        bg = isDark ? AppColors.darkSurfaceAlt : AppColors.surfaceAlt;
        fg = isDark ? AppColors.darkTextSoft : AppColors.textSoft;
        break;
      case AppPillTone.glass:
        bg = const Color(0xB00A2E26);
        fg = Colors.white;
        break;
      case AppPillTone.danger:
        bg = const Color(0xFFFDECEA);
        fg = AppColors.danger;
        break;
      case AppPillTone.mint:
        bg = isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft;
        fg = isDark ? AppColors.darkForest : AppColors.forest;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: dense ? 7 : 9,
        vertical: dense ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.xs),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: size + 2, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontFamily: AppText.body,
              fontSize: size,
              height: 1.3,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}

/// تاق الفئة/المزوّد — صنوبري باهت
class AppTag extends StatelessWidget {
  const AppTag({super.key, required this.label, this.icon});

  final String label;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tone = isDark ? AppColors.darkForest : AppColors.forest;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
        borderRadius: BorderRadius.circular(AppRadius.xs),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: tone),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontFamily: AppText.body,
              fontSize: 11,
              height: 1.3,
              fontWeight: FontWeight.w500,
              color: tone,
            ),
          ),
        ],
      ),
    );
  }
}

/// شريحة اختيار (فئات، خيارات)
class AppChip extends StatelessWidget {
  const AppChip({
    super.key,
    required this.label,
    required this.selected,
    this.onTap,
    this.icon,
    this.count,
  });

  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final IconData? icon;
  final int? count;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedFg = isDark ? AppColors.darkPage : Colors.white;
    return Material(
      color: selected
          ? (isDark ? AppColors.darkForest : AppColors.forest)
          : (isDark ? AppColors.darkSurface : Colors.white),
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.sm),
            border: Border.all(
              color: selected
                  ? Colors.transparent
                  : (isDark ? AppColors.darkBorder : AppColors.border),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 15,
                  color: selected
                      ? selectedFg
                      : (isDark ? AppColors.darkTextSoft : AppColors.textSoft),
                ),
                const SizedBox(width: 5),
              ],
              Text(
                label,
                style: AppText.bodySmall.copyWith(
                  color: selected
                      ? selectedFg
                      : (isDark ? AppColors.darkText : AppColors.text),
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
              if (count != null) ...[
                const SizedBox(width: 5),
                Text(
                  '($count)',
                  style: AppText.labelFaint.copyWith(
                    color: selected
                        ? selectedFg.withOpacity(0.75)
                        : AppColors.textFaint,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
