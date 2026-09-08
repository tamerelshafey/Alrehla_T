import { getCurrentUser } from '@/data/mock';
import { CheckoutClient } from './CheckoutClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in?callbackUrl=/enha-lak/checkout');
  }

  // We pass the user to the client component to pre-fill info
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">إتمام الطلب والدفع</h1>
        <p className="mt-2 text-slate-600">أكمل بياناتك وأختر طريقة الدفع المناسبة لإتمام طلبك.</p>
      </div>

      <CheckoutClient user={user} />
    </div>
  );
}
