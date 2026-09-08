import { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'الدعم والمساعدة',
  description: 'تواصل مع فريق الدعم الفني لحل أي مشكلة أو للإجابة على استفساراتك.',
};

export default function SupportPage() {
  return <SupportClient />;
}
