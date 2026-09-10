import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getCreativeServices } from '@/data/mock';
import { ArrowLeft } from 'lucide-react';

import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function ServicesPage() {
  const services = await getCreativeServices();

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <Section containerClassName="pt-8 pb-12">
        <SectionHeader
          title="الخدمات الإبداعية المستقلة"
          
          description="خدمات فردية وسريعة لتطوير مهارات الكتابة، ومراجعة النصوص، وتوليد الأفكار، دون الالتزام ببرنامج طويل."
        />
      </Section>

      {/* Services Grid */}
      <Section containerClassName="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              accentColor="emerald"
              className="flex flex-col p-8"
            >
              <div className="mb-6 flex flex-col">
                <h3 className="mb-2 text-2xl font-black text-slate-800">
                  {service.name}
                </h3>
                <div className="text-lg font-black text-emerald-600">
                  {formatPrice(service.price)}
                </div>
              </div>
              <p className="mb-8 flex-1 text-sm leading-relaxed font-medium text-slate-600">
                {service.description}
              </p>
              <Button
                href="/creative-writing/booking"
                accentColor="emerald"
                className="mt-auto w-full py-3 text-center"
              >
                احجز الآن
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* Packages Link */}
      <Section containerClassName="pb-20">
        <Card accentColor="emerald" className="mx-auto w-full max-w-4xl p-8 text-center bg-slate-50">
          <h3 className="mb-4 text-xl font-bold text-slate-800">
            تبحث عن مسار متكامل بدل خدمة واحدة؟
          </h3>
          <Link
            href="/creative-writing/packages"
            className="inline-flex items-center gap-2 text-lg font-bold text-emerald-600 transition-all hover:gap-3"
          >
            استعرض الباقات <ArrowLeft className="h-5 w-5" />
          </Link>
        </Card>
      </Section>
    </PageContainer>
  );
}
