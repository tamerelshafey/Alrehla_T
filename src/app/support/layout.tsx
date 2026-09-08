import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مركز المساعدة والدعم الفني',
  description: 'تواصل مع فريق الدعم الفني لحل أي مشكلة أو للإجابة على استفساراتك.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
