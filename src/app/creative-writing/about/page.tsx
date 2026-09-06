import { Sparkles, PenTool, Heart } from 'lucide-react';

export default function AboutProgramPage() {
  const features = [
    {
      title: 'الإلهام أولاً',
      description: 'نبدأ بإشعال شرارة الفضول والخيال قبل الخوض في تقنيات الكتابة المعقدة.',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'الممارسة تصنع المبدع',
      description: 'نؤمن أن الكتابة مهارة تنمو بالتجربة والمحاولة المستمرة أكثر من التنظير.',
      icon: PenTool,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'الثقة هي المفتاح',
      description: 'نبني مساحة آمنة تمنح المشارك الثقة بصوته وقدراته دون خوف من الخطأ.',
      icon: Heart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          عن «بداية الرحلة»
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          الكتابة مساحة للتعبير والنمو
        </p>
      </section>

      {/* Why Us Section */}
      <section className="w-full max-w-5xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-16">
        <h2 className="text-3xl font-black text-center mb-8 text-slate-800">لماذا «بداية الرحلة»؟</h2>
        <p className="text-lg text-slate-600 text-center font-medium max-w-2xl mx-auto mb-12">
          لأن الكتابة أكثر من مهمة مدرسية: يمكن أن تكون مساحة للتفكير والتجريب وصناعة المعنى.
        </p>
        <div className="space-y-6">
          {[
            'مساحة تحتفي بالمحاولة، وتتعامل مع الخطأ باعتباره جزءًا طبيعيًا من التعلم.',
            'جلسات فردية تتيح اهتمامًا مركزًا بالمشارك واحتياجاته.',
            'تجربة تتكيف مع العمر والعلاقة الحالية بالكتابة والاهتمامات.'
          ].map((point, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
              <p className="text-slate-700 font-medium text-lg leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Distinctive Features */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">ما الذي يميزنا؟</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color} mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
