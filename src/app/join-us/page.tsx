import { PageContainer } from '@/components/PageContainer';
import {
  Heart,
  Users,
  Map,
  TrendingUp,
  PenTool,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';

export default function JoinUsPage() {
  const reasons = [
    {
      title: 'ساهم في عمل له معنى',
      description:
        'ساهم في قصص وتجارب تربوية حقيقية تصل إلى أطفال ويافعين وشباب.',
      icon: Heart,
      bg: 'bg-rose-50',
      color: 'text-rose-600',
    },
    {
      title: 'مجتمع متعدد الخبرات',
      description: 'اعمل مع كتّاب ومدربين ورسّامين وصنّاع محتوى وتربويين.',
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      title: 'مرونة في العمل',
      description:
        'استمتع بحرية العمل عن بعد والمساهمة في الأوقات التي تناسبك.',
      icon: Map,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      title: 'فرص للتعلم والنمو',
      description: 'طوّر حرفتك داخل مشروع يطوّر أدواته ومحتواه باستمرار.',
      icon: TrendingUp,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
  ];

  const roles = [
    {
      title: 'مدرب كتابة إبداعية',
      description:
        'يعمل فرديًا مع الأطفال واليافعين والشباب، ويساعدهم على تطوير أدواتهم وصوتهم من دون أن يكتب بدلاً عنهم.',
      icon: PenTool,
    },
    {
      title: 'رسام قصص أطفال',
      description:
        'تحويل الكلمات إلى عوالم بصرية ساحرة، ورسم شخصيات تبقى في ذاكرة الأطفال.',
      icon: ImageIcon,
    },
    {
      title: 'معلق صوتي',
      description:
        'إعطاء حياة وشخصية للكلمات من خلال الأداء الصوتي للقصص المخصصة والمحتوى الصوتي.',
      icon: Mic,
    },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          اصنع معنا تجارب تستحق أن تُحكى
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          نبحث عن أشخاص يجمعون بين الحرفة والاهتمام بالإنسان: مدرّبين كتابة،
          ورسّامي قصص، ومتعاونين وأصوات، يساعدوننا على تقديم تجربة عربية عالية
          الجودة.
        </p>
      </section>

      {/* Why Join Us */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          لماذا تنضم إلى فريق "الرحلة"؟
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm"
              >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${reason.bg} ${reason.color} mb-6`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">
                  {reason.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-slate-600">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available Roles */}
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-100 bg-slate-50 p-8 md:p-16">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          الفرص المتاحة
        </h2>
        <div className="space-y-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:p-8"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-800">
                    {role.title}
                  </h3>
                  <p className="leading-relaxed font-medium text-slate-600">
                    {role.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Application Form */}
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 md:p-12">
          <h2 className="mb-8 text-center text-3xl font-black text-slate-800">
            نموذج التقديم
          </h2>
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  الاسم
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="رقم الهاتف مع رمز الدولة"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  الدور المطلوب
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                  <option value="" disabled selected>
                    اختر الدور المناسب
                  </option>
                  <option value="instructor">مدرب/ة في «بداية الرحلة»</option>
                  <option value="illustrator">رسام/ة لقصص «إنها لك»</option>
                  <option value="voiceover">معلق/ة صوتي/ة</option>
                  <option value="author">كاتب/ة قصص أطفال</option>
                  <option value="other">دور آخر</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                رابط معرض الأعمال (اختياري)
              </label>
              <input
                type="url"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="https://"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                الرسالة
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="حدثنا عن نفسك وعن سبب رغبتك بالانضمام لنا..."
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              إرسال الطلب
            </button>
          </form>
        </div>
      </section>
    </PageContainer>
  );
}
