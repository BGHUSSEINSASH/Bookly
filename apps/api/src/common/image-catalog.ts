/**
 * مكتبة الصور — Unsplash
 * صور حقيقية منتقاة لكل فئة، مع معالجة لونية دافئة موحّدة للهوية البصرية.
 */

export const UNSPLASH = {
  /** مزارع واستراحات عائلية */
  farm: [
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
  /** شاليهات وكبائن خشبية */
  chalet: [
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
  /** فنادق وغرف فندقية */
  hotel: [
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
  /** شقق فندقية ومصممة */
  apartment: [
    'photo-1502672260266-1c1ef2d93688',
    'photo-1522708323590-d24dbb6b0267',
    'photo-1484154218962-a197022b5858',
    'photo-1556912173-3bb406ef7e77',
    'photo-1486406146926-c627a92ad1ab',
    'photo-1493809842364-78817add7ffb',
    'photo-1600607687920-4e2a09cf159d',
    'photo-1600566753190-17f0baa2a6c3',
  ],
  /** رحلات: بحر، صحراء، جبال، سفاري */
  trip: [
    'photo-1507525428034-b723cf961d3e',
    'photo-1509316785289-025f5b846b35',
    'photo-1476514525535-07fb3b4ae5f1',
    'photo-1469854523086-cc02fe5d8800',
    'photo-1516426122078-c23e76319801',
    'photo-1531761535209-180857e963b9',
    'photo-1500530855697-b586d89ba3ee',
    'photo-1548786811-dd6e453ccca7',
    'photo-1488646953014-85cb44e25828',
    'photo-1501785888041-af3ef285b470',
    'photo-1518684079-3c830dcef090',
    'photo-1523805009345-7448845a9e53',
    'photo-1518098268026-4e89f1a2cd8e',
    'photo-1504150558240-0b4fd8946624',
  ],
  /** سيارات */
  car: [
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
  /** بنر رئيسي ومناظر */
  hero: [
    'photo-1500382017468-9049fed747ef',
    'photo-1501785888041-af3ef285b470',
    'photo-1470071459604-3b5ec3a7fe05',
    'photo-1507525428034-b723cf961d3e',
    'photo-1469474968028-56623f02e42e',
    'photo-1441974231531-c6227db76b6e',
    'photo-1472214103451-9374bd1c798e',
    'photo-1502082553048-f009c37129b9',
  ],
  /** مقالات ونصائح */
  article: [
    'photo-1488646953014-85cb44e25828',
    'photo-1504674900247-0877df9cc836',
    'photo-1524995997946-a1c2e315a42f',
    'photo-1555396273-367ea4eb4db5',
    'photo-1547592180-85f173990554',
    'photo-1495521821757-a1efb6729352',
  ],
} as const;

export type ImageCategory = keyof typeof UNSPLASH;

/** رابط صورة بالحجم المطلوب من Unsplash — بمعالجة دافئة موحّدة */
export function photo(id: string, w = 1200, h = 800, q = 80): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}&sat=-12&exp=4`;
}

/** أعلى صورة في الفئة (للغلاف) */
export function coverFor(category: ImageCategory, index = 0, w = 1200, h = 800): string {
  const list = UNSPLASH[category] as readonly string[];
  const id = list[index % list.length];
  return photo(id, w, h);
}

/** قائمة صور لفئة معينة */
export function galleryFor(category: ImageCategory, count = 6, w = 1200, h = 800): string[] {
  const list = UNSPLASH[category] as readonly string[];
  return Array.from({ length: count }, (_, i) => photo(list[i % list.length], w, h));
}

/** فئة مناسبة لكل نوع عقار */
export const CATEGORY_IMAGE: Record<string, ImageCategory> = {
  FARM: 'farm',
  CHALET: 'chalet',
  REST: 'farm',
  HOTEL: 'hotel',
  APARTMENT: 'apartment',
};
