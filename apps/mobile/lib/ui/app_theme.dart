import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// ثيم Bookly — فاتح وداكن
class AppTheme {
  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.forest,
      brightness: brightness,
    ).copyWith(
      primary: isDark ? AppColors.darkForest : AppColors.forest,
      onPrimary: isDark ? AppColors.darkPage : Colors.white,
      surface: isDark ? AppColors.darkSurface : AppColors.surface,
      onSurface: isDark ? AppColors.darkText : AppColors.text,
      outline: isDark ? AppColors.darkBorder : AppColors.borderStrong,
      error: AppColors.danger,
    );

    final textColor = isDark ? AppColors.darkText : AppColors.text;
    final textSoft = isDark ? AppColors.darkTextSoft : AppColors.textSoft;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: isDark ? AppColors.darkPage : AppColors.page,
      canvasColor: isDark ? AppColors.darkPage : AppColors.page,
      fontFamily: AppText.body,
      splashFactory: InkSparkle.splashFactory,
      visualDensity: VisualDensity.standard,
      textTheme: TextTheme(
        displayLarge: AppText.displayLarge.copyWith(color: textColor),
        headlineLarge: AppText.h1.copyWith(color: textColor),
        headlineMedium: AppText.h2.copyWith(color: textColor),
        headlineSmall: AppText.h3.copyWith(color: textColor),
        titleLarge: AppText.h4.copyWith(color: textColor),
        bodyLarge: AppText.bodyLarge.copyWith(color: textColor),
        bodyMedium: AppText.bodyMedium.copyWith(color: textSoft),
        bodySmall: AppText.bodySmall.copyWith(color: textSoft),
        labelLarge: AppText.label.copyWith(color: textSoft),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: isDark ? AppColors.darkPage : AppColors.page,
        surfaceTintColor: Colors.transparent,
        foregroundColor: textColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: AppText.h3.copyWith(color: textColor),
        systemOverlayStyle: isDark
            ? SystemUiOverlayStyle.light
            : SystemUiOverlayStyle.dark,
      ),
      cardTheme: CardTheme(
        color: isDark ? AppColors.darkSurface : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: isDark ? AppColors.darkBorder : AppColors.border,
        thickness: 1,
        space: 1,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.darkSurfaceAlt : AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: AppText.bodyMedium.copyWith(color: textSoft),
        labelStyle: AppText.bodySmall.copyWith(color: textSoft),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.forest, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.danger, width: 1.6),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.forest,
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 50),
          padding: const EdgeInsets.symmetric(horizontal: 22),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          textStyle: AppText.h4.copyWith(color: Colors.white),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: isDark ? AppColors.darkForest : AppColors.forest,
          minimumSize: const Size(0, 48),
          side: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          textStyle: AppText.h4.copyWith(
            color: isDark ? AppColors.darkForest : AppColors.forest,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: isDark ? AppColors.darkForest : AppColors.forest,
          textStyle: AppText.h4.copyWith(
            color: isDark ? AppColors.darkForest : AppColors.forest,
          ),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: isDark ? AppColors.darkSurfaceAlt : AppColors.surface,
        side: BorderSide(
          color: isDark ? AppColors.darkBorder : AppColors.borderStrong,
        ),
        labelStyle: AppText.bodySmall.copyWith(color: textColor),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: isDark ? AppColors.darkSurface : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.sheet),
          ),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: isDark ? AppColors.darkSurface : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: Colors.transparent,
        height: 66,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 23,
            color: states.contains(WidgetState.selected)
                ? AppColors.clay
                : textSoft,
          ),
        ),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => AppText.label.copyWith(
            fontSize: 11,
            color: states.contains(WidgetState.selected)
                ? AppColors.clay
                : textSoft,
            fontWeight: states.contains(WidgetState.selected)
                ? FontWeight.w600
                : FontWeight.w400,
          ),
        ),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: isDark ? AppColors.darkForest : AppColors.forest,
        inactiveTrackColor: isDark ? AppColors.darkBorder : AppColors.mintDeep,
        thumbColor: isDark ? AppColors.darkForest : AppColors.forest,
        trackHeight: 4,
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? Colors.white
              : (isDark ? AppColors.darkTextSoft : Colors.white),
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected)
              ? (isDark ? AppColors.darkForest : AppColors.forest)
              : (isDark ? AppColors.darkBorder : AppColors.borderStrong),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: isDark ? AppColors.darkSurfaceAlt : AppColors.forestDark,
        contentTextStyle: AppText.bodyMedium.copyWith(color: Colors.white),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: isDark ? AppColors.darkForest : AppColors.forest,
        linearTrackColor: isDark ? AppColors.darkBorder : AppColors.mintDeep,
      ),
    );
  }
}
