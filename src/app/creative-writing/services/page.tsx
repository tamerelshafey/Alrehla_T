import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileEdit, Video, BookOpen, MessageCircle, Compass, Headphones } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Section } from '@/components/ui/Section';

const serviceCategories = [
  {
    title: 'مراجعات',
    icon: FileEdit,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-100',
    services: [
      {
        id: 'review-1',
        title: 'مراجعة نص',
        description: 'مراجعة لغوية وفنية لقصة الطفل.',
        price: 650,
        priceType: 'starts_from',
        ctaText: 'عرض مقدمي الخدمة',
        ctaLink: '/creative-writing/instructors',
      }
    ]
  },
  {
    title: 'قصص فيديو',
    icon: Video,
    color: 'bg-rose-50 text-rose-600',
    borderColor: 'border-rose-100',
    services: [
      {
        id: 'video-1',
        title: 'فيديو قصة',
        description: 'فيديو لقصتك',
        price: 1250,
        priceType: 'fixed',
        ctaText: 'اطلب الآن',
        ctaLink: '/creative-writing/booking/confirm',
      }
    ]
  },
  {
    title: 'نشر',
    icon: BookOpen,
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-100',
    services: [
      {
        id: 'publish-1',
        title: 'نشر قصة',
        description: 'انشر قصتك داخل احد انتجاتنا',
        price: 2450,
        priceType: 'fixed',
        ctaText: 'اطلب الآن',
        ctaLink: '/creative-writing/booking/confirm',
      },
      {
        id: 'publish-2',
        title: 'نشر كتابك الخاص',
        description: 'نشر كتابك الخاص',
        price: 8450,
        priceType: 'fixed',
        ctaText: 'اطلب الآن',
        ctaLink: '/creative-writing/booking/confirm',
      }
    ]
  },
  {
    title: 'استشارات',
    icon: MessageCircle,
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-100',
    services: [
      {
        id: 'consult-1',
        title: 'استشارة تربوية',
        description: 'جلسة استشارة لولي الأمر. جلسة استشارة لولي الأمر.',
        price: 650,
        priceType: 'starts_from',
        ctaText: 'عرض مقدمي الخدمة',
        ctaLink: '/creative-writing/instructors',
      }
    ]
  },
  {
    title: 'مغامرات',
    icon: Compass,
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'border-purple-100',
    services: [
      {
        id: 'adv-1',
        title: 'تهههح',
        description: 'مغامرة إبداعية مخصصة',
        price: 230,
        priceType: 'fixed',
        ctaText: 'اطلب الآن',
        ctaLink: '/creative-writing/booking/confirm',
      }
    ]
  },
  {
    title: 'قصص مسموعة',
    icon: Headphones,
    color: 'bg-sky-50 text-sky-600',
    borderColor: 'border-sky-100',
    services: [
      {
        id: 'audio-1',
        title: 'قصة مسموعة',
        description: 'قصة مسموعة',
        price: 590,
        priceType: 'starts_from',
        ctaText: 'عرض مقدمي الخدمة',
        ctaLink: '/creative-writing/instructors',
      }
    ]
  }
];

export default function ServicesPage() {
  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <Section containerClassName="pt-16 pb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          الخدمات الإبداعية
        </h1>
        <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed">
          خدمات مصممة خصيصاً لدعم رحلة طفلك الإبداعية في كل خطوة، سواء كان مشتركاً في برامجنا أم لا.
        </p>
      </Section>

      {/* Services Categories */}
      <Section containerClassName="mx-auto w-full max-w-6xl pb-24 space-y-16">
        {serviceCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.title} className="relative">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${category.color}`}>
                  <CategoryIcon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-800">{category.title}</h2>
              </div>
              
              {/* Category Services Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <div 
                    key={service.id} 
                    className={`flex flex-col rounded-3xl border-2 ${category.borderColor} bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="mb-6 flex-1">
                      <h3 className="mb-3 text-2xl font-black text-slate-800">
                        {service.title}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed text-slate-600 min-h-[40px]">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto border-t border-slate-100 pt-6">
                      <div className="mb-6 flex flex-col items-center text-center">
                        <span className="text-sm font-bold text-slate-500 mb-1">
                          {service.priceType === 'starts_from' ? 'يبدأ من' : 'السعر'}
                        </span>
                        <span className={`text-3xl font-black ${category.color.split(' ')[1]}`}>
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      
                      <Link 
                        href={service.ctaLink}
                        className={`group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition-colors ${
                          service.priceType === 'starts_from' 
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                            : 'bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-amber-500/20'
                        }`}
                      >
                        {service.ctaText}
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      {/* Packages Link */}
      <Section containerClassName="pb-24">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm">
          <h3 className="mb-4 text-2xl font-black text-slate-800">
            تبحث عن مسار متكامل بدل خدمة واحدة؟
          </h3>
          <p className="mb-8 text-slate-600 font-medium">استكشف باقات الكتابة الإبداعية المصممة لبناء مهارات متكاملة على مدار فترة أطول.</p>
          <Link
            href="/creative-writing/packages"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg"
          >
            استعرض باقات الكتابة <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </Section>
    </PageContainer>
  );
}
