import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// شريط تنقل سفلي — التبويب النشط داخل قرص نعناعي بأيقونة تركوازية.
class AppTabBar extends StatelessWidget {
  const AppTabBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<AppTabItem> items;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.border,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              for (var i = 0; i < items.length; i++)
                Expanded(
                  child: _TabItem(
                    item: items[i],
                    selected: i == currentIndex,
                    onTap: () => onTap(i),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class AppTabItem {
  const AppTabItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

class _TabItem extends StatelessWidget {
  const _TabItem({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final AppTabItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = selected
        ? AppColors.forest
        : (isDark ? AppColors.darkTextSoft : AppColors.textSoft);

    return InkWell(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: AppMotion.standard,
            curve: AppMotion.curve,
            width: 48,
            height: 30,
            decoration: BoxDecoration(
              color: selected
                  ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mint)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Icon(
              selected ? item.activeIcon : item.icon,
              size: 20,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: AppText.labelFaint.copyWith(
                fontSize: 10.5,
                color: color,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
