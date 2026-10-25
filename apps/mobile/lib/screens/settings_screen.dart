import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import '../ui/app_colors.dart';
import '../ui/app_text.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _language = 'العربية';
  String _currency = 'الدينار العراقي (د.ع)';
  bool _notifications = true;
  bool _emailOffers = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final theme = context.watch<ThemeController>();

    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        padding: const EdgeInsets.only(bottom: AppSpace.xxl),
        children: [
          _label(context, 'التطبيق'),
          _row(
            context,
            Icons.language_rounded,
            'اللغة',
            _language,
            onTap: () => _choose(
              context,
              'اللغة',
              ['العربية', 'English'],
              _language,
              (v) => setState(() => _language = v),
            ),
          ),
          _row(
            context,
            Icons.attach_money_rounded,
            'العملة',
            _currency,
            onTap: () => _choose(
              context,
              'العملة',
              [
                'الدينار العراقي (د.ع)',
                'الريال السعودي (ر.س)',
                'الدرهم الإماراتي (د.إ)',
                'الدينار الكويتي (د.ك)',
                'الريال القطري (ر.ق)',
                'الدولار الأمريكي (\$)',
              ],
              _currency,
              (v) => setState(() => _currency = v),
            ),
          ),
          _row(
            context,
            Icons.notifications_none_rounded,
            'الإشعارات',
            'تفعيل إشعارات الحجوزات والعروض',
            trailing: Switch(
              value: _notifications,
              onChanged: (v) => setState(() => _notifications = v),
            ),
          ),
          _row(
            context,
            Icons.mail_outline_rounded,
            'العروض والبريد',
            'استقبل العروض الموسمية',
            trailing: Switch(
              value: _emailOffers,
              onChanged: (v) => setState(() => _emailOffers = v),
            ),
          ),

          _label(context, 'المظهر'),
          _row(
            context,
            theme.isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
            'الوضع الليلي',
            theme.isDark ? 'مُفعّل' : 'مُعطّل',
            trailing: Switch(
              value: theme.isDark,
              onChanged: (_) => theme.toggle(),
            ),
          ),

          _label(context, 'المساعدة'),
          _row(
            context,
            Icons.help_outline_rounded,
            'الأسئلة الشائعة',
            'إجابات سريعة',
          ),
          _row(
            context,
            Icons.shield_outlined,
            'سياسة الخصوصية',
            'بياناتك وحقوقك',
          ),

          const SizedBox(height: AppSpace.xl),
          Center(
            child: Text(
              'نسخة التطبيق: 1.0.0 (1)',
              style: AppText.bodySmall.copyWith(
                color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(BuildContext context, String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpace.md,
        AppSpace.lg,
        AppSpace.md,
        AppSpace.xs,
      ),
      child: Text(
        text,
        style: AppText.label.copyWith(
          color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _row(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle, {
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(
          AppSpace.md,
          0,
          AppSpace.md,
          AppSpace.xxs,
        ),
        padding: const EdgeInsets.symmetric(
          vertical: AppSpace.sm,
          horizontal: AppSpace.xs,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 20,
              color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
            ),
            const SizedBox(width: AppSpace.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppText.h4.copyWith(
                      fontSize: 14,
                      color: isDark ? AppColors.darkText : AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(subtitle, style: AppText.labelFaint),
                ],
              ),
            ),
            if (trailing != null) trailing,
            if (trailing == null)
              Icon(
                Icons.chevron_left_rounded,
                size: 20,
                color: isDark ? AppColors.darkTextSoft : AppColors.textFaint,
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _choose(
    BuildContext context,
    String title,
    List<String> options,
    String current,
    ValueChanged<String> onPick,
  ) async {
    await showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : Colors.white,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.sheet),
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: AppSpace.xs),
                Container(
                  width: 42,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.darkBorder
                        : AppColors.borderStrong,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(AppSpace.md),
                  child: Text(title, style: AppText.h2),
                ),
                ...options.map(
                  (o) => InkWell(
                    onTap: () {
                      onPick(o);
                      Navigator.pop(ctx);
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpace.lg,
                        vertical: AppSpace.sm,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              o,
                              style: AppText.h4.copyWith(
                                fontSize: 14,
                                color: isDark
                                    ? AppColors.darkText
                                    : AppColors.text,
                              ),
                            ),
                          ),
                          if (o == current)
                            Icon(
                              Icons.check_circle_rounded,
                              size: 20,
                              color: isDark
                                  ? AppColors.darkForest
                                  : AppColors.forest,
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpace.md),
              ],
            ),
          ),
        );
      },
    );
  }
}
