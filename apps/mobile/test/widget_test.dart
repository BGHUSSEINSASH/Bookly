import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:bookly_app/core/api_client.dart';
import 'package:bookly_app/core/format.dart';
import 'package:bookly_app/main.dart';
import 'package:bookly_app/state/auth_provider.dart';
import 'package:bookly_app/ui/app_colors.dart';
import 'package:bookly_app/ui/app_text.dart';

void main() {
  testWidgets('تطبيق Bookly يعمل ويعرض الهيكل الأساسي', (WidgetTester tester) async {
    final api = ApiClient();
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          Provider<ApiClient>.value(value: api),
          ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider(api)),
          ChangeNotifierProvider<ThemeController>(create: (_) => ThemeController()),
        ],
        child: const BooklyApp(),
      ),
    );
    await tester.pump();

    expect(find.text('أهلًا بك في بوكلي'), findsOneWidget);
    expect(find.text('الرئيسية'), findsOneWidget);
    expect(find.text('البحث'), findsOneWidget);
  });

  test('تنسيق المبالغ يعمل مع العملات العربية', () {
    expect(formatMoney(75000, 'IQD'), '75,000 د.ع');
    expect(formatMoney(120.5, 'USD'), '121 \$');
  });

  test('تسميات الفئات والمرافق موجودة', () {
    expect(AppLabels.categoryLabels['FARM'], 'مزرعة');
    expect(AppLabels.amenityLabels['POOL'], 'مسبح خاص');
    expect(AppLabels.bookingStatus['CONFIRMED'], 'مؤكد');
  });

  test('ألوان العلامة ثابتة ومتوافقة مع الهوية', () {
    expect(AppColors.forest, const Color(0xFF0B8A6A));
    expect(AppColors.lime, const Color(0xFFD7E64B));
    expect(AppColors.mint, const Color(0xFFE6F4EF));
  });
}
