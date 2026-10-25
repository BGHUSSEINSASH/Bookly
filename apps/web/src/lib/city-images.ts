/**
 * صور المدن — ملفات محلية في public/cities مقصوصة بنسبة 4:5 ومعدّلة لونيًا
 * (تشبّع منخفض وإضاءة دافئة) لتتوافق مع هوية «حِسّ الضيافة».
 * المفاتيح تطابق city.slug القادم من الـ API.
 */
const CITY_SLUGS = new Set([
  'baghdad',
  'basra',
  'erbil',
  'najaf',
  'karbala',
  'mosul',
  'doha',
  'dubai',
  'riyadh',
  'jeddah',
  'kuwait-city',
  'manama',
  'muscat',
  'amman',
  'cairo',
  'istanbul',
]);

export function cityImage(slug: string) {
  const safe = CITY_SLUGS.has(slug) ? slug : 'baghdad';
  return `/cities/${safe}.jpg`;
}
