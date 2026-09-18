import React from 'react';
import { getPublishers } from '@/data/domains/products';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote, BookOpen, PenTool, Search, Wand2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { optimizedImageUrl, slotImageUrl, blurPlaceholder } from '@/lib/cloudinary';
import { getSiteSettings, getSiteContent, getTestimonials } from '@/data/domains/content';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { RichText } from '@/components/ui/RichText';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';

export async function generateMetadata() {
  const [settings, content] = await Promise.all([getSiteSettings(), getSiteContent()]);
  const name = settings.siteName?.trim() || 'الرحلة';
  return pageMetadata({
    title: `${name} · منصة الكتابة الإبداعية والقصص المخصصة`,
    titleAbsolute: true,
    description:
      content['home.hero.subtitle'] ||
      'منصة عربية لتعلّم الكتابة الإبداعية وتقديم قصص ومنتجات مخصصة للأطفال والشباب.',
    path: '/',
  });
}

/**
 * تلوين كلمتين في العنوان الرئيسي.
 *
 * العنوان بقى نصًا واحدًا قابلاً للتعديل من لوحة الإدارة، فالتلوين بقى
 * بالبحث عن الكلمتين: لو الإدارة غيّرت العنوان بالكامل، العنوان بيظهر
 * بلون واحد بدل ما يكسر.
 */
function HighlightedTitle({ title }: { title: string }) {
  const accents: [string, string][] = [
    ['الحكاية', 'text-amber-500'],
    ['صوتك', 'text-emerald-500'],
  ];
  const pattern = new RegExp(`(${accents.map(([w]) => w).join('|')})`, 'g');
  const parts = title.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const accent = accents.find(([word]) => word === part);
        return accent ? (
          <span key={i} className={accent[1]}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        );
      })}
    </>
  );
}

