/// تنسيق المبالغ — أرقام غربية بفواصل آلاف + رمز العملة
String formatMoney(num amount, [String currency = 'IQD']) {
  const symbols = <String, String>{
    'IQD': 'د.ع',
    'USD': r'$',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'KWD': 'د.ك',
    'QAR': 'ر.ق',
  };
  final symbol = symbols[currency] ?? currency;
  final rounded = amount.round();
  final negative = rounded < 0;
  final digits = rounded.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
    buffer.write(digits[i]);
  }
  return '${negative ? '-' : ''}$buffer $symbol';
}
