import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/PageContainer';
import { ArrowLeft, User, Star, Award, BookOpen, MessageCircle } from 'lucide-react';
import { getInstructors } from '@/data/mock';
import { notFound } from 'next/navigation';

export default async function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const instructors = await getInstructors();
  const instructor = instructors.find(i => i.id === resolvedParams.id) || instructors[0];

  if (!instructor) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-5xl pt-12 pb-24">
        {/* Back link */}
        <Link href="/creative-writing/instructors" className="mb-8 inline-flex items-center gap-2 font-bold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          العودة للمدربين
        </Link>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="h-48 w-full bg-gradient-to-r from-emerald-100 via-teal-50 to-sky-100"></div>
          
          <div className="relative px-8 pb-12 sm:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="relative -mt-20 flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-lg overflow-hidden">
                   {instructor.avatarUrl ? (
                      <Image src={instructor.avatarUrl} alt={`صورة المدرب ${instructor.displayName}`} fill className="object-cover" referrerPolicy="no-referrer" priority />
                    ) : (
                      <User className="h-16 w-16 text-slate-300" />
                    )}
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl font-black text-slate-900">{instructor.displayName}</h1>
                  <p className="text-lg font-medium text-emerald-600 mt-1">{instructor.specialties[0] || "مدرب معتمد"}</p>
                </div>
              </div>
              <div className="mb-2 shrink-0">
                <Link
                  href="/creative-writing/booking"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-emerald-600"
                >
                  احجز جلسة الآن
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-12 lg:grid-cols-3">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h2 className="mb-4 text-2xl font-black text-slate-800 flex items-center gap-2">
                    <User className="h-6 w-6 text-emerald-500" />
                    النبذة الشخصية
                  </h2>
                  <p className="text-lg leading-relaxed font-medium text-slate-600">
                    {instructor.bio}
                  </p>
                  <p className="text-lg leading-relaxed font-medium text-slate-600 mt-4">
                    يمتلك خبرة واسعة في العمل مع الأطفال واليافعين، حيث يسعى دائماً لاكتشاف الصوت الداخلي لكل متدرب وتنميته من خلال ورش عمل تفاعلية وجلسات فردية تركز على بناء الثقة والخيال قبل التركيز على القواعد الصارمة للكتابة.
                  </p>
                </section>

                <section>
                  <h2 className="mb-4 text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Award className="h-6 w-6 text-emerald-500" />
                    الخبرات والمنهجية
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {[
                      'تطوير القصص التفاعلية',
                      'التحفيز الإبداعي للأطفال',
                      'كتابة السيناريو والقصة القصيرة',
                      'بناء شخصيات روائية معقدة',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                  <Star className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                  <div className="text-3xl font-black text-emerald-700">4.9/5</div>
                  <p className="font-bold text-emerald-600/80">تقييم المتدربين</p>
                </div>
                
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <div className="text-3xl font-black text-blue-700">+120</div>
                  <p className="font-bold text-blue-600/80">جلسة استشارية</p>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                  <h3 className="mb-4 text-lg font-bold text-slate-800">التخصص العمري</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 shadow-sm border border-slate-200">الأطفال (6-12)</span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 shadow-sm border border-slate-200">اليافعين (13-17)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageContainer>
  );
}
