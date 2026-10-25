import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// حامل بحث على شكل حبّة كاملة — أيقونة بحث يمين، أيقونة فرز يسار داخل الحبّة.
class AppSearchBar extends StatefulWidget {
  const AppSearchBar({
    super.key,
    this.hint = 'ابحث عن مزرعة، فندق، شاليه…',
    this.onChanged,
    this.onFilterTap,
    this.filterCount = 0,
    this.controller,
    this.readOnly = false,
    this.onTap,
  });

  final String hint;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onFilterTap;
  final int filterCount;
  final TextEditingController? controller;
  final bool readOnly;
  final VoidCallback? onTap;

  @override
  State<AppSearchBar> createState() => _AppSearchBarState();
}

class _AppSearchBarState extends State<AppSearchBar> {
  late final TextEditingController _controller =
      widget.controller ?? TextEditingController();
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final has = _controller.text.isNotEmpty;
      if (has != _hasText) setState(() => _hasText = has);
    });
  }

  @override
  void dispose() {
    if (widget.controller == null) _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.border,
        ),
        boxShadow: isDark ? null : AppShadow.e1,
      ),
      child: Row(
        children: [
          const SizedBox(width: AppSpace.md),
          Icon(
            Icons.search_rounded,
            size: 21,
            color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
          ),
          const SizedBox(width: AppSpace.xs),
          Expanded(
            child: widget.readOnly
                ? GestureDetector(
                    onTap: widget.onTap,
                    child: Text(
                      widget.hint,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.darkTextSoft
                            : AppColors.textFaint,
                      ),
                    ),
                  )
                : TextField(
                    controller: _controller,
                    onChanged: widget.onChanged,
                    style: AppText.bodyMedium.copyWith(
                      color: isDark ? AppColors.darkText : AppColors.text,
                    ),
                    decoration: InputDecoration(
                      hintText: widget.hint,
                      hintStyle: AppText.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.darkTextSoft
                            : AppColors.textFaint,
                      ),
                      isDense: true,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      filled: false,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
          ),
          if (_hasText)
            IconButton(
              onPressed: () => _controller.clear(),
              icon: const Icon(Icons.close_rounded, size: 17),
              color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
              visualDensity: VisualDensity.compact,
            ),
          if (widget.onFilterTap != null)
            _FilterIcon(
              onTap: widget.onFilterTap!,
              count: widget.filterCount,
            ),
          const SizedBox(width: AppSpace.sm),
        ],
      ),
    );
  }
}

class _FilterIcon extends StatelessWidget {
  const _FilterIcon({required this.onTap, required this.count});

  final VoidCallback onTap;
  final int count;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Padding(
        padding: const EdgeInsets.all(AppSpace.xs),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(
              Icons.tune_rounded,
              size: 21,
              color: isDark ? AppColors.darkText : AppColors.text,
            ),
            if (count > 0)
              Positioned(
                top: -3,
                left: -3,
                child: Container(
                  width: 15,
                  height: 15,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: AppColors.forest,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '$count',
                    style: const TextStyle(
                      fontFamily: AppText.body,
                      fontSize: 9,
                      height: 1.1,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// BottomSheet بمقبض سحب
Future<T?> showAppSheet<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  bool isScrollControlled = true,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: isScrollControlled,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withOpacity(0.45),
    builder: (ctx) => AppSheetShell(builder: builder),
  );
}

class AppSheetShell extends StatelessWidget {
  const AppSheetShell({super.key, required this.builder});

  final WidgetBuilder builder;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppRadius.sheet),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: AppSpace.xs),
          Container(
            width: 42,
            height: 4,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Flexible(child: builder(context)),
        ],
      ),
    );
  }
}

/// عنوان داخل الشيت
class AppSheetTitle extends StatelessWidget {
  const AppSheetTitle({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.lg,
        AppSpace.md,
        AppSpace.lg,
        AppSpace.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppText.h2.copyWith(
              color: isDark ? AppColors.darkText : AppColors.text,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle!,
              style: AppText.bodySmall.copyWith(
                color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
