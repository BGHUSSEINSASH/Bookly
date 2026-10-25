import 'package:flutter/material.dart';

/// لوحة «شناشيل» — تركوازي حيّ + ليموني + بطاقات بيضاء على خلفية شبه بيضاء.
class AppColors {
  // ────── تركوازي العلامة ──────
  static const forest = Color(0xFF0B8A6A);
  static const forestDark = Color(0xFF07705A);
  static const forestDeep = Color(0xFF054F40);
  static const forestLight = Color(0xFF2AA888);
  static const forestPale = Color(0xFF7FD4B8);

  // ────── ليموني (تمييز + CTA) ──────
  static const lime = Color(0xFFD7E64B);
  static const limeDark = Color(0xFFBFCF35);
  static const limeSoft = Color(0xFFF4F8D9);

  // ────── نعناعي (خلفيات ناعمة + قرص التبويب النشط) ──────
  static const mint = Color(0xFFE6F4EF);
  static const mintDeep = Color(0xFFD3EBE1);
  static const mintSoft = Color(0xFFF1F8F5);

  // أسماء قديمة — تُعاد إلى التركوازي الأساسي
  static const clay = forest;
  static const clayDark = forestDark;
  static const claySoft = mint;
  static const clayPale = mintDeep;

  // ────── نحاسي (نجوم وشارات) ──────
  static const star = Color(0xFFF5B301);
  static const amber = Color(0xFFFFF4D6);
  static const amberText = Color(0xFF9A6B00);

  // ────── تركوازي قديم ──────
  static const teal = forest;
  static const tealSoft = mint;

  // ────── محايدات ──────
  static const page = Color(0xFFF7FAF9);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceAlt = Color(0xFFF4F8F6);
  static const border = Color(0xFFE6EFEB);
  static const borderStrong = Color(0xFFD2E3DC);

  static const text = Color(0xFF152520);
  static const textSoft = Color(0xFF5C716B);
  static const textFaint = Color(0xFF92A6A0);
  static const textInverse = Color(0xFFFFFFFF);

  // ────── دلالات ──────
  static const success = Color(0xFF0B8A6A);
  static const warning = Color(0xFFF5B301);
  static const danger = Color(0xFFE5484D);
  static const info = Color(0xFF3B82F6);

  // ────── الوضع الليلي ──────
  static const darkPage = Color(0xFF0E1A16);
  static const darkSurface = Color(0xFF16221E);
  static const darkSurfaceAlt = Color(0xFF1E2E28);
  static const darkBorder = Color(0xFF2A3E37);
  static const darkText = Color(0xFFF2F8F6);
  static const darkTextSoft = Color(0xFFA8BDB6);
  static const darkForest = Color(0xFF4FD1AC);
}

/// المسافات (شبكة 4pt)
class AppSpace {
  static const xxs = 4.0;
  static const xs = 8.0;
  static const sm = 12.0;
  static const md = 16.0;
  static const lg = 20.0;
  static const xl = 24.0;
  static const xxl = 32.0;
  static const huge = 40.0;
  static const giant = 56.0;
}

/// أنصاف الأقطار
class AppRadius {
  static const xs = 6.0;
  static const sm = 8.0;
  static const md = 10.0;
  static const lg = 12.0;
  static const xl = 16.0;
  static const pill = 999.0;
  static const sheet = 20.0;
}

/// ظلال ناعمة مائلة للتركوازي
class AppShadow {
  static const e1 = [
    BoxShadow(color: Color(0x0A0B2A22), blurRadius: 4, offset: Offset(0, 1)),
  ];
  static const e2 = [
    BoxShadow(color: Color(0x0F0B2A22), blurRadius: 16, offset: Offset(0, 4)),
  ];
  static const e3 = [
    BoxShadow(color: Color(0x140B2A22), blurRadius: 32, offset: Offset(0, 12)),
  ];
  static const e4 = [
    BoxShadow(color: Color(0x1A0B2A22), blurRadius: 56, offset: Offset(0, 24)),
  ];
}

/// مدد الحركة
class AppMotion {
  static const micro = Duration(milliseconds: 120);
  static const standard = Duration(milliseconds: 220);
  static const emphasized = Duration(milliseconds: 320);
  static const hero = Duration(milliseconds: 420);
  static const curve = Curves.easeOutCubic;
  static const emphasizedCurve = Cubic(0.32, 0.72, 0, 1);
}
