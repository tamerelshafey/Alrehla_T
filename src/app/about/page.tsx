import { Sparkles, Target, Compass, HeartHandshake, Lightbulb, ShieldCheck, UserCheck, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { title: 'الأصالة', description: 'محتوى عربي أصيل يحافظ على الهوية', icon: Compass, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'الإبداع', description: 'حلول مبتكرة تواكب العصر', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'الجودة', description: 'معايير عالية في كل ما نقدم', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'التخصيص', description: 'كل طفل فريد ويستحق محتوى خاص', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'الشمولية', description: 'خدماتنا للجميع بغض النظر عن الخلفية', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
          عن المنصة
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          رحلتنا: تبدأ بالأمان وتقودها القيم
        </h1>
      </section>

      {/* The Spark */}
      <section className="w-full max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800">الشرارة</h2>
            <p className="text-slate-600 font-medium leading-relaxed text-lg">
              في ظل تسارع الرقمنة وتدفّق المحتوى من حولنا، ازدادت حاجتنا إلى تجارب لا يضيع فيها الإنسان وسط ما يقرأ ويشاهد. ومن هنا انطلقت الشرارة: أن نوظّف الرقمنة لتقريب الحكاية من صاحبها، لا لإبعاده عنها؛ فيكون حاضرًا فيها باسمه وصوته واختياراته، مرةً حين تصل إليه حكاية تحمل شيئًا منه، ومرةً حين تنطلق الحكاية من داخله.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">الرسالة</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed text-lg">
            نصمّم ونقدّم بالعربية قصصًا ومنتجات مخصّصة وتجارب كتابة فردية آمنة لمختلف الأعمار؛ ليكون كل فرد جزءًا من الحكاية، أو تنطلق الحكاية من صوته وأفكاره، ضمن تجربة تحترم اختياراته وتدعم تعبيره ونموه.
          </p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">الرؤية</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed text-lg">
            أن تكون منصة «الرحلة» وجهة عربية رائدة لتجارب الحكاية والكتابة الآمنة والشخصية، يجد فيها كل فرد مساحةً يرى فيها نفسه، ويعبّر عن صوته، ويواصل نموه.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">قيمنا الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${index > 2 ? 'md:col-span-1.5' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value.bg} ${value.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{value.title}</h3>
                <p className="text-slate-500 font-medium">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
