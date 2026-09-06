import { Heart, Users, Map, TrendingUp, PenTool, Image as ImageIcon, Mic } from 'lucide-react';

export default function JoinUsPage() {
  const reasons = [
    { title: 'ساهم في عمل له معنى', description: 'ساهم في قصص وتجارب تربوية حقيقية تصل إلى أطفال ويافعين وشباب.', icon: Heart, bg: 'bg-rose-50', color: 'text-rose-600' },
    { title: 'مجتمع متعدد الخبرات', description: 'اعمل مع كتّاب ومدربين ورسّامين وصنّاع محتوى وتربويين.', icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
    { title: 'مرونة في العمل', description: 'استمتع بحرية العمل عن بعد والمساهمة في الأوقات التي تناسبك.', icon: Map, bg: 'bg-amber-50', color: 'text-amber-600' },
    { title: 'فرص للتعلم والنمو', description: 'طوّر حرفتك داخل مشروع يطوّر أدواته ومحتواه باستمرار.', icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' }
  ];

  const roles = [
    { title: 'مدرب كتابة إبداعية', description: 'يعمل فرديًا مع الأطفال واليافعين والشباب، ويساعدهم على تطوير أدواتهم وصوتهم من دون أن يكتب بدلاً عنهم.', icon: PenTool },
    { title: 'رسام قصص أطفال', description: 'تحويل الكلمات إلى عوالم بصرية ساحرة، ورسم شخصيات تبقى في ذاكرة الأطفال.', icon: ImageIcon },
    { title: 'معلق صوتي', description: 'إعطاء حياة وشخصية للكلمات من خلال الأداء الصوتي للقصص المخصصة والمحتوى الصوتي.', icon: Mic }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          اصنع معنا تجارب تستحق أن تُحكى
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
          نبحث عن أشخاص يجمعون بين الحرفة والاهتمام بالإنسان: مدرّبين كتابة، ورسّامي قصص، ومتعاونين وأصوات، يساعدوننا على تقديم تجربة عربية عالية الجودة.
        </p>
      </section>

      {/* Why Join Us */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">لماذا تنضم إلى فريق "الرحلة"؟</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${reason.bg} ${reason.color} mb-6`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{reason.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-sm">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available Roles */}
      <section className="w-full max-w-5xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-16">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">الفرص المتاحة</h2>
        <div className="space-y-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start gap-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{role.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Application Form */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50">
          <h2 className="text-3xl font-black text-center mb-8 text-slate-800">نموذج التقديم</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الاسم</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="الاسم الكامل" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="example@email.com" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="رقم الهاتف مع رمز الدولة" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الدور المطلوب</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-slate-700">
                  <option value="" disabled selected>اختر الدور المناسب</option>
                  <option value="instructor">مدرب/ة في «بداية الرحلة»</option>
                  <option value="illustrator">رسام/ة لقصص «إنها لك»</option>
                  <option value="voiceover">معلق/ة صوتي/ة</option>
                  <option value="author">كاتب/ة قصص أطفال</option>
                  <option value="other">دور آخر</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">رابط معرض الأعمال (اختياري)</label>
              <input type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="https://" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الرسالة</label>
              <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium resize-none" placeholder="حدثنا عن نفسك وعن سبب رغبتك بالانضمام لنا..."></textarea>
            </div>

            <button type="button" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-colors">
              إرسال الطلب
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
