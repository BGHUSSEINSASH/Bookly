/** فحص سريع لصفحات الويب: يتأكد أن كل صفحة ترجع 200 ومحتواها صحيح. */
const BASE = process.argv[2] || 'http://localhost:3000';

const PAGES = [
  { path: '/', name: 'الرئيسية', expect: ['Bookly', 'مزارع'] },
  { path: '/search?category=FARM', name: 'البحث', expect: ['الفلاتر', 'نتيجة'] },
  { path: '/search?q=مزرعة', name: 'البحث النصي', expect: ['الفلاتر', 'نتيجة'] },
  { path: '/trips', name: 'الرحلات', expect: ['الرحلات'] },
  { path: '/flights', name: 'الطيران', expect: ['الطيران'] },
  { path: '/cars', name: 'السيارات', expect: ['تأجير'] },
  { path: '/login', name: 'الدخول', expect: ['تسجيل الدخول'] },
  { path: '/wallet', name: 'المحفظة (CSR)', expect: ['Bookly'] },
  { path: '/bookings', name: 'حجوزاتي', expect: ['حجوزاتي'] },
  { path: '/favorites', name: 'المفضلة', expect: ['المفضلة'] },
  { path: '/account', name: 'الحساب (CSR)', expect: ['Bookly'] },
  { path: '/settings', name: 'الإعدادات', expect: ['الإعدادات'] },
  { path: '/nonexistent-page', name: '404', expect: null, status: 404 },
];

let pass = 0;
let fail = 0;

for (const p of PAGES) {
  try {
    const res = await fetch(`${BASE}${p.path}`, { redirect: 'follow' });
    const html = await res.text();
    const expectedStatus = p.status ?? 200;
    const statusOk = res.status === expectedStatus;
    const contentOk = !p.expect || p.expect.some((e) => html.includes(e));

    if (statusOk && contentOk) {
      pass++;
      console.log(`  ✔ ${p.name} (${p.path}) — ${res.status}`);
    } else {
      fail++;
      console.log(
        `  ✘ ${p.name} (${p.path}) — status=${res.status} متوقع=${expectedStatus} محتوى=${contentOk}`,
      );
    }
  } catch (e) {
    fail++;
    console.log(`  ✘ ${p.name} (${p.path}) — ${e.message}`);
  }
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
