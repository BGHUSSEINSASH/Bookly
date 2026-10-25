import 'package:flutter/material.dart';
import 'app_colors.dart';

/// الخطوط: Readex Pro للعناوين · IBM Plex Sans Arabic للنصوص
class AppText {
  static const display = 'ReadexPro';
  static const body = 'IBMPlexSansArabic';

  // ────── عناوين (Readex Pro) ──────
  static const displayLarge = TextStyle(
    fontFamily: display,
    fontSize: 30,
    height: 1.3,
    fontWeight: FontWeight.w600,
    color: AppColors.text,
    letterSpacing: -0.4,
  );
  static const h1 = TextStyle(
    fontFamily: display,
    fontSize: 24,
    height: 1.35,
    fontWeight: FontWeight.w600,
    color: AppColors.text,
    letterSpacing: -0.3,
  );
  static const h2 = TextStyle(
    fontFamily: display,
    fontSize: 19,
    height: 1.4,
    fontWeight: FontWeight.w600,
    color: AppColors.text,
    letterSpacing: -0.2,
  );
  static const h3 = TextStyle(
    fontFamily: display,
    fontSize: 16,
    height: 1.45,
    fontWeight: FontWeight.w600,
    color: AppColors.text,
  );
  static const h4 = TextStyle(
    fontFamily: display,
    fontSize: 14.5,
    height: 1.45,
    fontWeight: FontWeight.w500,
    color: AppColors.text,
  );

  // ────── نصوص (IBM Plex Sans Arabic) ──────
  static const bodyLarge = TextStyle(
    fontFamily: body,
    fontSize: 15,
    height: 1.7,
    fontWeight: FontWeight.w400,
    color: AppColors.text,
  );
  static const bodyMedium = TextStyle(
    fontFamily: body,
    fontSize: 13.5,
    height: 1.6,
    fontWeight: FontWeight.w400,
    color: AppColors.textSoft,
  );
  static const bodySmall = TextStyle(
    fontFamily: body,
    fontSize: 12,
    height: 1.55,
    fontWeight: FontWeight.w400,
    color: AppColors.textSoft,
  );
  static const label = TextStyle(
    fontFamily: body,
    fontSize: 11.5,
    height: 1.4,
    fontWeight: FontWeight.w500,
    color: AppColors.textSoft,
  );
  static const labelFaint = TextStyle(
    fontFamily: body,
    fontSize: 10.5,
    height: 1.4,
    fontWeight: FontWeight.w500,
    color: AppColors.textFaint,
  );

  // ────── السعر (أرقام جدولية) ──────
  static const price = TextStyle(
    fontFamily: body,
    fontSize: 18,
    height: 1.3,
    fontWeight: FontWeight.w600,
    color: AppColors.forest,
    fontFeatures: [FontFeature.tabularFigures()],
  );
  static const priceSmall = TextStyle(
    fontFamily: body,
    fontSize: 14,
    height: 1.3,
    fontWeight: FontWeight.w600,
    color: AppColors.forest,
    fontFeatures: [FontFeature.tabularFigures()],
  );
  static const currency = TextStyle(
    fontFamily: body,
    fontSize: 11.5,
    height: 1.3,
    fontWeight: FontWeight.w400,
    color: AppColors.textSoft,
  );
}

/// ثوابت عامة للتسميات
class AppLabels {
  static const categoryLabels = <String, String>{
    'FARM': 'مزرعة',
    'CHALET': 'شاليه',
    'REST': 'استراحة',
    'HOTEL': 'فندق',
    'APARTMENT': 'شقة فندقية',
    'FLIGHT': 'رحلة طيران',
    'CAR': 'تأجير سيارات',
    'TRIP': 'رحلة سياحية',
  };

  static const amenityLabels = <String, String>{
    'POOL': 'مسبح خاص',
    'FOOTBALL_PITCH': 'ملعب كرة',
    'GARDEN': 'حديقة',
    'BBQ_AREA': 'منطقة شواء',
    'PLAYGROUND': 'ملعب أطفال',
    'PETS_ALLOWED': 'يسمح بالحيوانات',
    'PRIVATE_BATHROOM': 'حمام خاص',
    'KITCHEN': 'مطبخ',
    'AC': 'تكييف',
    'PARKING': 'موقف سيارات',
    'WIFI': 'واي فاي',
    'SEA_VIEW': 'إطلالة بحرية',
    'MOUNTAIN_VIEW': 'إطلالة جبلية',
    'FAMILY_ROOM': 'غرفة عائلية',
    'SAFARI': 'جولة سفاري',
  };

  static const bookingStatus = <String, String>{
    'PENDING': 'بانتظار الموافقة',
    'CONFIRMED': 'مؤكد',
    'COMPLETED': 'مكتمل',
    'CANCELLED': 'ملغى',
    'REFUNDED': 'مسترد',
    'REJECTED': 'مرفوض',
    'EXPIRED': 'منتهي',
  };

  static const tripTypes = <String, String>{
    'MARINE': 'بحرية',
    'SAFARI': 'سفاري',
    'MOUNTAIN': 'جبلية',
    'HERITAGE': 'أثرية',
    'DESERT': 'صحراوية',
    'CITY': 'جولات مدينة',
    'ADVENTURE': 'مغامرات',
  };
}
