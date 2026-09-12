import { getPublishers } from '@/data/domains/products';
import { getInstructors } from '@/data/domains/writing';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';

const testimonials: any[] = [];

export default async function Home() {
  const publishers = await getPublishers();
  const activePublishers = publishers.filter((p: any) => p.status === 'active').slice(0, 4);
  const instructors = await getInstructors();
  const topInstructors = instructors.filter((i: any) => i.status === 'active').slice(0, 4);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Section containerClassName="relative overflow-hidden rounded-[3rem] bg-amber-50 shadow-2xl shadow-amber-900/5 p-0">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="mb-4 inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
              <Star className="ml-1.5 h-4 w-4" />
              منصة للكتابة والقراءة
            </div>
            <h1 className="mb-6 text-4xl leading-tight font-black text-slate-800 md:text-5xl lg:text-6xl">
              حيث تبدأ <span className="text-amber-500">الحكاية</span>، وتكتشف <span className="text-emerald-500">صوتك</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed font-medium text-slate-600">
              سواء كنت تبحث عن قصة تُنسج خصيصاً لطفلك ليكون بطلها، أو مساحة آمنة لاكتشاف صوته الإبداعي؛ في "الرحلة" تبدأ كل الحكايات.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/enha-lak" variant="primary" accentColor="amber">
                استكشف إنها لك
              </Button>
              <Button href="/creative-writing" variant="secondary" accentColor="amber" className="!border-none !bg-white !shadow-sm">
                بداية الرحلة
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <Image 
              src="https://picsum.photos/seed/hero3/800/800" 
              alt="طفل يقرأ كتاباً" 
              fill className="object-cover" referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-transparent"></div>
          </div>
        </div>
      </Section>

      {/* Pillars Section */}
      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <Link
            href="/enha-lak"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all duration-300 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              <Image 
                src="https://picsum.photos/seed/childreading/800/600" 
                alt="إنها لك" 
                fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="relative flex flex-1 flex-col p-8">
              <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-violet-50 transition-transform group-hover:scale-110"></div>
              <h3 className="relative z-10 mb-4 text-2xl font-bold text-violet-700">
                إنها لك
              </h3>
              <p className="relative z-10 leading-relaxed font-medium text-slate-600">
                قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً
                في اختيار الفكرة أو القيمة التي تُنسج حولها.
              </p>
            </div>
          </Link>
          <Link
            href="/creative-writing"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all duration-300 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              <Image 
                src="https://picsum.photos/seed/childwriting/800/600" 
                alt="بداية الرحلة" 
                fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="relative flex flex-1 flex-col p-8">
              <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-emerald-50 transition-transform group-hover:scale-110"></div>
              <h3 className="relative z-10 mb-4 text-2xl font-bold text-emerald-600">
                بداية الرحلة
              </h3>
              <p className="relative z-10 leading-relaxed font-medium text-slate-600">
                برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف
                أصواتهم الخاصة وتطوير مهاراتهم في السرد والتعبير.
              </p>
            </div>
          </Link>
        </div>
      </Section>

      
      {/* Featured Instructors */}
      <Section className="bg-slate-50 border-y border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">مدربون متميزون</h2>
            <p className="text-slate-500 font-medium max-w-2xl">نخبة من المدربين المتخصصين في الكتابة الإبداعية وتطوير مهارات السرد.</p>
          </div>
          <Button href="/creative-writing" variant="secondary" className="w-full md:w-auto">عرض جميع المدربين</Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topInstructors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : topInstructors.map((instructor: any) => (
            <div key={instructor.id} className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 relative h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-50">
                  <Image 
                    src={instructor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.displayName)}&background=10b981&color=fff`} 
                    alt={instructor.displayName} 
                    fill className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{instructor.displayName}</h3>
                <p className="text-sm font-medium text-slate-500 mb-4 line-clamp-2">{instructor.bio}</p>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                  ★ {instructor.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Publishers */}
      <Section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">شركاء "إنها لك"</h2>
            <p className="text-slate-500 font-medium max-w-2xl">دور نشر ومؤسسات إبداعية تقدم محتوى متميزاً قابل للتخصيص.</p>
          </div>
          <Button href="/enha-lak" variant="secondary" className="w-full md:w-auto">استكشف المكتبة</Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activePublishers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : activePublishers.map((publisher: any) => (
            <Link href={`/enha-lak/publisher/${publisher.slug}`} key={publisher.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col items-center text-center">
              <div className="mb-4 relative h-20 w-20 flex items-center justify-center">
                {publisher.logoUrl ? (
                  <Image 
                    src={publisher.logoUrl} 
                    alt={publisher.name} 
                    fill className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-black text-xl">
                    {publisher.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{publisher.name}</h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-2">{publisher.bio}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Our Story */}
      <Section containerClassName="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 p-0">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-64 lg:h-auto">
            <Image 
              src="https://picsum.photos/seed/familyreading/800/800" 
              alt="العائلة تقرأ معاً" 
              fill className="object-cover" referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 lg:to-white"></div>
          </div>
          <div className="flex flex-col justify-center p-8 text-right md:p-12 lg:p-16">
            <h2 className="mb-8 text-3xl font-black text-slate-800">
              قصتنا: من فكرة إلى رحلة
            </h2>
            <div className="mb-8 space-y-4 text-lg leading-relaxed font-medium text-slate-600">
              <p>
                كيف نحوّل الكتابة لدى الطفل من واجب إلى هواية؟ وكيف نساعده على أن
                يعثر على صوته بين الكلمات؟ من هذه الرغبة وُلدت «بداية الرحلة»؛ مساحة
                آمنة تبدأ فيها الحكاية من الداخل.
              </p>
              <p>
                وفي الجهة الأخرى، وُلدت «إنها لك» من حكاية تبحث عن بطلها، لتصل إليه
                حاملةً اسمه وشيئًا منه. ومع الوقت، أدركنا أن الحكاية لا يحدّها عُمر،
                فاتسعت مسارات المشروعين.
              </p>
              <p>
                ولأن القصة هي نواتهما المشتركة — مرةً تصل إلى صاحبها، ومرةً تنطلق من
                صوته — جمعناهما تحت اسم يتسع لكل بداية: «الرحلة».
              </p>
            </div>
            <div>
              <Button href="/about" variant="secondary" accentColor="amber" className="!border-slate-200 !text-slate-700 hover:!border-amber-400">
                تعرّف إلى رحلتنا
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          ماذا يقولون عنا؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col justify-between p-6">
              <div>
                <Quote className="mb-4 h-8 w-8 text-blue-200" />
                <p className="mb-6 leading-relaxed font-medium text-slate-600 italic">
                  "{testimonial.content}"
                </p>
              </div>
              <div>
                <div className="font-bold text-slate-800">
                  {testimonial.authorName}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {testimonial.authorRole}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Blog Teaser */}
      <Section containerClassName="max-w-4xl text-center">
        <h2 className="mb-6 text-3xl font-black text-slate-800">
          مساحة للإلهام
        </h2>
        <p className="mx-auto mb-8 max-w-2xl font-medium text-slate-500">
          نشارككم في مدونتنا مقالات تربوية، نصائح لتطوير الكتابة، وأفكاراً
          لتعزيز حب القراءة لدى الأبناء.
        </p>
        <Button href="/blog" variant="primary" accentColor="amber" className="!bg-slate-900 hover:!bg-slate-800">
          تصفح المدونة
        </Button>
      </Section>

      {/* Final CTA */}
      <Section containerClassName="max-w-4xl pb-20 text-center">
        <h2 className="mb-10 text-4xl font-black text-slate-900">
          هل أنت مستعد لتبدأ الرحلة؟
        </h2>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button href="/enha-lak" variant="primary" accentColor="amber" size="lg" className="!bg-blue-600 hover:!bg-blue-700 !shadow-blue-200">
            استكشف قصص "إنها لك"
          </Button>
          <Button href="/creative-writing/booking" variant="primary" accentColor="amber" size="lg">
            احجز مقعداً في "بداية الرحلة"
          </Button>
        </div>
      </Section>
    </div>
  );
}
