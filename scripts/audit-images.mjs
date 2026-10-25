/**
 * تدقيق شامل للصور: يتأكد أن كل أصل يستخدم صورًا حقيقية (Unsplash)
 * ومن الفئة الصحيحة، وأن الترقيم والأعداد متسقة.
 */
const BASE = process.argv[2] || 'http://localhost:4000/api/v1';

const CATEGORY_IDS = {
  FARM: [
    'photo-1500382017468-9049fed747ef',
    'photo-1416879595882-3373a0480b5b',
    'photo-1465146344425-f00d5f5c8f07',
    'photo-1512428813834-c702c7702b78',
    'photo-1499750310107-5fef28a66643',
    'photo-1441974231531-c6227db76b6e',
    'photo-1518780664697-55e3ad937233',
    'photo-1449158743715-0a90ebb6d2d8',
    'photo-1580587771525-78b9dba3b914',
    'photo-1600585154340-be6161a56a0c',
    'photo-1600607687939-ce8a6c25118c',
    'photo-1613490493576-7fde63acd811',
    'photo-1600596542815-ffad4c1539a9',
    'photo-1523217582562-09d0def993a6',
  ],
  CHALET: [
    'photo-1449158743715-0a90ebb6d2d8',
    'photo-1510798831971-661eb04b3739',
    'photo-1520984032042-162d526883e0',
    'photo-1502780402662-acc01917920e',
    'photo-1449157291145-7efd050a4d0e',
    'photo-1518780664697-55e3ad937233',
    'photo-1521401830884-6c03c1c87ebb',
    'photo-1520985952725-2c9a4e0b8fd2',
    'photo-1505693416388-ac5ce068fe85',
    'photo-1616486338812-3dadae4b4ace',
  ],
  HOTEL: [
    'photo-1566073771259-6a8506099945',
    'photo-1571896349842-33c89424de2d',
    'photo-1551882547-ff40c63fe5fa',
    'photo-1445019980597-93fa8acb246c',
    'photo-1618773928121-c32242e63f39',
    'photo-1590490360182-c33d57733427',
    'photo-1582719478250-c89cae4dc85b',
    'photo-1595576508898-0ad5c879a061',
    'photo-1568084680786-a84f91d1153c',
    'photo-1584132967334-10e028bd69f7',
    'photo-1596394516093-501ba68a0ba6',
    'photo-1611892440504-42a792e24d32',
    'photo-1540518614846-7eded433c457',
    'photo-1631049307264-da0ec9d70304',
  ],
  APARTMENT: [
    'photo-1502672260266-1c1ef2d93688',
    'photo-1522708323590-d24dbb6b0267',
    'photo-1484154218962-a197022b5858',
    'photo-1556912173-3bb406ef7e77',
    'photo-1486406146926-c627a92ad1ab',
    'photo-1493809842364-78817add7ffb',
    'photo-1600607687920-4e2a09cf159d',
    'photo-1600566753190-17f0baa2a6c3',
  ],
  TRIP: [
    'photo-1507525428034-b723cf961d3e',
    'photo-1509316785289-025f5b846b35',
    'photo-1476514525535-07fb3b4ae5f1',
    'photo-1469854523086-cc02fe5d8800',
    'photo-1516426122078-c23e76319801',
    'photo-1531761535209-180857e963b9',
    'photo-1548786811-dd6e453ccca7',
    'photo-1488646953014-85cb44e25828',
    'photo-1501785888041-af3ef285b470',
    'photo-1518684079-3c830dcef090',
    'photo-1523805009345-7448845a9e53',
    'photo-1518098268026-4e89f1a2cd8e',
    'photo-1504150558240-0b4fd8946624',
  ],
  CAR: [
    'photo-1503376780353-7e6692767b70',
    'photo-1494976388531-d1058494cdd8',
    'photo-1552519507-da3b142c6e3d',
    'photo-1541899481282-d53bffe3c35d',
    'photo-1502877338535-766e1452684a',
    'photo-1553440569-bcc63803a83d',
    'photo-1567808291548-fc3ee04dbcf0',
    'photo-1583121274602-3e2820c69888',
    'photo-1549317661-bd32c8ce0db2',
    'photo-1550355291-bbee04a92027',
    'photo-1519641471654-76ce0107ad1b',
    'photo-1503736334956-4c8f8e92946d',
  ],
  HERO: [
    'photo-1500382017468-9049fed747ef',
    'photo-1501785888041-af3ef285b470',
    'photo-1470071459604-3b5ec3a7fe05',
    'photo-1507525428034-b723cf961d3e',
    'photo-1469474968028-56623f02e42e',
    'photo-1441974231531-c6227db76b6e',
    'photo-1472214103451-9374bd1c798e',
    'photo-1502082553048-f009c37129b9',
  ],
};

