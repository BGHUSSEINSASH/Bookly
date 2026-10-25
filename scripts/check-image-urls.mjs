/** يتحقق أن كل رابط صورة في قاعدة البيانات يُرجع صورة فعلية (200) */
const BASE = process.argv[2] || 'http://localhost:4000/api/v1';

const collect = async (path) => {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  const data = json?.data ?? json;
  return (data?.items ?? data ?? []).flatMap((x) => x.images ?? []);
};

const urls = [
  ...(await collect('/properties?limit=50')),
  ...(await collect('/trips?limit=40')),
  ...(await collect('/cars?limit=40')),
];

const banners = await (await fetch(`${BASE}/content/banners`)).json();
for (const b of banners?.data ?? []) urls.push(b.imageUrl);

const unique = [...new Set(urls.filter(Boolean))];
console.log(`\nفحص ${unique.length} رابط صورة فريد...\n`);

let okCount = 0;
let bad = [];
let checked = 0;

for (const u of unique) {
  try {
    const res = await fetch(u, { method: 'GET' });
    const ct = res.headers.get('content-type') ?? '';
    const isImage = ct.startsWith('image/');
    if (res.ok && isImage) {
      okCount++;
    } else {
      bad.push(`${res.status} ${ct} ${u}`);
    }
  } catch (e) {
    bad.push(`ERR ${e.message} ${u}`);
  }
  checked++;
  if (checked % 20 === 0) {
    process.stdout.write(`  ${checked}/${unique.length} …\n`);
  }
}

console.log(`\nRESULT: ${okCount}/${unique.length} صورة تعمل`);
if (bad.length) {
  console.log('\nالمشاكل:');
  bad.forEach((b) => console.log('  - ' + b));
}
process.exit(bad.length ? 1 : 0);
