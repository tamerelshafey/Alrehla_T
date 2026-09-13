import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { getStandaloneServices, getProvidersForService } from '@/data/domains/services';

export const dynamic = 'force-dynamic';

/**
 * The instructors who provide one creative service, cheapest first.
 * Only approved, active offers appear — enforced here and again by row-level
 * security on instructor_services.
 */
export default async function ServiceProvidersPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const services = await getStandaloneServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) notFound();

  const providers = await getProvidersForService(serviceId);

  return (
    <PageContainer>
      <Section containerClassName="mx-auto w-full max-w-4xl pt-16 pb-10">
        <Link
          href="/creative-writing/services"
          className="mb-8 inline-flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4 rotate-180" />
          كل الخدمات الإبداعية
        </Link>

        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          مقدمو خدمة: {service.name}
        </h1>
        <p className="mt-4 text-lg font-medium leading-relaxed text-slate-600">
          {service.description}
        </p>
        <p className="mt-2 text-sm font-bold text-slate-400">
          اختر المدرب الذي يناسبك. السعر يختلف من مدرب لآخر.
        </p>
      </Section>

      <Section containerClassName="mx-auto w-full max-w-4xl pb-24">
        {providers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center">
            <p className="text-lg font-bold text-slate-500">
              لا يوجد مدربون متاحون لهذه الخدمة حالياً.
            </p>
            <p className="mt-2 text-slate-400">سيتم إضافة مقدمي الخدمة قريباً.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {providers.map((provider) => (
              <div
                key={provider.offerId}
                className="flex flex-wrap items-center gap-6 rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="min-w-[200px] flex-1">
                  <h2 className="text-xl font-black text-slate-800">{provider.displayName}</h2>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    {provider.bio}
                  </p>
                  {provider.yearsExperience > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Award className="h-4 w-4" />
                      {provider.yearsExperience} سنوات خبرة
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <span className="block text-sm font-bold text-slate-400">السعر</span>
                  <span className="text-3xl font-black text-emerald-600">
                    {formatPrice(provider.price)}
                  </span>
                </div>

                <Link
                  href={`/creative-writing/services/${serviceId}/order?instructor=${provider.instructorId}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-amber-600"
                >
                  اطلب من هذا المدرب
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
