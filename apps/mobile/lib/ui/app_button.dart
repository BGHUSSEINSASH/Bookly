import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

enum AppButtonVariant { primary, lime, outline, soft, ghost, danger, white }

/// زر موحّد لكل الحالات — الأساسي تركوازي، والتمييز ليموني.
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.trailingIcon,
    this.variant = AppButtonVariant.primary,
    this.loading = false,
    this.expand = true,
    this.height = 50,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final IconData? trailingIcon;
  final AppButtonVariant variant;
  final bool loading;
  final bool expand;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final enabled = onPressed != null && !loading;

    late Color bg;
    late Color fg;
    Border? border;

    switch (variant) {
      case AppButtonVariant.primary:
        bg = AppColors.forest;
        fg = Colors.white;
        break;
      case AppButtonVariant.lime:
        bg = AppColors.lime;
        fg = AppColors.forestDeep;
        break;
      case AppButtonVariant.outline:
        bg = Colors.transparent;
        fg = isDark ? AppColors.darkText : AppColors.text;
        border = Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
          width: 1,
        );
        break;
      case AppButtonVariant.soft:
        bg = isDark ? AppColors.darkSurfaceAlt : AppColors.mint;
        fg = isDark ? AppColors.darkForest : AppColors.forest;
        break;
      case AppButtonVariant.ghost:
        bg = Colors.transparent;
        fg = isDark ? AppColors.darkText : AppColors.text;
        break;
      case AppButtonVariant.danger:
        bg = isDark ? AppColors.darkSurfaceAlt : const Color(0xFFFDECEA);
        fg = AppColors.danger;
        break;
      case AppButtonVariant.white:
        bg = Colors.white;
        fg = AppColors.forestDark;
        break;
    }

    final child = Row(
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading)
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.2,
              valueColor: AlwaysStoppedAnimation(fg),
            ),
          )
        else if (icon != null)
          Icon(icon, size: 19, color: fg),
        if (icon != null || loading) const SizedBox(width: AppSpace.xs),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: AppText.h4.copyWith(color: fg),
          ),
        ),
        if (trailingIcon != null) ...[
          const SizedBox(width: AppSpace.xxs),
          Icon(trailingIcon, size: 18, color: fg),
        ],
      ],
    );

    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            height: height,
            width: expand ? double.infinity : null,
            padding: EdgeInsets.symmetric(horizontal: expand ? 16 : 22),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: border,
            ),
            child: Center(child: child),
          ),
        ),
      ),
    );
  }
}

/// زر دائري صغير (أيقونة)
class AppIconButton extends StatelessWidget {
  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.size = 42,
    this.iconSize = 20,
    this.background,
    this.foreground,
    this.badge,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final double size;
  final double iconSize;
  final Color? background;
  final Color? foreground;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Material(
          color: background ??
              (isDark ? AppColors.darkSurfaceAlt : Colors.white),
          shape: const CircleBorder(),
          child: InkWell(
            onTap: onPressed,
            customBorder: const CircleBorder(),
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: foreground ??
                    (isDark ? AppColors.darkText : AppColors.text),
              ),
            ),
          ),
        ),
        if (badge != null)
          Positioned(
            right: -2,
            top: -2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: AppColors.forest,
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: isDark ? AppColors.darkPage : AppColors.page,
                  width: 1.5,
                ),
              ),
              child: Text(
                badge!,
                style: const TextStyle(
                  fontFamily: AppText.body,
                  fontSize: 9,
                  height: 1.3,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
