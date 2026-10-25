/**
 * اختبار دخان شامل للـ API — يشغّل رحلة كاملة من التسجيل حتى لوحة الإدارة.
 * الاستخدام: node scripts/smoke-test.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:4000/api/v1';

let pass = 0;
let fail = 0;

const ok = (label, extra = '') => {
  pass++;
  console.log(`  [PASS] ${label}${extra ? ' - ' + extra : ''}`);
};
const bad = (label, extra = '') => {
  fail++;
  console.log(`  [FAIL] ${label}${extra ? ' - ' + extra : ''}`);
};
const section = (t) => console.log(`\n\x1b[36m▸ ${t}\x1b[0m`);

async function api(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, body: json };
}

const get = (p, token) => api('GET', p, { token });
const post = (p, body, token) => api('POST', p, { body, token });

async function main() {
  section('1) المصادقة');
  const login = await post('/auth/login', {
    email: 'customer@bookly.app',
    password: 'Password@123',
  });
  if (login.status !== 200) {
    bad('تسجيل الدخول', JSON.stringify(login.body));
    process.exit(1);
  }
  const token = login.body.data.accessToken;
  ok('تسجيل الدخول كعميل', login.body.data.user.fullName);

  const badLogin = await post('/auth/login', { email: 'customer@bookly.app', password: 'wrong' });
  badLogin.status === 401 ? ok('رفض كلمة مرور خاطئة') : bad('رفض كلمة مرور خاطئة', `status=${badLogin.status}`);

  const refresh = await post('/auth/refresh', { refreshToken: login.body.data.refreshToken });
  refresh.status === 200 ? ok('تجديد رمز الوصول') : bad('تجديد رمز الوصول', `status=${refresh.status}`);

  // عميل جديد لكل تشغيل حتى لا تستنفد حدود الكوبونات واستخدامات الحساب
  const stamp = Date.now();
  const newEmail = `smoke+${stamp}@bookly.app`;
  const reg = await post('/auth/register', {
    email: newEmail,
    password: 'Password@123',
    fullName: 'عميل الاختبار',
    phone: `+96477${String(stamp).slice(-8)}`,
  });
  reg.status === 201 || reg.status === 200
    ? ok('إنشاء حساب جديد', newEmail)
    : bad('إنشاء حساب جديد', JSON.stringify(reg.body));

  const newToken = reg.body?.data?.accessToken ?? token;
  const newUser = reg.body?.data?.user;

  // شحن المحفظة للحساب الجديد
  if (reg.status === 201 || reg.status === 200) {
    const top = await post('/wallet/topup', { amount: 2000000, method: 'VISA' }, newToken);
    top.status === 200
      ? ok('شحن محفظة العميل الجديد', `الرصيد ${top.body.data.balanceAfter}`)
      : bad('شحن محفظة العميل الجديد', JSON.stringify(top.body));
  }

  section('2) البحث والفلاتر');
  const search = await get('/properties?category=FARM&limit=5&sortBy=RATING_DESC');
  const props = search.body.data.items ?? search.body.data;
  search.status === 200 && props.length > 0
    ? ok('البحث عن المزارع', `${props.length} نتائج`)
    : bad('البحث عن المزارع', JSON.stringify(search.body));
  props.forEach((p) =>
    console.log(`      • ${p.title} — ${p.pricePerNight} ${p.currency} — ${p.ratingAvg}★ (${p.ratingCount}) — ${p.city.nameAr} — ${p.images.length} صور`),
  );

  const cities = await get('/properties/cities');
  ok('قائمة المدن', `${cities.body.data.length} مدينة`);

  const filtered = await get(
    `/properties?cityId=${cities.body.data[0].id}&minPrice=20000&maxPrice=200000&minRating=4&limit=10`,
  );
  ok('فلترة حسب المدينة/السعر/التقييم', `${(filtered.body.data.items ?? filtered.body.data).length} نتائج`);

  const noPool = await get('/properties?amenities=POOL&limit=10');
  const allHavePool = (noPool.body.data.items ?? noPool.body.data).every((p) => p.amenities.includes('POOL'));
  allHavePool ? ok('فلترة حسب المرافق (مسبح)') : bad('فلترة حسب المرافق');

  const propId = props[0].id;
  const detail = await get(`/properties/${propId}`);
  detail.body.data.roomTypes?.length && detail.body.data.images.length
    ? ok(
        'تفاصيل العقار',
        `${detail.body.data.roomTypes.length} نوع غرفة، ${detail.body.data.reviews.length} مراجعة، ${detail.body.data.images.length} صورة`,
      )
    : bad('تفاصيل العقار', JSON.stringify(detail.body).slice(0, 200));

  const deals = await get('/properties/deals?limit=3');
  ok('عروض اليوم', deals.body.data.map((d) => d.title).join(' | '));

  section('3) الطيران والسيارات والرحلات');
  const airports = await get('/flights/airports');
  ok('المطارات', `${airports.body.data.length} مطار`);
  const bgw = airports.body.data.find((a) => a.iataCode === 'BGW');
  const dxb = airports.body.data.find((a) => a.iataCode === 'DXB');
  const flights = await get(`/flights/search?fromAirportId=${bgw.id}&toAirportId=${dxb.id}`);
  ok('البحث عن رحلات', `${flights.body.data.length} رحلة`);
  if (flights.body.data[0]) {
    console.log(
      `      • ${flights.body.data[0].airline.nameAr} ${flights.body.data[0].flightNumber} — ${flights.body.data[0].from.iata}→${flights.body.data[0].to.iata} — ${flights.body.data[0].durationMinutes} دقيقة — stops=${flights.body.data[0].stops}`,
    );
  }

  const cars = await get('/cars?limit=5');
  ok('تأجير السيارات', cars.body.data.map((c) => `${c.make} ${c.model} @${c.dailyRate}`).join(' | '));

  const trips = await get('/trips');
  ok('الرحلات السياحية', `${trips.body.data.length} رحلة`);

  section('4) المحفظة والدفع');
  const wallet = await get('/wallet', newToken);
  ok('رصيد المحفظة', `${wallet.body.data.balance} ${wallet.body.data.currency}`);

  const topup = await post('/wallet/topup', { amount: 250000, method: 'VISA' }, newToken);
  topup.status === 200 ? ok('شحن الرصيد', `الرصيد الآن ${topup.body.data.balanceAfter}`) : bad('شحن الرصيد');

  const methods = await get('/payments/methods');
  ok('وسائل الدفع', `${methods.body.data.length} وسيلة`);

  section('5) التسعير والحجز');
  // نختار تواريخ غير محجوزة مسبقًا حتى يمكن إعادة تشغيل الاختبار
  let checkIn = null;
  let checkOut = null;
  for (let attempt = 0; attempt < 12 && !checkIn; attempt++) {
    const offset = 30 + Math.floor(Math.random() * 120) + attempt * 7;
    const ci = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
    const co = new Date(Date.now() + (offset + 2) * 86400000).toISOString().slice(0, 10);
    const avail = await get(
      `/properties/${propId}/availability?checkIn=${ci}&checkOut=${co}`,
      false,
    );
    if (avail.status === 200 && avail.body.data?.available) {
      checkIn = ci;
      checkOut = co;
    }
  }
  if (!checkIn) {
    bad('إيجاد تواريخ متاحة للاختبار');
    checkIn = new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10);
    checkOut = new Date(Date.now() + 402 * 86400000).toISOString().slice(0, 10);
  } else {
    ok('إيجاد تواريخ متاحة', `${checkIn} ← ${checkOut}`);
  }

  // بعض الأكواد لها حد استخدام لكل مستخدم — نجرّب البديل عند الحاجة
  const couponCodes = ['WELCOME10', 'FRIDAY20', 'EID25'];
  let usedCoupon = null;
  for (const code of couponCodes) {
    const probe = await post('/coupons/validate', { code, subtotal: 100000 }, newToken);
    if (probe.status === 200) {
      usedCoupon = code;
      break;
    }
  }
  usedCoupon ? ok('كود خصم متاح', usedCoupon) : bad('لا يوجد كود خصم متاح');

  const bookingBody = {
    target: 'PROPERTY',
    propertyId: propId,
    checkIn,
    checkOut,
    guests: 4,
    couponCode: usedCoupon ?? undefined,
    pointsRedeemed: 0,
  };

  const quote = await post('/bookings/quote', bookingBody, newToken);
  quote.status === 200
    ? ok(
        'معاينة السعر',
        `المجموع ${quote.body.data.total} — خصم ${quote.body.data.discount} — نقاط مكتسبة ${quote.body.data.pointsEarned}`,
      )
    : bad('معاينة السعر', JSON.stringify(quote.body));

  const booking = await post('/bookings', bookingBody, newToken);
  if (booking.status !== 201 && booking.status !== 200) {
    bad('إنشاء الحجز', JSON.stringify(booking.body));
  } else {
    const b = booking.body.data;
    ok('إنشاء الحجز', `${b.code} — ${b.status} — الدفع ${b.paymentStatus} — الإجمالي ${b.total} — العمولة ${b.commission}`);
    globalThis.__code = b.code;
  }

  const myBookings = await get('/bookings?limit=5', newToken);
  ok('حجوزاتي', `${myBookings.body.meta?.total ?? myBookings.body.data.length} حجز`);

  const conflict = await post('/bookings', bookingBody, newToken);
  conflict.status === 409
    ? ok('منع الحجز المتداخل في نفس التواريخ')
    : bad('منع الحجز المتداخل', `status=${conflict.status}`);

  section('6) النقاط والتقييم');
  const points = await get('/loyalty/me', newToken);
  ok('رصيد النقاط', `${points.body.data.points} نقطة — ${points.body.data.tierLabelAr} — مضاعف ×${points.body.data.multiplier}`);

  const coupon = usedCoupon
    ? await post('/coupons/validate', { code: usedCoupon, subtotal: 100000 }, newToken)
    : null;
  coupon === null
    ? ok('التحقق من الكوبون (تم استنفاد الأكواد - تخطي)')
    : coupon.status === 200
      ? ok('التحقق من الكوبون', `خصم ${coupon.body.data.discount}`)
      : coupon.body?.error?.code === 'BAD_REQUEST'
        ? ok('التحقق من الكوبون (الكود مستخدم مسبقًا - سلوك صحيح)')
        : bad('التحقق من الكوبون', JSON.stringify(coupon.body));

  const review = await post(
    '/reviews',
    { bookingCode: globalThis.__code, rating: 5, comment: 'تجربة ممتازة ونظيفة والضيافة كريمة' },
    newToken,
  );
  review.status === 201 || review.status === 200
    ? ok('تقييم الحجز')
    : bad('تقييم الحجز', JSON.stringify(review.body));

  section('7) المفضلة والإشعارات');
  await post('/favorites', { propertyId: propId }, newToken);
  const favs = await get('/favorites', newToken);
  favs.body.data.length > 0 ? ok('المفضلة', `${favs.body.data.length} عنصر`) : bad('المفضلة');

  const notif = await get('/notifications', newToken);
  ok('الإشعارات', `${notif.body.data.items.length} إشعار (${notif.body.data.unread} غير مقروء)`);

  section('8) الإلغاء والاسترداد');
  const cancel = await post(`/bookings/${globalThis.__code}/cancel`, { reason: 'تغيير الخطة' }, newToken);
  cancel.status === 200
    ? ok('إلغاء الحجز', `مبلغ الاسترداد ${cancel.body.data.refundAmount}`)
    : bad('إلغاء الحجز', JSON.stringify(cancel.body));

  section('9) لوحة المزوّد');
  const farmLogin = await post('/auth/login', { email: 'farm@bookly.app', password: 'Password@123' });
  const farmToken = farmLogin.body.data.accessToken;
  const vendorProps = await get('/properties/vendor/mine', farmToken);
  ok('عقارات المزرعة', `${vendorProps.body.data.length} عقار`);
  const vendorBookings = await get('/bookings/vendor', farmToken);
  ok('حجوزات المزرعة', `${vendorBookings.body.data.length} حجز`);

  section('10) لوحة الإدارة');
  const adminLogin = await post('/auth/login', { email: 'admin@bookly.app', password: 'Admin@12345' });
  const adminToken = adminLogin.body.data.accessToken;
  const dash = await get('/admin/dashboard', adminToken);
  if (dash.status === 200) {
    const d = dash.body.data;
    ok(
      'إحصاءات المنصة',
      `مستخدمون ${d.users.total} — عقارات ${d.properties.published} — حجوزات ${d.bookings.total} — إيرادات ${d.revenue.total} — عمولة ${d.revenue.commission}`,
    );
  } else bad('إحصاءات المنصة', JSON.stringify(dash.body));

  const adminUsers = await get('/admin/users?limit=5', adminToken);
  ok('إدارة المستخدمين', `${adminUsers.body.meta?.total ?? adminUsers.body.data.length} مستخدم`);

  const pending = await get('/admin/properties?status=PENDING_REVIEW', adminToken);
  ok('العقارات بانتظار المراجعة', `${(pending.body.data.items ?? pending.body.data).length} عقار`);

  section('11) الأمان');
  const denied = await get('/admin/dashboard', token);
  denied.status === 403 ? ok('حماية لوحة الإدارة من العملاء') : bad('حماية لوحة الإدارة', `status=${denied.status}`);

  const noAuth = await get('/bookings');
  noAuth.status === 401 ? ok('حماية المسارات الخاصة') : bad('حماية المسارات الخاصة', `status=${noAuth.status}`);

  const health = await get('/health');
  health.body.data?.status === 'ok' ? ok('فحص الصحة', 'قاعدة البيانات متصلة') : bad('فحص الصحة');

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('\x1b[31mخطأ غير متوقع:\x1b[0m', e);
  process.exit(1);
});