export default async function Home() {
  // Every image on this page used to come from picsum.photos — random stock
  // photographs standing in as the platform's own.
  const settings = await getSiteSettings();
  const content = await getSiteContent();
  // قسم آراء العملاء كان مربوطًا بمصفوفة فاضية مكتوبة في الكود، فكان بيقول
  // «قريبًا» دائمًا مهما كتبت الإدارة آراء في قاعدة البيانات.
  const testimonials = await getTestimonials();
  const publishers = await getPublishers();
  const activePublishers = publishers.filter((p: any) => p.status === 'active').slice(0, 4);
  const siteName = settings.siteName?.trim() || 'الرحلة';

  return (
    <div className="flex flex-col">
      {/* بيانات منظّمة: تعريف الجهة والموقع لمحركات البحث. */}
      <JsonLd
        data={[
          organizationSchema({
            name: siteName,
            description: content['home.hero.subtitle'] || '',
            logo: settings.images.logo
              ? slotImageUrl(settings.images.logo, 'logo')
              : undefined,
            email: settings.contactEmail || undefined,
            sameAs: [settings.facebookUrl, settings.instagramUrl],
          }),
          websiteSchema({ name: siteName }),
        ]}
      />

      {/* Hero Section */}
      <Section containerClassName="relative overflow-hidden rounded-[3rem] bg-amber-50 shadow-2xl shadow-amber-900/5 p-0">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="mb-4 inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
              <Star className="ml-1.5 h-4 w-4" />
              {content['home.hero.badge']}
            </div>
            <h1 className="mb-6 text-4xl leading-tight font-black text-slate-800 md:text-5xl lg:text-6xl">
              <HighlightedTitle title={content['home.hero.title']} />
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed font-medium text-slate-600">
              {content['home.hero.subtitle']}
            </p>
            <div className="flex flex-wrap gap-4">
              {/* الزرارين بنفس اللون وبنفس الفعل: القسمين متساويين في الأهمية،
                  فمفيش سبب إن واحد يبان أساسي والتاني ثانوي. */}
              <Button href="/enha-lak" variant="primary" accentColor="amber">
                {content['home.hero.cta1']}
              </Button>
              <Button href="/creative-writing" variant="primary" accentColor="amber">
                {content['home.hero.cta2']}
              </Button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            {settings.images.homeHero ? (
              <Image 
              src={slotImageUrl(settings.images.homeHero, 'homeHero')}
              alt="طفل يقرأ كتاباً"
              fill
              sizes="(max-width: 1024px) 0px, 50vw"
              priority
              placeholder={blurPlaceholder(settings.images.homeHero) ? 'blur' : 'empty'}
              blurDataURL={blurPlaceholder(settings.images.homeHero)}
              className="object-cover" referrerPolicy="no-referrer"
            />
            ) : (
              <ImagePlaceholder label="طفل يقرأ كتاباً" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-transparent"></div>
          </div>
        </div>
      </Section>

      {/* أقسامنا الرئيسية — كروت بنص وأيقونة بلا صور.
          الصور هنا كانت بتملا فراغ مش بتقول حاجة: عنوان القسم والشرح
          بيقولوا كل اللي محتاج يتقال. */}
      <Section>
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-black text-slate-800">
            {content['home.pillars.title']}
          </h2>
          <p className="mx-auto max-w-2xl font-medium text-slate-500">
            {content['home.pillars.text']}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/enha-lak"
            className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-10 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <BookOpen className="h-7 w-7" />
            </span>
            <h3 className="mb-4 text-2xl font-bold text-violet-700">
              {content['home.pillar.enhaLak.title']}
            </h3>
            <p className="flex-1 leading-relaxed font-medium text-slate-600">
              {content['home.pillar.enhaLak.text']}
            </p>
            <span className="mt-6 font-bold text-violet-700 group-hover:underline">
              ادخل القسم ←
            </span>
          </Link>

          <Link
            href="/creative-writing"
            className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-10 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PenTool className="h-7 w-7" />
            </span>
            <h3 className="mb-4 text-2xl font-bold text-emerald-600">
              {content['home.pillar.writing.title']}
            </h3>
            <p className="flex-1 leading-relaxed font-medium text-slate-600">
              {content['home.pillar.writing.text']}
            </p>
            <span className="mt-6 font-bold text-emerald-700 group-hover:underline">
              ادخل القسم ←
            </span>
          </Link>
        </div>
      </Section>

      {/* قسم المدربين اتشال من الصفحة الرئيسية: صفحة المدربين نفسها
          بتعرضهم بتفاصيل أوفى، والرئيسية المفروض تقول الفكرة مش تعرض
          كل حاجة. */}

      {/* Featured Publishers */}
      <Section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">{content['home.publishers.title']}</h2>
            <p className="text-slate-500 font-medium max-w-2xl">{content['home.publishers.text']}</p>
          </div>
          <Button href="/enha-lak/library" variant="secondary" className="w-full md:w-auto">استكشف المكتبة</Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activePublishers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : activePublishers.map((publisher: any) => (
            <Link href={`/enha-lak/publisher/${publisher.slug}`} key={publisher.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col items-center text-center">
              <div className="mb-4 relative h-20 w-20 flex items-center justify-center">
                {publisher.logoUrl ? (
                  <Image 
                    src={optimizedImageUrl(publisher.logoUrl, 200)}
                    alt={publisher.name}
                    fill sizes="80px" className="object-contain"
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

      {/* رحلتنا في 3 خطوات — شرح الفكرة قبل ما نطلب من الزائر أي حاجة. */}
      <Section containerClassName="max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          {content['home.steps.title']}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { key: 'step1', icon: Search },
            { key: 'step2', icon: Wand2 },
            { key: 'step3', icon: Gift },
          ].map((step, index) => (
            <div key={step.key} className="text-center">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <step.icon className="h-8 w-8" />
              </span>
              <div className="mb-2 text-sm font-black text-amber-500">
                {index + 1}
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-800">
                {content[`home.${step.key}.title`]}
              </h3>
              <p className="leading-relaxed font-medium text-slate-600">
                {content[`home.${step.key}.text`]}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Our Story */}
      <Section containerClassName="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 p-0">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-64 lg:h-auto">
            {settings.images.homeFamily ? (
              <Image 
              src={slotImageUrl(settings.images.homeFamily, 'homeFamily')}
              alt="العائلة تقرأ معاً"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              placeholder={blurPlaceholder(settings.images.homeFamily) ? 'blur' : 'empty'}
              blurDataURL={blurPlaceholder(settings.images.homeFamily)}
              className="object-cover" referrerPolicy="no-referrer"
            />
            ) : (
              <ImagePlaceholder label="العائلة تقرأ معاً" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 lg:to-white"></div>
          </div>
          <div className="flex flex-col justify-center p-8 text-right md:p-12 lg:p-16">
            <h2 className="mb-8 text-3xl font-black text-slate-800">
              {content['home.story.title']}
            </h2>
            <RichText
              value={content['home.story.body']}
              className="mb-8 space-y-4 text-lg leading-relaxed font-medium text-slate-600"
            />
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
          {content['home.testimonials.title']}
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
          {content['home.blog.title']}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl font-medium text-slate-500">
          {content['home.blog.text']}
        </p>
        <Button href="/blog" variant="primary" accentColor="amber" className="!bg-slate-900 hover:!bg-slate-800">
          تصفح المدونة
        </Button>
      </Section>

      {/* Final CTA */}
      <Section containerClassName="max-w-4xl pb-20 text-center">
        <h2 className="mb-10 text-4xl font-black text-slate-900">
          {content['home.cta.title']}
        </h2>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button href="/enha-lak" variant="primary" accentColor="amber" size="lg" className="!bg-blue-600 hover:!bg-blue-700 !shadow-blue-200">
            {content['home.cta.button1']}
          </Button>
          <Button href="/creative-writing/booking" variant="primary" accentColor="amber" size="lg">
            {content['home.cta.button2']}
          </Button>
        </div>
      </Section>
    </div>
  );
}
