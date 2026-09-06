import { getInstructors } from '@/data/mock';
import { User, Award, CheckCircle } from 'lucide-react';

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          مدربو «بداية الرحلة»
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          فريق من الكُتّاب والتربويين المتخصصين في أدب الطفل واليافعين، يجمعون بين الشغف الإبداعي والقدرة على التوجيه بأسلوب داعم ومحفز.
        </p>
      </section>

      {/* Instructors Grid */}
      <section className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden">
              
              {instructor.isSample && (
                <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                  بيانات تجريبية
                </div>
              )}

              <div className="flex items-center gap-6 mb-6 mt-4">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{instructor.displayName}</h3>
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    <Award className="w-4 h-4" />
                    خبرة {instructor.yearsExperience} سنوات
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 font-medium text-base leading-relaxed mb-8 flex-1">
                {instructor.bio}
              </p>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">التخصصات:</h4>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
