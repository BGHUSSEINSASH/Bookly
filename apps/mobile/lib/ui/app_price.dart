import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text.dart';

/// تنسيق السعر بالعملة
String formatPrice(num amount, {String currency = 'IQD'}) {
  const symbols = {
    'IQD': 'د.ع',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'KWD': 'د.ك',
    'QAR': 'ر.ق',
    'BHD': 'د.ب',
    'OMR': 'ر.ع',
    'JOD': 'د.أ',
    'EGP': 'ج.م',
    'USD': '\$',
    'EUR': '€',
  };
  final symbol = symbols[currency] ?? currency;
  final text = _group(amount.round());
  return '$text $symbol';
}

/// تنسيق مبلغ بدون رمز العملة
String formatAmount(num amount) => _group(amount.round());

String _group(int value) {
  final s = value.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buffer.write(',');
    buffer.write(s[i]);
  }
  return value < 0 ? '-${buffer.toString()}' : buffer.toString();
}

/// سطر السعر (رقم كبير + رمز عملة)
class AppPriceRow extends StatelessWidget {
  const AppPriceRow({
    super.key,
    required this.amount,
    this.currency = 'IQD',
    this.size = AppPriceSize.large,
    this.suffix,
  });

  final num amount;
  final String currency;
  final AppPriceSize size;
  final String? suffix;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final style = switch (size) {
      AppPriceSize.large => AppText.price.copyWith(fontSize: 19),
      AppPriceSize.medium => AppText.price,
      AppPriceSize.small => AppText.priceSmall,
    };

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          formatAmount(amount),
          style: style.copyWith(
            color: isDark ? AppColors.darkForest : AppColors.forest,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          _symbol(currency),
          style: AppText.currency.copyWith(
            color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
          ),
        ),
        if (suffix != null) ...[
          const SizedBox(width: 4),
          Text(
            suffix!,
            style: AppText.currency.copyWith(
              color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
            ),
          ),
        ],
      ],
    );
  }

  static String _symbol(String currency) {
    const symbols = {
      'IQD': 'د.ع',
      'SAR': 'ر.س',
      'AED': 'د.إ',
      'KWD': 'د.ك',
      'QAR': 'ر.ق',
      'BHD': 'د.ب',
      'OMR': 'ر.ع',
      'JOD': 'د.أ',
      'EGP': 'ج.م',
      'USD': '\$',
      'EUR': '€',
    };
    return symbols[currency] ?? currency;
  }
}

enum AppPriceSize { large, medium, small }
