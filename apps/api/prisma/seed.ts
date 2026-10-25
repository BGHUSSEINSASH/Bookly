/* eslint-disable no-console */
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

import { galleryFor, coverFor, CATEGORY_IMAGE, type ImageCategory } from '../src/common/image-catalog';

/** صور احترافية مصنّفة لكل نوع عقار */
const img = (seed: string, w = 1200, h = 800) => {
  const key = (Object.keys(CATEGORY_IMAGE) as string[]).find((k) => seed.includes(k));
  const category = (CATEGORY_IMAGE[key ?? 'FARM'] ?? 'farm') as ImageCategory;
  const idx = Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0));
  return coverFor(category, idx, w, h);
};

/** معرض صور كامل لفئة — يدعم فئات العقارات والرحلات والسيارات والبنرات */
const gallery = (category: string, count = 6) => {
  const direct = ['TRIP', 'CAR', 'HERO', 'ARTICLE'];
  const key = direct.includes(category)
    ? (category.toLowerCase() as ImageCategory)
    : ((CATEGORY_IMAGE[category] ?? 'farm') as ImageCategory);
  return galleryFor(key, count);
};

async function main() {
  console.log('🌱 بدء تعبئة قاعدة بيانات Bookly...');

  // ─────────────── تنظيف ───────────────
  await prisma.$transaction([
    prisma.reviewImage.deleteMany(),
    prisma.review.deleteMany(),
    prisma.couponRedemption.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.loyaltyEntry.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.bookingGuest.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.propertyImage.deleteMany(),
    prisma.roomTypeImage.deleteMany(),
    prisma.propertyAmenity.deleteMany(),
    prisma.seasonalOffer.deleteMany(),
    prisma.roomType.deleteMany(),
    prisma.property.deleteMany(),
    prisma.tripImage.deleteMany(),
    prisma.trip.deleteMany(),
    prisma.carImage.deleteMany(),
    prisma.car.deleteMany(),
    prisma.flight.deleteMany(),
    prisma.airline.deleteMany(),
    prisma.airport.deleteMany(),
    prisma.city.deleteMany(),
    prisma.country.deleteMany(),
    prisma.supportMessage.deleteMany(),
    prisma.supportTicket.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.media.deleteMany(),
    prisma.vendorProfile.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.otpCode.deleteMany(),
    prisma.user.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345', 10);

  // ─────────────── الدول ───────────────
  const countryRows: Prisma.CountryCreateManyInput[] = [
    { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', currency: 'IQD', phoneCode: '+964' },
    { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', currency: 'SAR', phoneCode: '+966' },
    { code: 'AE', nameAr: 'الإمارات', nameEn: 'United Arab Emirates', currency: 'AED', phoneCode: '+971' },
    { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', currency: 'KWD', phoneCode: '+965' },
    { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', currency: 'QAR', phoneCode: '+974' },
    { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', currency: 'BHD', phoneCode: '+973' },
    { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', currency: 'OMR', phoneCode: '+968' },
    { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', currency: 'JOD', phoneCode: '+962' },
    { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', currency: 'EGP', phoneCode: '+20' },
    { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', currency: 'TRY', phoneCode: '+90' },
  ];
  const countries = await prisma.country.createMany({ data: countryRows });
  const countryMap = Object.fromEntries(
    await prisma.country.findMany().then((rows) => rows.map((c) => [c.code, c])),
  );

  // ─────────────── المدن ───────────────
  const cityRows: Prisma.CityCreateManyInput[] = [
    { slug: 'baghdad', nameAr: 'بغداد', nameEn: 'Baghdad', countryId: countryMap.IQ.id, latitude: 33.3152, longitude: 44.3661, isPopular: true },
    { slug: 'basra', nameAr: 'البصرة', nameEn: 'Basra', countryId: countryMap.IQ.id, latitude: 30.5085, longitude: 47.7804, isPopular: true },
    { slug: 'mosul', nameAr: 'الموصل', nameEn: 'Mosul', countryId: countryMap.IQ.id, latitude: 36.335, longitude: 43.1189, isPopular: true },
    { slug: 'erbil', nameAr: 'أربيل', nameEn: 'Erbil', countryId: countryMap.IQ.id, latitude: 36.1911, longitude: 44.0092, isPopular: true },
    { slug: 'najaf', nameAr: 'النجف', nameEn: 'Najaf', countryId: countryMap.IQ.id, latitude: 32.0, longitude: 44.335, isPopular: true },
    { slug: 'karbala', nameAr: 'كربلاء', nameEn: 'Karbala', countryId: countryMap.IQ.id, latitude: 32.616, longitude: 44.0242 },
    { slug: 'doha', nameAr: 'الدوحة', nameEn: 'Doha', countryId: countryMap.QA.id, latitude: 25.2854, longitude: 51.531, isPopular: true },
    { slug: 'dubai', nameAr: 'دبي', nameEn: 'Dubai', countryId: countryMap.AE.id, latitude: 25.2048, longitude: 55.2708, isPopular: true },
    { slug: 'riyadh', nameAr: 'الرياض', nameEn: 'Riyadh', countryId: countryMap.SA.id, latitude: 24.7136, longitude: 46.6753, isPopular: true },
    { slug: 'jeddah', nameAr: 'جدة', nameEn: 'Jeddah', countryId: countryMap.SA.id, latitude: 21.4858, longitude: 39.1925, isPopular: true },
    { slug: 'kuwait-city', nameAr: 'مدينة الكويت', nameEn: 'Kuwait City', countryId: countryMap.KW.id, latitude: 29.3759, longitude: 47.9774, isPopular: true },
    { slug: 'manama', nameAr: 'المنامة', nameEn: 'Manama', countryId: countryMap.BH.id, latitude: 26.2285, longitude: 50.586 },
    { slug: 'muscat', nameAr: 'مسقط', nameEn: 'Muscat', countryId: countryMap.OM.id, latitude: 23.588, longitude: 58.3829 },
    { slug: 'amman', nameAr: 'عمّان', nameEn: 'Amman', countryId: countryMap.JO.id, latitude: 31.9539, longitude: 35.9106 },
    { slug: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', countryId: countryMap.EG.id, latitude: 30.0444, longitude: 31.2357 },
    { slug: 'istanbul', nameAr: 'إسطنبول', nameEn: 'Istanbul', countryId: countryMap.TR.id, latitude: 41.0082, longitude: 28.9784 },
  ];
  await prisma.city.createMany({ data: cityRows });
  const cities = await prisma.city.findMany();
  const city = (slug: string) => cities.find((c) => c.slug === slug)!;

  // ─────────────── المطارات ───────────────
  const airportRows: Prisma.AirportCreateManyInput[] = [
    { iataCode: 'BGW', nameAr: 'مطار بغداد الدولي', nameEn: 'Baghdad International', cityId: city('baghdad').id },
    { iataCode: 'BSR', nameAr: 'مطار البصرة الدولي', nameEn: 'Basra International', cityId: city('basra').id },
    { iataCode: 'EBL', nameAr: 'مطار أربيل الدولي', nameEn: 'Erbil International', cityId: city('erbil').id },
    { iataCode: 'DOH', nameAr: 'مطار حمد الدولي', nameEn: 'Hamad International', cityId: city('doha').id },
    { iataCode: 'DXB', nameAr: 'مطار دبي الدولي', nameEn: 'Dubai International', cityId: city('dubai').id },
    { iataCode: 'RUH', nameAr: 'مطار الملك خالد', nameEn: 'King Khalid International', cityId: city('riyadh').id },
    { iataCode: 'JED', nameAr: 'مطار الملك عبدالعزيز', nameEn: 'King Abdulaziz International', cityId: city('jeddah').id },
    { iataCode: 'KWI', nameAr: 'مطار الكويت الدولي', nameEn: 'Kuwait International', cityId: city('kuwait-city').id },
    { iataCode: 'BAH', nameAr: 'مطار البحرين الدولي', nameEn: 'Bahrain International', cityId: city('manama').id },
    { iataCode: 'MCT', nameAr: 'مطار مسقط الدولي', nameEn: 'Muscat International', cityId: city('muscat').id },
    { iataCode: 'AMM', nameAr: 'مطار الملكة علياء الدولي', nameEn: 'Queen Alia International', cityId: city('amman').id },
    { iataCode: 'CAI', nameAr: 'مطار القاهرة الدولي', nameEn: 'Cairo International', cityId: city('cairo').id },
    { iataCode: 'IST', nameAr: 'مطار إسطنبول', nameEn: 'Istanbul Airport', cityId: city('istanbul').id },
  ];
  await prisma.airport.createMany({ data: airportRows });
  const airports = await prisma.airport.findMany();
  const apt = (code: string) => airports.find((a) => a.iataCode === code)!;

  // ─────────────── المستخدمون ───────────────
  const admin = await prisma.user.create({
    data: {
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@bookly.app',
      passwordHash: adminHash,
      fullName: 'مدير المنصة',
      phone: '+9647700000001',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  const customers = await Promise.all(
    [
      { email: 'customer@bookly.app', name: 'سارة أحمد', phone: '+9647700000010' },
      { email: 'ali@bookly.app', name: 'علي كريم', phone: '+9647700000011' },
      { email: 'noor@bookly.app', name: 'نور عبد الله', phone: '+9647700000012' },
    ].map((c) =>
      prisma.user.create({
        data: {
          email: c.email,
          passwordHash,
          fullName: c.name,
          phone: c.phone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          loyaltyPoints: 1500,
          tier: 'BRONZE',
          wallet: { create: { currency: 'IQD', balance: 500000 } },
        },
      }),
    ),
  );

  const farmOwner = await prisma.user.create({
    data: {
      email: 'farm@bookly.app',
      passwordHash,
      fullName: 'أبو محمد — مزرعة الفرات',
      phone: '+9647700000020',
      role: 'FARM_OWNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  const farmOwner2 = await prisma.user.create({
    data: {
      email: 'farm2@bookly.app',
      passwordHash,
      fullName: 'حيدر الساعدي — مزارع السنا',
      phone: '+9647700000021',
      role: 'FARM_OWNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  const hotelManager = await prisma.user.create({
    data: {
      email: 'hotel@bookly.app',
      passwordHash,
      fullName: 'مدير فندق الرافدين',
      phone: '+9647700000030',
      role: 'HOTEL_MANAGER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  const agency = await prisma.user.create({
    data: {
      email: 'trips@bookly.app',
      passwordHash,
      fullName: 'شركة الرافدين للرحلات',
      phone: '+9647700000040',
      role: 'TRAVEL_AGENCY',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  const carVendor = await prisma.user.create({
    data: {
      email: 'cars@bookly.app',
      passwordHash,
      fullName: 'شركة التميز لتأجير السيارات',
      phone: '+9647700000050',
      role: 'VENDOR',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      wallet: { create: { currency: 'IQD' } },
    },
  });

  // ─────────────── ملفات المزوّدين ───────────────
  const vendorFarm = await prisma.vendorProfile.create({
    data: {
      userId: farmOwner.id,
      type: 'FARM',
      status: 'APPROVED',
      companyName: 'مزارع الفرات',
      phone: '+9647700000020',
      email: 'farm@bookly.app',
      description: 'مزارع ترفيهية على ضفاف نهر الفرات مع مبيت كامل وخدمات ضيافة.',
      commissionRate: 12,
      ratingAvg: 4.7,
      ratingCount: 128,
    },
  });

  const vendorFarm2 = await prisma.vendorProfile.create({
    data: {
      userId: farmOwner2.id,
      type: 'FARM',
      status: 'APPROVED',
      companyName: 'مزارع السنا للترفيه',
      phone: '+9647700000021',
      email: 'farm2@bookly.app',
      description: 'استراحات ومواقع تخييم قريبة من أربيل مع ملاعب ومرافق عائلية.',
      commissionRate: 12,
      ratingAvg: 4.5,
      ratingCount: 86,
    },
  });

  const vendorHotel = await prisma.vendorProfile.create({
    data: {
      userId: hotelManager.id,
      type: 'HOTEL',
      status: 'APPROVED',
      companyName: 'فندق الرافدين',
      phone: '+9647700000030',
      email: 'hotel@bookly.app',
      description: 'فندق 4 نجوم في قلب بغداد مع مسبح وخدمة غرف.',
      commissionRate: 10,
      ratingAvg: 4.6,
      ratingCount: 312,
    },
  });

  const vendorAgency = await prisma.vendorProfile.create({
    data: {
      userId: agency.id,
      type: 'TRAVEL_AGENCY',
      status: 'APPROVED',
      companyName: 'شركة الرافدين للرحلات السياحية',
      phone: '+9647700000040',
      email: 'trips@bookly.app',
      description: 'تنظيم رحلات بحرية وسفاري وجبلية داخل العراق وخارجه.',
      commissionRate: 12,
      ratingAvg: 4.8,
      ratingCount: 54,
    },
  });

  const vendorCars = await prisma.vendorProfile.create({
    data: {
      userId: carVendor.id,
      type: 'CAR_RENTAL',
      status: 'APPROVED',
      companyName: 'شركة النخبة لتأجير السيارات',
      phone: '+9647700000050',
      email: 'cars@bookly.app',
      description: 'أسطول سيارات حديثة مع استلام من المطار وسائق اختياري.',
      commissionRate: 10,
      ratingAvg: 4.4,
      ratingCount: 97,
    },
  });

  // ─────────────── العقارات (مزارع/شاليهات/فنادق) ───────────────
  const propertySeeds: Array<{
    vendorId: string;
    category: 'FARM' | 'CHALET' | 'REST' | 'HOTEL' | 'APARTMENT';
    title: string;
    slug: string;
    summary: string;
    description: string;
    citySlug: string;
    pricePerNight: number;
    pricePerHour?: number;
    pricePerDay?: number;
    bookingMode?: 'NIGHT' | 'HOUR' | 'DAY';
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    areaSqm?: number;
    starRating?: number;
    amenities: string[];
    highlights?: string[];
    badgeLabel?: string;
    negotiable?: boolean;
    ratingAvg: number;
    ratingCount: number;
    viewsCount: number;
    status?: 'PUBLISHED' | 'PENDING_REVIEW';
    isInstantBook?: boolean;
    rules?: string[];
  }> = [
    {
      vendorId: vendorFarm.id,
      category: 'FARM',
      title: 'مزرعة الفرات — استراحة عائلية',
      slug: 'مزرعة-الفرات-استراحة-عائلية',
      summary: 'استراحة على ضفاف الفرات مع مسبح خاص وملعب كرة وخدمة ضيافة عراقية أصيلة.',
      description:
        'تطل مزرعة الفرات على نهر الفرات مباشرة، وتضم 12 غرفة مكيّفة، مسبح خاص مُسخّن، ملعب كرة قدم عشب، ومطعم يقدّم الأكل العراقي الأصيل. مناسبة للعائلات والتجمعات الصغيرة مع خدمة ضيافة على مدار الساعة.',
      citySlug: 'baghdad',
      pricePerNight: 75000,
      pricePerHour: 12000,
      pricePerDay: 55000,
      bookingMode: 'NIGHT',
      maxGuests: 25,
      bedrooms: 6,
      bathrooms: 6,
      areaSqm: 1200,
      highlights: ["مسبح خاص مُسخّن","ملعب كرة قدم عشب","إطلالة على نهر الفرات","مطبخ ضيافة عراقي"],
      badgeLabel: "خصم 15%",
      negotiable: true,
      amenities: ['POOL', 'FOOTBALL_PITCH', 'GARDEN', 'BBQ_AREA', 'PLAYGROUND', 'PETS_ALLOWED', 'PRIVATE_BATHROOM', 'KITCHEN', 'AC', 'PARKING', 'FAMILY_ROOM'],
      ratingAvg: 4.8,
      ratingCount: 96,
      viewsCount: 12480,
      rules: ['يُمنع رفع الصوت بعد 12 ليلًا', 'التدخين مسموح في المناطق الخارجية فقط'],
    },
    {
      vendorId: vendorFarm.id,
      category: 'CHALET',
      title: 'شاليهات النخيل',
      slug: 'شاليهات-النخيل',
      summary: 'شاليهات خشبية بطراز عراقي عتيق، مثالية للعائلات الصغيرة.',
      description: 'ستة شاليهات خشبية بطراز عراقي عتيق، كل شاليه غرفتان وصالة ومطبخ صغير ومسبح خاص أمامي.',
      citySlug: 'baghdad',
      pricePerNight: 45000,
      pricePerHour: 8000,
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 1,
      areaSqm: 120,
      highlights: ["مسبح أمامي لكل شاليه","منطقة شواء خاصة","تصميم خشبي تقليدي","مطبخ صغير مجهّز"],
      badgeLabel: "سعر قابل للتفاوض",
      negotiable: true,
      amenities: ['POOL', 'BBQ_AREA', 'AC', 'PARKING', 'PRIVATE_BATHROOM', 'KITCHEN'],
      ratingAvg: 4.6,
      ratingCount: 61,
      viewsCount: 7320,
    },
    {
      vendorId: vendorFarm.id,
      category: 'FARM',
      title: 'مزرعة الوصل — تخييم صحراوي',
      slug: 'مزرعة-الوصل-تخييم-صحراوي',
      summary: 'تجربة تخييم صحراوي مع خيام مجهزة ووجبات مشوية تحت النجوم.',
      description: 'موقع تخييم صحراوي على بعد ساعة من بغداد، يضم خيام بدوشات تقليدية، مطبخ صحراوي، وجولات ليلية في العيدان.',
      citySlug: 'baghdad',
      pricePerNight: 35000,
      pricePerDay: 28000,
      bookingMode: 'DAY',
      maxGuests: 30,
      bedrooms: 15,
      bathrooms: 8,
      areaSqm: 5000,
      amenities: ['BBQ_AREA', 'GARDEN', 'PARKING', 'SAFARI'],
      ratingAvg: 4.4,
      ratingCount: 42,
      viewsCount: 5120,
      status: 'PENDING_REVIEW',
    },
    {
      vendorId: vendorFarm2.id,
      category: 'FARM',
      title: 'مزرعة السنا — مزرعة عائلية',
      slug: 'مزرعة-السنا-عائلية',
      summary: 'مزرعة عائلية بمساحات خضراء واسعة ومناطق ألعاب للأطفال.',
      description: 'منشأة ترفيهية عائلية في أربيل تضم حديقة نباتية، منطقة ألعاب أطفال، حظائر حيوانات، ومبنى استقبال.',
      citySlug: 'erbil',
      pricePerNight: 60000,
      pricePerHour: 10000,
      maxGuests: 40,
      bedrooms: 10,
      bathrooms: 8,
      areaSqm: 3000,
      highlights: ["حديقة نباتية واسعة","منطقة ألعاب للأطفال","حظائر حيوانات","مبنى استقبال مجهّز"],
      badgeLabel: "عرض العائلة",
      negotiable: true,
      amenities: ['GARDEN', 'PLAYGROUND', 'FOOTBALL_PITCH', 'BBQ_AREA', 'PARKING', 'FAMILY_ROOM', 'PETS_ALLOWED'],
      ratingAvg: 4.5,
      ratingCount: 73,
      viewsCount: 9010,
    },
    {
      vendorId: vendorFarm2.id,
      category: 'REST',
      title: 'استراحة زاخو — وادي المنحدرات',
      slug: 'استراحة-زاخو',
      summary: 'استراحة جبلية بإطلالة خلابة ودرجة حرارة معتدلة طوال العام.',
      description: 'استراحة على سفح جبال زاخو بإطلالة على وادي عميق، شواء، مقاعد حجرية، وأرضيات مناسبة للمبيت.',
      citySlug: 'erbil',
      pricePerNight: 40000,
      pricePerHour: 6500,
      maxGuests: 18,
      bedrooms: 5,
      bathrooms: 3,
      areaSqm: 800,
      highlights: ["إطلالة على وادي عميق","مسارات مشي وسط الطبيعة","مقاعد حجرية","تربة مناسبة للمبيت"],
      badgeLabel: "خصم 10%",
      negotiable: false,
      amenities: ['MOUNTAIN_VIEW', 'GARDEN', 'BBQ_AREA', 'PARKING'],
      ratingAvg: 4.3,
      ratingCount: 38,
      viewsCount: 4210,
    },
    {
      vendorId: vendorHotel.id,
      category: 'HOTEL',
      title: 'فندق الرافدين',
      slug: 'فندق-الرافدين-بغداد',
      summary: 'فندق 4 نجوم في قلب بغداد بإطلالة على النهر ومسبح وخدمة سبا.',
      description:
        'يقع فندق الرافدين في منطقة زيونة على ضفاف دجلة، ويضم 90 غرفة فندقية مجهزة، مسبح داخلي، مطعمين، قاعات مؤتمرات، وخدمة سبا.',
      citySlug: 'baghdad',
      pricePerNight: 125000,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 42,
      starRating: 4,
      highlights: ["مسبح داخلي","مطعمان بخدمة غرف","قاعات مؤتمرات","مركز سبا"],
      badgeLabel: "إقامة وإفطار",
      negotiable: true,
      amenities: ['POOL', 'WIFI', 'AC', 'PARKING', 'KITCHEN', 'FAMILY_ROOM', 'SEA_VIEW'],
      ratingAvg: 4.6,
      ratingCount: 245,
      viewsCount: 21030,
    },
    {
      vendorId: vendorHotel.id,
      category: 'HOTEL',
      title: 'فندق الرافدين الشاطئ — البصرة',
      slug: 'فندق-الرافدين-البصرة',
      summary: 'فندق بإطلالة على شط العرب وخدمة غرف على مدار الساعة.',
      description: 'فندق حديث في قلب البصرة بإطلالة بانورامية على شط العرب، مطعم بحري، ونقل للمطار.',
      citySlug: 'basra',
      pricePerNight: 95000,
      maxGuests: 3,
      bedrooms: 1,
      bathrooms: 1,
      areaSqm: 34,
      starRating: 4,
      highlights: ["إطلالة على شط العرب","مطعم بحري","نقل من المطار","خدمة على مدار الساعة"],
      badgeLabel: "إلغاء مجاني",
      negotiable: true,
      amenities: ['WIFI', 'AC', 'PARKING', 'SEA_VIEW', 'KITCHEN'],
      ratingAvg: 4.4,
      ratingCount: 118,
      viewsCount: 8940,
    },
    {
      vendorId: vendorHotel.id,
      category: 'APARTMENT',
      title: 'شقق دجلة السكنية',
      slug: 'شقق-دجلة-السكنية',
      summary: 'شقق فندقية مفروشة بالكامل مناسبة للإقامات الطويلة.',
      description: 'خمس شقق مفروشة بالكامل في برج سكني حديث، تحتوي مطبخًا كاملًا وغسالة ومكيفات.',
      citySlug: 'baghdad',
      pricePerNight: 55000,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 110,
      highlights: ["مطبخ كامل","غسالة ومجففة","مكيفات مركزية","إطلالة على النهر"],
      badgeLabel: "إقامة شهرية",
      negotiable: true,
      amenities: ['WIFI', 'AC', 'KITCHEN', 'PARKING', 'FAMILY_ROOM'],
      ratingAvg: 4.2,
      ratingCount: 67,
      viewsCount: 5620,
    },
  ];

  for (const p of propertySeeds) {
    const property = await prisma.property.create({
      data: {
        vendorId: p.vendorId,
        category: p.category,
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        description: p.description,
        cityId: city(p.citySlug).id,
        address: `${p.citySlug} — العراق`,
        latitude: city(p.citySlug).latitude ?? undefined,
        longitude: city(p.citySlug).longitude ?? undefined,
        starRating: p.starRating,
        currency: 'IQD',
        pricePerNight: p.pricePerNight,
        pricePerHour: p.pricePerHour,
        pricePerDay: p.pricePerDay,
        bookingMode: p.bookingMode ?? 'NIGHT',
        minNights: p.category === 'FARM' ? 1 : 1,
        maxGuests: p.maxGuests,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        areaSqm: p.areaSqm,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amenities: p.amenities,
        highlights: p.highlights ?? [],
        badgeLabel: p.badgeLabel ?? null,
        negotiable: p.negotiable ?? false,
        rules: p.rules ?? ['التدخين داخل المبنى ممنوع'],
        isInstantBook: p.isInstantBook ?? true,
        hasVideo: true,
        status: p.status ?? 'PUBLISHED',
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        viewsCount: p.viewsCount,
        publishedAt: new Date(),
      },
    });

    // الصور — معرض احترافي مصنّف حسب نوع العقار
    const imageCount = p.category === 'HOTEL' || p.category === 'APARTMENT' ? 8 : 6;
    const propertyGallery = gallery(p.category, imageCount);
    for (let i = 0; i < propertyGallery.length; i++) {
      const media = await prisma.media.create({
        data: {
          url: propertyGallery[i],
          type: 'IMAGE',
          width: 1200,
          height: 800,
          sortOrder: i,
        },
      });
      await prisma.propertyImage.create({
        data: { propertyId: property.id, mediaId: media.id, sortOrder: i },
      });
    }

    // أنواع الغرف
    if (['HOTEL', 'APARTMENT', 'CHALET', 'FARM', 'REST'].includes(p.category)) {
      const roomNames =
        p.category === 'HOTEL'
          ? ['غرفة مفردة', 'غرفة مزدوجة', 'جناح عائلي']
          : p.category === 'APARTMENT'
            ? ['شقة بغرفتين', 'شقة بثلاث غرف']
            : p.category === 'CHALET'
              ? ['شاليه عائلي', 'شاليه شخصي']
                : p.category === 'FARM'
                  ? ['غرفة مزدوجة', 'غرفة عائلية', 'خيمة VIP']
                  : ['مبيت مفرد', 'مبيت عائلي'];
      for (const [i, name] of roomNames.entries()) {
        const room = await prisma.roomType.create({
          data: {
            propertyId: property.id,
            name,
            description: `${name} مع إطلالة مميزة وخدمة يومية.`,
            bedType: i === 0 ? 'سرير مفرد' : i === 1 ? 'سرير مزدوج' : 'سريران مزدوجان',
            maxGuests: Math.min(p.maxGuests, 2 + i * 2),
            pricePerNight: p.pricePerNight + i * 25000,
            currency: 'IQD',
            breakfastIncluded: p.category === 'HOTEL',
            totalRooms: 10 + i * 5,
            availableRooms: 10 + i * 5,
            amenities: ['WIFI', 'AC'],
            isRefundable: true,
          },
        });
        const roomGallery = gallery(p.category, 6);
        for (let j = 0; j < 3; j++) {
          const media = await prisma.media.create({
            data: { url: roomGallery[(i * 3 + j) % roomGallery.length], type: 'IMAGE' },
          });
          await prisma.roomTypeImage.create({ data: { roomTypeId: room.id, mediaId: media.id, sortOrder: j } });
        }
      }
    }

    // عروض موسمية
    await prisma.seasonalOffer.createMany({
      data: [
        {
          propertyId: property.id,
          title: 'عرض نهاية الأسبوع',
          discountPercent: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 86400000),
        },
      ],
    });
  }

  // ─────────────── الطيران ───────────────
  const airlineRows: Prisma.AirlineCreateManyInput[] = [
    { iataCode: 'IA', nameAr: 'الخطوط الجوية العراقية', nameEn: 'Iraqi Airways' },
    { iataCode: 'FZ', nameAr: 'فلاي دبي', nameEn: 'flydubai' },
    { iataCode: 'EK', nameAr: 'طيران الإمارات', nameEn: 'Emirates' },
    { iataCode: 'QR', nameAr: 'طيران قطر', nameEn: 'Qatar Airways' },
    { iataCode: 'TK', nameAr: 'الخطوط التركية', nameEn: 'Turkish Airlines' },
    { iataCode: 'KU', nameAr: 'الخطوط الكويتية', nameEn: 'Kuwait Airways' },
    { iataCode: 'SV', nameAr: 'الخطوط السعودية', nameEn: 'Saudia' },
  ];
  await prisma.airline.createMany({ data: airlineRows });
  const airlines = await prisma.airline.findMany();
  const al = (code: string) => airlines.find((a) => a.iataCode === code)!;

  const flightPairs: Array<[string, string, string, number, number]> = [
    ['BGW', 'DOH', 'IA', 185000, 420000],
    ['BGW', 'DXB', 'FZ', 165000, 390000],
    ['BGW', 'RUH', 'SV', 210000, 470000],
    ['BGW', 'IST', 'TK', 225000, 520000],
    ['BGW', 'EBL', 'IA', 45000, 120000],
    ['BSR', 'BGW', 'IA', 38000, 105000],
    ['EBL', 'BGW', 'IA', 42000, 115000],
    ['BGW', 'KWI', 'KU', 150000, 340000],
    ['BGW', 'AMM', 'SV', 195000, 440000],
    ['BGW', 'CAI', 'EK', 250000, 580000],
  ];

  let flightIdx = 0;
  for (const [from, to, airlineCode, economy, business] of flightPairs) {
    const dep = new Date();
    dep.setDate(dep.getDate() + 1 + (flightIdx % 7));
    dep.setHours(6 + (flightIdx % 12), 15, 0, 0);
    const arr = new Date(dep.getTime() + (120 + flightIdx * 17) * 60000);

    await prisma.flight.create({
      data: {
        flightNumber: `${al(airlineCode).iataCode}${100 + flightIdx}`,
        airlineId: al(airlineCode).id,
        fromAirportId: apt(from).id,
        toAirportId: apt(to).id,
        departureTime: dep,
        arrivalTime: arr,
        durationMinutes: (arr.getTime() - dep.getTime()) / 60000,
        stops: flightIdx % 3 === 0 ? 1 : 0,
        cabinPrices: { ECONOMY: economy, BUSINESS: business, FIRST: business * 1.6 },
        baggageAllowance: 25,
        currency: 'IQD',
        status: 'SCHEDULED',
      },
    });
    flightIdx++;
  }

  // ─────────────── السيارات ───────────────
  const carSeeds: Array<{
    category: 'ECONOMY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'LUXURY' | 'VAN' | 'FAMILY';
    make: string;
    model: string;
    year: number;
    seats: number;
    luggage: number;
    dailyRate: number;
    withDriver: boolean;
    fuelType?: 'PETROL' | 'DIESEL' | 'HYBRID';
  }> = [
    { category: 'ECONOMY', make: 'تويوتا', model: 'كارس', year: 2023, seats: 5, luggage: 2, dailyRate: 35000, withDriver: false },
    { category: 'COMPACT', make: 'هيونداي', model: 'أكسنت', year: 2024, seats: 5, luggage: 2, dailyRate: 42000, withDriver: false },
    { category: 'SEDAN', make: 'تويوتا', model: 'كامري', year: 2024, seats: 5, luggage: 3, dailyRate: 65000, withDriver: true },
    { category: 'SUV', make: 'شيفروليه', model: 'تاهو', year: 2023, seats: 7, luggage: 4, dailyRate: 95000, withDriver: true },
    { category: 'LUXURY', make: 'مرسيدس', model: 'E-Class', year: 2025, seats: 5, luggage: 3, dailyRate: 180000, withDriver: true },
    { category: 'VAN', make: 'تويوتا', model: 'Hiace', year: 2022, seats: 12, luggage: 6, dailyRate: 85000, withDriver: true },
    { category: 'FAMILY', make: 'نيسان', model: 'باترول', year: 2024, seats: 8, luggage: 5, dailyRate: 120000, withDriver: false },
  ];

  for (const [i, c] of carSeeds.entries()) {
    const car = await prisma.car.create({
      data: {
        vendorId: vendorCars.id,
        category: c.category,
        make: c.make,
        model: c.model,
        year: c.year,
        color: ['أبيض', 'أسود', 'فضي', 'رمادي'][i % 4],
        plateNumber: `العراق ${10000 + i * 7}`,
        transmission: 'AUTOMATIC',
        fuelType: c.fuelType ?? 'PETROL',
        seats: c.seats,
        luggage: c.luggage,
        dailyRate: c.dailyRate,
        currency: 'IQD',
        airportPickup: true,
        withDriver: c.withDriver,
        freeKmPerDay: 250,
        minRentalDays: 1,
        status: 'PUBLISHED',
        ratingAvg: 4.4,
        ratingCount: 30 + i * 7,
      },
    });
    const carGallery = gallery('CAR', 8);
    for (let j = 0; j < 4; j++) {
      const media = await prisma.media.create({
        data: { url: carGallery[(i * 4 + j) % carGallery.length], type: 'IMAGE' },
      });
      await prisma.carImage.create({ data: { carId: car.id, mediaId: media.id, sortOrder: j } });
    }
  }

  // ─────────────── الرحلات السياحية ───────────────
  const tripSeeds: Array<{
    type: 'MARINE' | 'SAFARI' | 'MOUNTAIN' | 'HERITAGE' | 'DESERT' | 'CITY';
    title: string;
    summary: string;
    description: string;
    citySlug: string;
    durationDays: number;
    pricePerPerson: number;
    maxGuests: number;
    includes: string[];
  }> = [
    {
      type: 'MARINE',
      title: 'رحلة بحرية على أمواج الخليج',
      summary: 'رحلة يوم كامل من العمارة على بحر العرب مع غروب وشواء.',
      description: 'انطلق من ميناء العمارة في رحلة بحرية مدتها 7 ساعات تشمل وجبة غداء على متن الباخرة وأنشطة مائية وعرض غروب.',
      citySlug: 'basra',
      durationDays: 1,
      pricePerPerson: 120000,
      maxGuests: 40,
      includes: ['وجبة غداء', 'مشروبات', 'معدات سباحة', 'مرشد سياحي', 'نقل من بغداد'],
    },
    {
      type: 'SAFARI',
      title: 'سفاري أهواز الجنوب',
      summary: 'جولة بالقارب في أهواز جنوب العراق لمشاهدة الطيور المهاجرة.',
      description: 'رحلة صباحية في أهواز الجنوب لمشاهدة الطيور المهاجرة والنباتات المائية مع مرشد متخصص.',
      citySlug: 'basra',
      durationDays: 1,
      pricePerPerson: 85000,
      maxGuests: 12,
      includes: ['مرشد متخصص', 'عدسات مراقبة', 'وجبة خفيفة', 'تأمين'],
    },
    {
      type: 'MOUNTAIN',
      title: 'رحلة جبال زاخو',
      summary: 'مبيت في قلب الجبال مع شواء وضيافة كردية أصيلة.',
      description: 'رحلة يومين إلى زاخو عبر طريق جبلي مع إطلالات مذهلة، ومبيت في بيت ريفي مع ضيافة ومشاوي.',
      citySlug: 'erbil',
      durationDays: 2,
      pricePerPerson: 175000,
      maxGuests: 16,
      includes: ['إقامة ليلة', 'ثلاث وجبات', 'نقل 4x4', 'مرشد محلي', 'تأمين'],
    },
    {
      type: 'HERITAGE',
      title: 'جولة أهل الحكمة — النجف وكربلاء',
      summary: 'زيارة المعالم الدينية والتاريخية مع مرشد ديني.',
      description: 'برنامج ليلي كامل لزيارة النجف الأشرف وكربلاء مع مرشد ديني وضيافة وتنظيم المواعيد.',
      citySlug: 'najaf',
      durationDays: 1,
      pricePerPerson: 45000,
      maxGuests: 45,
      includes: ['نقل مكيف', 'مرشد ديني', 'ضيافة', 'تنسيق المواعيد'],
    },
    {
      type: 'DESERT',
      title: 'ليلتان في صحراء السماوة',
      summary: 'تجربة صحراوية أصيلة مع خيام بدوية وشواء تحت النجوم.',
      description: 'خروج من النجف إلى صحراء السماوة، مبيت في مخيم بدوي، مع سهرة شواء وحكايات تحت النجوم.',
      citySlug: 'najaf',
      durationDays: 2,
      pricePerPerson: 130000,
      maxGuests: 20,
      includes: ['مبيت في خيمة', 'وجبات', 'نقل 4x4', 'مرشد صحراوي', 'تأمين'],
    },
    {
      type: 'CITY',
      title: 'بغداد القديمة — جولة في قلب المدينة',
      summary: 'جولة مشي في شوارع بغداد التاريخية مع مرشد محلي.',
      description: 'جولة نصف يوم في بغداد القديمة تشمل ساحة التحرير، شارع المتنبي، ومقهى تراثي مع قصص من أهل بغداد.',
      citySlug: 'baghdad',
      durationDays: 1,
      pricePerPerson: 35000,
      maxGuests: 20,
      includes: ['مرشد محلي', 'تذاكر المتاحف', 'قهوة وتمر', 'نقل'],
    },
  ];

  for (const [i, t] of tripSeeds.entries()) {
    const slug = t.title
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
      .slice(0, 60);
    const trip = await prisma.trip.create({
      data: {
        vendorId: vendorAgency.id,
        type: t.type,
        title: t.title,
        slug,
        summary: t.summary,
        description: t.description,
        cityId: city(t.citySlug).id,
        durationDays: t.durationDays,
        pricePerPerson: t.pricePerPerson,
        currency: 'IQD',
        maxGuests: t.maxGuests,
        minGuests: 1,
        includes: t.includes,
        meetingPoint: `مقابل مدخل ${city(t.citySlug).nameAr} المركزي`,
        status: 'PUBLISHED',
        ratingAvg: 4.7,
        ratingCount: 25 + Math.floor(Math.random() * 40),
      },
    });
    const tripGallery = gallery('TRIP', 8);
    for (let j = 0; j < 5; j++) {
      const media = await prisma.media.create({
        data: { url: tripGallery[(i * 5 + j) % tripGallery.length], type: 'IMAGE' },
      });
      await prisma.tripImage.create({ data: { tripId: trip.id, mediaId: media.id, sortOrder: j } });
    }
  }

  // ─────────────── الكوبونات ───────────────
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        title: 'خصم ترحيبي 10%',
        description: 'خصم 10% على أول حجز لك',
        type: 'PERCENT',
        value: 10,
        maxDiscount: 50000,
        minOrderAmount: 50000,
        appliesTo: [],
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 86400000),
        validTo: new Date(Date.now() + 365 * 86400000),
      },
      {
        code: 'FRIDAY20',
        title: 'عروض الجمعة',
        description: 'خصم 20% على حجوزات يوم الجمعة',
        type: 'PERCENT',
        value: 20,
        maxDiscount: 150000,
        minOrderAmount: 100000,
        appliesTo: ['FARM', 'CHALET', 'REST'],
        perUserLimit: 3,
        validFrom: new Date(Date.now() - 86400000),
        validTo: new Date(Date.now() + 120 * 86400000),
      },
      {
        code: 'EID25',
        title: 'عرض العيد 25%',
        description: 'خصم 25% احتفالًا بالعيد على كل الحجوزات',
        type: 'PERCENT',
        value: 25,
        maxDiscount: 250000,
        minOrderAmount: 150000,
        appliesTo: [],
        perUserLimit: 2,
        validFrom: new Date(Date.now() - 86400000),
        validTo: new Date(Date.now() + 60 * 86400000),
      },
      {
        code: 'FARM5000',
        title: 'خصم ثابت 5000 د.ع على المزارع',
        type: 'FIXED',
        value: 5000,
        minOrderAmount: 40000,
        appliesTo: ['FARM'],
        perUserLimit: 5,
        validFrom: new Date(Date.now() - 86400000),
        validTo: new Date(Date.now() + 90 * 86400000),
      },
    ],
  });

  // ─────────────── البانرات ───────────────
  await prisma.banner.createMany({
    data: [
      {
        title: 'عروض نهاية الأسبوع',
        subtitle: 'خصومات تصل إلى 25% على المزارع والشاليهات',
        imageUrl: coverFor('hero', 0, 1600, 700),
        linkUrl: '/search?category=FARM',
        sortOrder: 1,
      },
      {
        title: 'رحلاتنا إلى زاخو',
        subtitle: 'مبيت وضيافة كردية أصيلة',
        imageUrl: coverFor('hero', 3, 1600, 700),
        linkUrl: '/trips',
        sortOrder: 2,
      },
      {
        title: 'احجز رحلتك بالدينار',
        subtitle: 'ادفع من محفظتك أو بالبطاقة أو زين كاش',
        imageUrl: coverFor('hero', 5, 1600, 700),
        linkUrl: '/wallet',
        sortOrder: 3,
      },
    ],
  });

  // ─────────────── حجوزات وتقييمات تجريبية ───────────────
  const published = await prisma.property.findMany({
    where: { status: 'PUBLISHED' },
    include: { roomTypes: true },
  });

const commentPool = [
    'مكان ممتاز ونظيف، الخدمة كانت رائعة والضيافة كريمة. سنكرر الزيارة.',
    'تجربة لا تُنسى، الموقع قريب والحجز كان سهلًا وسريعًا.',
    'الإطلالة كانت رائعة والمسبح ممتاز للعائلة. تستحق السعر.',
    'خدمة الاستقبال ممتازة والطعام العراقي لذيذ — سنعيدها مرة ثانية.',
    'جيدة جدًا لكن الإنترنت كان ضعيفًا قليلًا. عمومًا ممتاز للعائلات.',
  ];

  let bookingCounter = 1;
  for (const property of published.slice(0, 5)) {
    for (let i = 0; i < 2; i++) {
      const customer = customers[bookingCounter % customers.length];
      const checkIn = new Date(Date.now() - (20 + bookingCounter * 3) * 86400000);
      const checkOut = new Date(checkIn.getTime() + 2 * 86400000);
      const subtotal = Number(property.pricePerNight) * 2;
      const commission = Math.round(subtotal * 0.12);
      const code = `BK-SEED-${String(bookingCounter).padStart(4, '0')}`;

      const booking = await prisma.booking.create({
        data: {
          code,
          customerId: customer.id,
          vendorId: property.vendorId,
          propertyId: property.id,
          roomTypeId: property.roomTypes[0]?.id,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          checkIn,
          checkOut,
          guests: 4,
          units: 1,
          nights: 2,
          subtotal,
          discount: 0,
          commission,
          total: subtotal,
          currency: 'IQD',
          pointsEarned: subtotal,
          createdAt: checkIn,
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          provider: 'WALLET',
          method: 'WALLET',
          amount: subtotal,
          currency: 'IQD',
          status: 'PAID',
          transactionRef: `TXN-${code}`,
          paidAt: checkIn,
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          propertyId: property.id,
          rating: [5, 4, 5, 4, 5][bookingCounter % 5],
          comment: commentPool[bookingCounter % commentPool.length],
          cleanliness: 5,
          service: 4,
          location: 5,
          value: 4,
          vendorReply: 'شكرًا لزيارتكم، سعداء بخدمتكم ونتمنى لكم رحلة سعيدة.',
        },
      });

      await prisma.loyaltyEntry.create({
        data: {
          userId: customer.id,
          bookingId: booking.id,
          type: 'EARN',
          points: subtotal,
          description: `نقاط حجز ${code}`,
        },
      });

      bookingCounter++;
    }
  }

  await prisma.notification.createMany({
    data: customers.map((c) => ({
      userId: c.id,
      type: 'WELCOME',
      title: 'أهلًا بك في Bookly',
      body: 'استخدم كود WELCOME10 للحصول على خصم 10% على أول حجز.',
      isRead: false,
    })),
  });

  await prisma.setting.createMany({
    data: [
      { key: 'support.phone', value: '+964 770 000 0000' },
      { key: 'support.whatsapp', value: '+964 770 000 0000' },
      { key: 'support.email', value: 'support@bookly.app' },
      { key: 'app.commission', value: { farm: 12, hotel: 10, car: 10, flight: 3, trip: 12 } },
      { key: 'app.locales', value: ['ar', 'en'] },
      { key: 'app.currencies', value: ['IQD', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'EGP', 'USD', 'EUR'] },
    ],
  });

  const counts = {
    countries: await prisma.country.count(),
    cities: await prisma.city.count(),
    airports: await prisma.airport.count(),
    users: await prisma.user.count(),
    vendors: await prisma.vendorProfile.count(),
    properties: await prisma.property.count(),
    flights: await prisma.flight.count(),
    cars: await prisma.car.count(),
    trips: await prisma.trip.count(),
    bookings: await prisma.booking.count(),
    reviews: await prisma.review.count(),
    coupons: await prisma.coupon.count(),
  };

  console.log('✅ تم تعبئة البيانات بنجاح:');
  console.table(counts);
  console.log('\n🔑 حسابات الدخول (كلمة المرور: Password@123):');
  console.log('  عميل: customer@bookly.app');
  console.log('  صاحب مزرعة: farm@bookly.app');
  console.log('  مدير فندق: hotel@bookly.app');
  console.log('  منظمة رحلات: trips@bookly.app');
  console.log('  تأجير سيارات: cars@bookly.app');
  console.log(`  إدارة: ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345'}`);
}

main()
  .catch((e) => {
    console.error('❌ فشل التعبئة:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
