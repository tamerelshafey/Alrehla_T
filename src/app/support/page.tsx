import { Metadata } from 'next';
import SupportClient from './SupportClient';
import { getCurrentUser } from '@/data/domains/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الدعم والمساعدة',
  description: 'تواصل مع فريق الدعم الفني لحل أي مشكلة أو للإجابة على استفساراتك.',
};

export default async function SupportPage() {
  const user = await getCurrentUser();
  return <SupportClient isSignedIn={user.role !== 'visitor'} />;
}
