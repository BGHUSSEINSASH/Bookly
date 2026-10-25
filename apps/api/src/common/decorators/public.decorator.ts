import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** يعمل فقط إذا كان المسار يتطلب تسجيل دخول (افتراضيًا كل شيء محمي) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
