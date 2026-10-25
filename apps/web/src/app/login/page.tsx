import { Suspense } from 'react';
import LoginForm from './login-form';

export const metadata = {
  title: 'تسجيل الدخول',
  description: 'سجّل الدخول إلى حسابك في Bookly لإدارة حجوزاتك ومفضلتك ومحفظتك.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid h-64 place-items-center">جارٍ التحميل…</div>}>
      <LoginForm />
    </Suspense>
  );
}