const idOf = (url) => {
  const m = /images\.unsplash\.com\/(photo-[a-z0-9-]+)/i.exec(url || '');
  return m ? m[1] : null;
};

let pass = 0;
let fail = 0;
const ok = (m, x = '') => {
  pass++;
  console.log(`  [PASS] ${m}${x ? ' — ' + x : ''}`);
};
const bad = (m, x = '') => {
  fail++;
  console.log(`  [FAIL] ${m}${x ? ' — ' + x : ''}`);
};

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  return json?.data ?? json;
}

console.log('\n\x1b[1m▸ تدقيق صور العقارات\x1b[0m');
const props = await get('/properties?limit=50');
const list = props?.items ?? props;
let propIssues = 0;

for (const p of list) {
  const images = p.images ?? [];
  if (!images.length) {
    bad(`${p.title}`, 'بدون صور');
    propIssues++;
    continue;
  }
  const ids = images.map(idOf);
  const allReal = ids.every(Boolean);
  const expected = CATEGORY_IDS[p.category] ?? CATEGORY_IDS.FARM;
  const inCategory = ids.every((id) => expected.includes(id));
  if (!allReal) {
    bad(`${p.title}`, 'تحتوي على صور غير من Unsplash');
    propIssues++;
  } else if (!inCategory) {
    bad(`${p.title}`, `صور من فئة خاطئة (${p.category})`);
    propIssues++;
  } else if (images.length < 3) {
    bad(`${p.title}`, `عدد صور قليل (${images.length})`);
    propIssues++;
  } else {
    ok(`${p.title}`, `${images.length} صور · ${p.category}`);
  }

  // الترقيم والتعرفة
  if (p.vendor?.companyName) {
    ok(`  └ تاق المزوّد`, p.vendor.companyName);
  } else {
    bad(`  └ تاق المزوّد مفقود`, p.title);
    propIssues++;
  }
  if (p.badgeLabel) ok(`  └ شارة`, p.badgeLabel);
  if (p.highlights?.length) ok(`  └ أبرز المميزات`, `${p.highlights.length} عناصر`);
}
if (!propIssues) ok('جميع العقارات: صور صحيحة + تاق مزوّد + شارات');

console.log('\n\x1b[1m▸ تدقيق صور الرحلات\x1b[0m');
const trips = await get('/trips?limit=40');
for (const t of trips) {
  const images = t.images ?? [];
  const ids = images.map(idOf);
  if (!images.length) bad(t.title, 'بدون صور');
  else if (!ids.every(Boolean)) bad(t.title, 'صور غير من Unsplash');
  else if (!ids.every((id) => CATEGORY_IDS.TRIP.includes(id)))
    bad(t.title, 'صور من فئة خاطئة');
  else ok(t.title, `${images.length} صور`);
}

console.log('\n\x1b[1m▸ تدقيق صور السيارات\x1b[0m');
const cars = await get('/cars?limit=40');
for (const c of cars) {
  const images = c.images ?? [];
  const ids = images.map(idOf);
  if (!images.length) bad(`${c.make} ${c.model}`, 'بدون صور');
  else if (!ids.every(Boolean)) bad(`${c.make} ${c.model}`, 'صور غير من Unsplash');
  else if (!ids.every((id) => CATEGORY_IDS.CAR.includes(id)))
    bad(`${c.make} ${c.model}`, 'صور من فئة خاطئة');
  else ok(`${c.make} ${c.model}`, `${images.length} صور`);
}

console.log('\n\x1b[1m▸ تدقيق البانرات\x1b[0m');
const banners = await get('/content/banners');
for (const b of banners) {
  const id = idOf(b.imageUrl);
  if (!id) bad(b.title, 'صورة بانر غير صحيحة');
  else if (!CATEGORY_IDS.HERO.includes(id)) bad(b.title, 'صورة بانر من فئة خاطئة');
  else ok(b.title, id);
}

console.log('\n\x1b[1m▸ فحص أولوية صور الغلاف\x1b[0m');
for (const p of list) {
  const images = p.images ?? [];
  const expected = CATEGORY_IDS[p.category] ?? CATEGORY_IDS.FARM;
  const firstOk = expected.includes(idOf(images[0]));
  if (!firstOk) bad(`غلاف ${p.title}`, 'أول صورة ليست من فئة العقار');
}
ok('فحص الأغلفة مكتمل');

console.log(`\n\x1b[1mRESULT: ${pass} passed, ${fail} failed\x1b[0m`);
process.exit(fail > 0 ? 1 : 0);
