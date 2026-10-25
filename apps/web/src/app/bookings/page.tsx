import { Suspense } from 'react';
import BookingsList from './bookings-list';

export const metadata = {
  title: 'حجوزاتي',
  description: 'تابع حجوزاتك في Bookly — تأكيد، دفع، إلغاء وتقييم.',
};

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="grid h-64 place-items-center">جارٍ التحميل…</div>}>
      <BookingsList />
    </Suspense>
  );
}
