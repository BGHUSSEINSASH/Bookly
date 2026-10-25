import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// جدول مواصفات 2×3 بحدود خفيفة (كما في المرجع)
class AppSpecsTable extends StatelessWidget {
  const AppSpecsTable({super.key, required this.specs});

  final List<AppSpec> specs;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.border;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: borderColor),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          for (var row = 0; row < (specs.length / 2).ceil(); row++)
            Row(
              children: [
                for (var col = 0; col < 2; col++) ...[
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpace.sm,
                        vertical: AppSpace.sm,
                      ),
                      decoration: BoxDecoration(
                        border: Border(
                          top: row == 0 ? BorderSide.none : BorderSide(color: borderColor),
                          right: col == 0 ? BorderSide(color: borderColor) : BorderSide.none,
                        ),
                      ),
                      child: _specCell(
                        specs[row * 2 + col],
                        isDark,
                      ),
                    ),
                  ),
                ],
              ],
            ),
        ],
      ),
    );
  }

  Widget _specCell(AppSpec spec, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          spec.label,
          style: AppText.labelFaint.copyWith(
            color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          spec.value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: AppText.h4.copyWith(
            fontSize: 14,
            color: isDark ? AppColors.darkText : AppColors.text,
          ),
        ),
      ],
    );
  }
}

class AppSpec {
  const AppSpec(this.label, this.value);
  final String label;
  final String value;
}

/// مؤشّر خطوات الحجز
class AppStepper extends StatelessWidget {
  const AppStepper({super.key, required this.current, required this.steps});

  final int current;
  final List<String> steps;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          _dot(i, isDark),
          if (i < steps.length - 1)
            Expanded(
              child: Container(
                height: 2,
                margin: const EdgeInsets.symmetric(horizontal: 6),
                color: i < current
                    ? (isDark ? AppColors.darkForest : AppColors.forest)
                    : (isDark ? AppColors.darkBorder : AppColors.border),
              ),
            ),
        ],
      ],
    );
  }

  Widget _dot(int i, bool isDark) {
    final done = i < current;
    final active = i == current;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: AppMotion.standard,
          width: 26,
          height: 26,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: done || active
                ? (isDark ? AppColors.darkForest : AppColors.forest)
                : (isDark ? AppColors.darkSurfaceAlt : AppColors.surface),
            shape: BoxShape.circle,
            border: Border.all(
              color: done || active
                  ? Colors.transparent
                  : (isDark ? AppColors.darkBorder : AppColors.borderStrong),
            ),
          ),
          child: done
              ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
              : Text(
                  '${i + 1}',
                  style: AppText.labelFaint.copyWith(
                    fontSize: 11,
                    color: active ? Colors.white : AppColors.textFaint,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
        const SizedBox(height: 4),
        Text(
          steps[i],
          style: AppText.labelFaint.copyWith(
            fontSize: 10,
            color: active
                ? (isDark ? AppColors.darkForest : AppColors.forest)
                : (isDark ? AppColors.darkTextSoft : AppColors.textFaint),
            fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ],
    );
  }
}

/// عدّاد رقمي (ضيوف، غرف)
class AppCounter extends StatelessWidget {
  const AppCounter({
    super.key,
    required this.value,
    required this.onDecrement,
    required this.onIncrement,
    this.min = 1,
    this.max = 20,
  });

  final int value;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;
  final int min;
  final int max;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _btn(Icons.remove_rounded, value > min ? onDecrement : null, isDark),
          SizedBox(
            width: 36,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: AppText.h4.copyWith(
                color: isDark ? AppColors.darkText : AppColors.text,
              ),
            ),
          ),
          _btn(Icons.add_rounded, value < max ? onIncrement : null, isDark),
        ],
      ),
    );
  }

  Widget _btn(IconData icon, VoidCallback? onTap, bool isDark) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Padding(
        padding: const EdgeInsets.all(7),
        child: Icon(
          icon,
          size: 17,
          color: onTap == null
              ? (isDark ? AppColors.darkBorder : AppColors.border)
              : (isDark ? AppColors.darkForest : AppColors.forest),
        ),
      ),
    );
  }
}

/// شريط تقدّم النسب (لتقييمات المرجع)
class AppRatingBars extends StatelessWidget {
  const AppRatingBars({super.key, required this.ratings});

  final Map<int, double> ratings;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      children: [
        for (var star = 5; star >= 1; star--)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                SizedBox(
                  width: 34,
                  child: Row(
                    children: [
                      Text(
                        '$star',
                        style: AppText.labelFaint.copyWith(
                          color: isDark
                              ? AppColors.darkTextSoft
                              : AppColors.textSoft,
                        ),
                      ),
                      const SizedBox(width: 2),
                      const Icon(
                        Icons.star_rounded,
                        size: 11,
                        color: AppColors.star,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (ratings[star] ?? 0) / 100,
                      minHeight: 6,
                      backgroundColor: isDark
                          ? AppColors.darkBorder
                          : AppColors.border,
                      valueColor: AlwaysStoppedAnimation(
                        isDark ? AppColors.darkForest : AppColors.forest,
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  width: 34,
                  child: Text(
                    '${(ratings[star] ?? 0).round()}%',
                    textAlign: TextAlign.left,
                    style: AppText.labelFaint.copyWith(
                      color: isDark
                          ? AppColors.darkTextSoft
                          : AppColors.textFaint,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
